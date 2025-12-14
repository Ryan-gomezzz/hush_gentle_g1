'use server'

import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createOrder(formData: FormData) {
    const supabase = createClient()
    const cookieStore = cookies()
    const cartId = cookieStore.get('cartId')?.value

    if (!cartId) {
        throw new Error('No cart found')
    }

    // 1. Get Cart Items
    const { data: cart } = await supabase
        .from('carts')
        .select('*, items:cart_items(*, product:products(*))')
        .eq('id', cartId)
        .single()

    if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty')
    }

    const shippingDetails = {
        fullName: formData.get('fullName'),
        address: formData.get('address'),
        city: formData.get('city'),
        zip: formData.get('zip'),
        email: formData.get('email'),
    }

    const totalAmount = cart.items.reduce((acc: number, item: any) => {
        return acc + (item.product.price * item.quantity)
    }, 0)

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: cart.user_id, // Might be null for guest
            total_amount: totalAmount,
            status: 'pending',
            shipping_details: shippingDetails,
        })
        .select()
        .single()

    if (orderError || !order) {
        console.error('Order creation failed:', orderError)
        throw new Error('Failed to create order')
    }

    // 3. Create Order Items
    const orderItems = cart.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        console.error('Order items failed:', itemsError)
        // Ideally rollback order here
        throw new Error('Failed to create order items')
    }

    // 4. Clear Cart
    await supabase.from('carts').delete().eq('id', cartId)
    cookies().delete('cartId')

    // 5. Redirect to success
    redirect(`/checkout/success?orderId=${order.id}`)
}
