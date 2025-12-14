/**
 * Email templates for Hush Gentle
 */

export interface OrderConfirmationData {
    orderId: string
    orderNumber: string
    customerName: string
    items: Array<{
        name: string
        quantity: number
        price: number
    }>
    totalAmount: number
    shippingAddress: {
        fullName: string
        address: string
        city: string
        zip: string
    }
}

export interface OrderAlertData {
    orderId: string
    orderNumber: string
    customerName: string
    customerEmail: string
    totalAmount: number
    itemCount: number
}

export function getOrderConfirmationEmail(data: OrderConfirmationData) {
    const itemsHtml = data.items
        .map(
            (item) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
    `
        )
        .join('')

    return {
        subject: `Order Confirmed - ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background-color: #87a96b; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 400;">Hush Gentle</h1>
        </div>
        <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Thank you for your order, ${data.customerName}!</h2>
            <p style="color: #6b7280;">Your order <strong>${data.orderNumber}</strong> has been confirmed and we're preparing it for shipment.</p>
            
            <div style="margin: 30px 0;">
                <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f9fafb;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Total:</td>
                            <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">₹${data.totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px;">
                <h3 style="color: #374151; font-size: 18px; margin-top: 0;">Shipping Address</h3>
                <p style="color: #6b7280; margin: 5px 0;">
                    ${data.shippingAddress.fullName}<br>
                    ${data.shippingAddress.address}<br>
                    ${data.shippingAddress.city} ${data.shippingAddress.zip}
                </p>
            </div>

            <p style="color: #6b7280; margin-top: 30px;">We'll send you a tracking number once your order ships. If you have any questions, please don't hesitate to reach out.</p>
            
            <p style="color: #6b7280; margin-top: 20px;">With gentle care,<br>The Hush Gentle Team</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Thank you for your order, ${data.customerName}!

Your order ${data.orderNumber} has been confirmed.

Order Details:
${data.items.map((item) => `- ${item.name} x ${item.quantity} - ₹${item.price.toFixed(2)}`).join('\n')}

Total: ₹${data.totalAmount.toFixed(2)}

Shipping Address:
${data.shippingAddress.fullName}
${data.shippingAddress.address}
${data.shippingAddress.city} ${data.shippingAddress.zip}

We'll send you a tracking number once your order ships.

With gentle care,
The Hush Gentle Team
        `.trim(),
    }
}

export function getOrderAlertEmail(data: OrderAlertData) {
    return {
        subject: `New Order Received - ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">New Order Received</h2>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
        <p><strong>Total Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>
        <p><strong>Items:</strong> ${data.itemCount}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/orders/${data.orderId}">View Order Details</a></p>
    </div>
</body>
</html>
        `,
        text: `
New Order Received

Order Number: ${data.orderNumber}
Customer: ${data.customerName} (${data.customerEmail})
Total Amount: ₹${data.totalAmount.toFixed(2)}
Items: ${data.itemCount}

View order: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/orders/${data.orderId}
        `.trim(),
    }
}

export function getPaymentFailedEmail(customerName: string, orderNumber: string) {
    return {
        subject: `Payment Issue - Order ${orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">Payment Issue</h2>
        <p>Dear ${customerName},</p>
        <p>We encountered an issue processing payment for your order <strong>${orderNumber}</strong>.</p>
        <p>Please check your payment method and try again, or contact us if you need assistance.</p>
        <p>With gentle care,<br>The Hush Gentle Team</p>
    </div>
</body>
</html>
        `,
        text: `
Payment Issue

Dear ${customerName},

We encountered an issue processing payment for your order ${orderNumber}.

Please check your payment method and try again, or contact us if you need assistance.

With gentle care,
The Hush Gentle Team
        `.trim(),
    }
}

