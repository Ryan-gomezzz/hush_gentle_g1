'use server'

import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCart } from '@/lib/actions/cart'
import { trackEvent } from '@/lib/analytics'

/**
 * Generate order ID in format: HG-YYYYMMDD-####
 */
function generateOrderId(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `HG-${dateStr}-${random}`
}

export async function createOrder(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }
    
    // Get cart using the new getCart function
    const cart = await getCart()

    if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty')
    }

    // 1. Validate stock and recalculate prices (security)
    const validatedItems = []
    let totalAmount = 0

    for (const item of cart.items) {
        // Fetch fresh product data from database
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, price, stock, name')
            .eq('id', item.product_id)
            .single()

        if (productError || !product) {
            throw new Error(`Product ${item.product.name || item.product_id} no longer available`)
        }

        // Validate stock
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`)
        }

        // Use server-side price (security: prevent price manipulation)
        const itemTotal = Number(product.price) * item.quantity
        totalAmount += itemTotal

        validatedItems.push({
            product_id: product.id,
            quantity: item.quantity,
            price_at_purchase: Number(product.price),
            product_name: product.name,
            stock: product.stock,
        })
    }

    if (totalAmount <= 0) {
        throw new Error('Invalid order total')
    }

    const paymentMethod = (formData.get('paymentMethod') as string) || 'cod'

    // Validate and sanitize shipping details
    const fullName = (formData.get('fullName') as string)?.trim() || ''
    const address = (formData.get('address') as string)?.trim() || ''
    const city = (formData.get('city') as string)?.trim() || ''
    const zip = (formData.get('zip') as string)?.trim() || ''
    const email = (formData.get('email') as string)?.trim().toLowerCase() || ''

    // Validate required fields
    if (!fullName || !address || !email || !city || !zip) {
        throw new Error('Please fill in all required shipping details')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address')
    }

    // Validate payment method
    const validPaymentMethods = ['cod', 'stripe', 'razorpay']
    if (!validPaymentMethods.includes(paymentMethod)) {
        throw new Error('Invalid payment method')
    }

    const shippingDetails = {
        fullName: fullName.slice(0, 200), // Limit length
        address: address.slice(0, 500),
        city: city.slice(0, 100),
        zip: zip.slice(0, 20),
        email: email.slice(0, 255),
        payment_method: paymentMethod,
    }

    // 2. Create Order with generated order ID
    const orderNumber = generateOrderId()
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            total_amount: totalAmount,
            status: 'pending',
            shipping_details: shippingDetails,
            payment_intent_id: orderNumber, // Store order number here temporarily
        })
        .select()
        .single()

    if (orderError || !order) {
        console.error('Order creation failed:', orderError)
        throw new Error('Failed to create order')
    }

    // Update order with proper order number format (store in metadata or use a separate field)
    // For now, we'll use the order ID in the success page

    // 3. Create Order Items and update stock
    const orderItems = validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        console.error('Order items failed:', itemsError)
        // Rollback: delete order
        await supabase.from('orders').delete().eq('id', order.id)
        throw new Error('Failed to create order items')
    }

    // 3.5 Create a payment record for COD (manual payment)
    await supabase
        .from('payments')
        .insert({
            order_id: order.id,
            provider: 'manual',
            status: 'pending',
            amount: totalAmount,
            transaction_id: null,
            metadata: { method: paymentMethod },
        })

    // 4. Update product stock
    for (const item of validatedItems) {
        const newStock = item.stock - item.quantity
        await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)
    }

    // 5. Mark chatbot sessions as converted (if user had any active sessions)
    if (user?.id) {
        await supabase
            .from('chatbot_sessions')
            .update({ converted: true })
            .eq('user_id', user.id)
            .eq('converted', false)
            .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()) // Last 48 hours
    }

    // 6. Track analytics
    await trackEvent(user?.id, 'checkout_completed', {
        order_id: order.id,
        total_amount: totalAmount,
        item_count: validatedItems.length,
    })

    // 7. Send emails (non-blocking)
    const { sendOrderConfirmation, sendOrderAlert } = await import('@/lib/actions/emails')
    Promise.all([
        sendOrderConfirmation(order.id),
        sendOrderAlert(order.id),
    ]).catch((error) => {
        console.error('Email send error:', error)
        // Don't fail the order if email fails
    })

    // 8. Clear Cart
    await supabase.from('carts').delete().eq('id', cart.id)
    cookies().delete('cartId')

    // 9. Redirect to success
    redirect(`/checkout/success?orderId=${order.id}`)
}

/**
 * Get orders for the current logged-in user
 * Returns empty array if user is not logged in
 */
export async function getUserOrders() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            total_amount,
            created_at,
            shipping_details,
            items:order_items(
                id,
                quantity,
                price_at_purchase,
                product:products(
                    id,
                    name,
                    slug,
                    images
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user orders:', error)
        return []
    }

    return orders || []
}
