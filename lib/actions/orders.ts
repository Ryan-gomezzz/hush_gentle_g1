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

    const shippingDetails = {
        fullName: formData.get('fullName') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        zip: formData.get('zip') as string,
        email: formData.get('email') as string,
        payment_method: paymentMethod,
    }

    // Validate shipping details
    if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.email) {
        throw new Error('Please fill in all required shipping details')
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

    // 5. Track analytics
    await trackEvent(user?.id, 'checkout_completed', {
        order_id: order.id,
        total_amount: totalAmount,
        item_count: validatedItems.length,
    })

    // 6. Send emails (non-blocking)
    const { sendOrderConfirmation, sendOrderAlert } = await import('@/lib/actions/emails')
    Promise.all([
        sendOrderConfirmation(order.id),
        sendOrderAlert(order.id),
    ]).catch((error) => {
        console.error('Email send error:', error)
        // Don't fail the order if email fails
    })

    // 7. Clear Cart
    await supabase.from('carts').delete().eq('id', cart.id)
    cookies().delete('cartId')

    // 7. Redirect to success
    redirect(`/checkout/success?orderId=${order.id}`)
}
