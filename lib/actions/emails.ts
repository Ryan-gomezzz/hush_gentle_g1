'use server'

import { sendEmail } from '@/lib/email/sender'
import { getOrderConfirmationEmail, getOrderAlertEmail, getPaymentFailedEmail } from '@/lib/email/templates'
import { createClient } from '@/lib/supabase-server'
import type { OrderConfirmationData, OrderAlertData } from '@/lib/email/templates'

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(orderId: string) {
    const supabase = createClient()
    
    // Get order with items
    const { data: order } = await supabase
        .from('orders')
        .select(`
            id,
            shipping_details,
            total_amount,
            items:order_items(
                quantity,
                price_at_purchase,
                product:products(name)
            )
        `)
        .eq('id', orderId)
        .single()

    if (!order || !order.shipping_details) {
        console.error('Order not found or missing shipping details')
        return false
    }

    const shippingDetails = order.shipping_details as any
    const email = shippingDetails.email

    if (!email) {
        console.error('No email in shipping details')
        return false
    }

    // Generate order number (HG-YYYYMMDD-####)
    const date = new Date(order.created_at || new Date())
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = `HG-${dateStr}-${orderId.slice(0, 4).toUpperCase()}`

    const orderData: OrderConfirmationData = {
        orderId: order.id,
        orderNumber,
        customerName: shippingDetails.fullName || 'Customer',
        items: order.items.map((item: any) => ({
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: Number(item.price_at_purchase),
        })),
        totalAmount: Number(order.total_amount),
        shippingAddress: {
            fullName: shippingDetails.fullName || '',
            address: shippingDetails.address || '',
            city: shippingDetails.city || '',
            zip: shippingDetails.zip || '',
        },
    }

    const emailContent = getOrderConfirmationEmail(orderData)

    return await sendEmail({
        to: email,
        ...emailContent,
    })
}

/**
 * Send order alert email to admin
 */
export async function sendOrderAlert(orderId: string) {
    const supabase = createClient()
    
    // Get admin email (first admin user)
    const { data: admin } = await supabase
        .from('profiles')
        .select('email')
        .eq('is_admin', true)
        .limit(1)
        .single()

    if (!admin?.email) {
        console.warn('No admin email found for order alert')
        return false
    }

    // Get order details
    const { data: order } = await supabase
        .from('orders')
        .select(`
            id,
            shipping_details,
            total_amount,
            items:order_items(quantity)
        `)
        .eq('id', orderId)
        .single()

    if (!order) {
        console.error('Order not found')
        return false
    }

    const shippingDetails = order.shipping_details as any
    const date = new Date(order.created_at || new Date())
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = `HG-${dateStr}-${orderId.slice(0, 4).toUpperCase()}`

    const alertData: OrderAlertData = {
        orderId: order.id,
        orderNumber,
        customerName: shippingDetails?.fullName || 'Guest',
        customerEmail: shippingDetails?.email || 'No email',
        totalAmount: Number(order.total_amount),
        itemCount: order.items?.length || 0,
    }

    const emailContent = getOrderAlertEmail(alertData)

    return await sendEmail({
        to: admin.email,
        ...emailContent,
    })
}

/**
 * Send payment failed email to customer
 */
export async function sendPaymentFailedEmail(orderId: string) {
    const supabase = createClient()
    
    const { data: order } = await supabase
        .from('orders')
        .select('shipping_details')
        .eq('id', orderId)
        .single()

    if (!order || !order.shipping_details) {
        return false
    }

    const shippingDetails = order.shipping_details as any
    const email = shippingDetails.email
    const customerName = shippingDetails.fullName || 'Customer'

    if (!email) {
        return false
    }

    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = `HG-${dateStr}-${orderId.slice(0, 4).toUpperCase()}`

    const emailContent = getPaymentFailedEmail(customerName, orderNumber)

    return await sendEmail({
        to: email,
        ...emailContent,
    })
}

