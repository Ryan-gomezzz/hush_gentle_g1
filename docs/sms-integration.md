# SMS Integration Guide

This document outlines the recommended approach for integrating SMS notifications into the Hush Gentle e-commerce platform.

## Overview

SMS notifications can be sent to customers for important order updates such as:
- Order confirmation
- Order shipped
- Order delivered
- Payment confirmations
- Delivery reminders

## Recommended Providers

### 1. Twilio (Recommended for International)
- **Pros**: Reliable, global coverage, excellent documentation, easy integration
- **Cons**: Can be expensive for high volume
- **Best for**: International shipping, premium service
- **Website**: https://www.twilio.com

### 2. AWS SNS (Recommended for Scalability)
- **Pros**: Highly scalable, pay-as-you-go, integrates well with AWS infrastructure
- **Cons**: Requires AWS account setup, more complex initial setup
- **Best for**: High volume, existing AWS infrastructure
- **Website**: https://aws.amazon.com/sns/

### 3. TextLocal (Recommended for India)
- **Pros**: Cost-effective for India, good delivery rates, easy integration
- **Cons**: Primarily for Indian numbers
- **Best for**: India-focused businesses
- **Website**: https://www.textlocal.in/

### 4. MSG91 (Alternative for India)
- **Pros**: Good for Indian market, competitive pricing
- **Cons**: Limited international support
- **Best for**: India-focused businesses
- **Website**: https://msg91.com/

## Implementation Approach

### Step 1: Choose a Provider

Based on your primary market:
- **International**: Use Twilio
- **India**: Use TextLocal or MSG91
- **High Volume/AWS**: Use AWS SNS

### Step 2: Environment Variables

Add the following environment variables to your `.env.local`:

```env
# SMS Provider Configuration
SMS_PROVIDER=twilio  # or 'textlocal', 'aws-sns', 'msg91'
SMS_ENABLED=true

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# TextLocal Configuration
TEXTLOCAL_API_KEY=your_api_key
TEXTLOCAL_SENDER_ID=HUSHGT

# AWS SNS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### Step 3: Install Required Packages

```bash
# For Twilio
npm install twilio

# For AWS SNS
npm install @aws-sdk/client-sns

# For TextLocal (use fetch/axios)
# No additional package needed
```

### Step 4: Create SMS Service

Create `lib/services/sms.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase-server'

interface SMSOptions {
    to: string
    message: string
    orderId?: string
}

export async function sendSMS({ to, message, orderId }: SMSOptions) {
    if (process.env.SMS_ENABLED !== 'true') {
        console.log('SMS disabled, would send:', { to, message })
        return { success: false, message: 'SMS disabled' }
    }

    const provider = process.env.SMS_PROVIDER || 'twilio'

    try {
        switch (provider) {
            case 'twilio':
                return await sendViaTwilio(to, message)
            case 'textlocal':
                return await sendViaTextLocal(to, message)
            case 'aws-sns':
                return await sendViaAWSSNS(to, message)
            default:
                throw new Error(`Unknown SMS provider: ${provider}`)
        }
    } catch (error: any) {
        console.error('SMS send error:', error)
        return { success: false, error: error.message }
    }
}

async function sendViaTwilio(to: string, message: string) {
    const twilio = require('twilio')
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    )

    const result = await client.messages.create({
        body: message,
        to: to,
        from: process.env.TWILIO_PHONE_NUMBER,
    })

    return { success: true, messageId: result.sid }
}

async function sendViaTextLocal(to: string, message: string) {
    const response = await fetch('https://api.textlocal.in/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apikey: process.env.TEXTLOCAL_API_KEY,
            numbers: to,
            message: message,
            sender: process.env.TEXTLOCAL_SENDER_ID,
        }),
    })

    const data = await response.json()
    return { success: data.status === 'success', messageId: data.batch_id }
}

async function sendViaAWSSNS(to: string, message: string) {
    const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
    const client = new SNSClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    })

    const command = new PublishCommand({
        PhoneNumber: to,
        Message: message,
    })

    const result = await client.send(command)
    return { success: true, messageId: result.MessageId }
}
```

### Step 5: Message Templates

Create `lib/services/sms-templates.ts`:

```typescript
export function getOrderConfirmationSMS(orderNumber: string, customerName: string) {
    return `Hi ${customerName}, your order ${orderNumber} has been confirmed! We'll notify you when it ships. Thank you for shopping with Hush Gentle!`
}

export function getOrderShippedSMS(orderNumber: string, trackingNumber?: string) {
    const tracking = trackingNumber ? ` Track: ${trackingNumber}` : ''
    return `Your order ${orderNumber} has been shipped!${tracking} Expected delivery in 3-7 days. Thank you for shopping with Hush Gentle!`
}

export function getOrderDeliveredSMS(orderNumber: string) {
    return `Your order ${orderNumber} has been delivered! We hope you love your purchase. Thank you for choosing Hush Gentle!`
}
```

### Step 6: Integrate with Order Workflow

Update `lib/actions/orders.ts` and `lib/actions/admin.ts` to send SMS on status changes:

```typescript
// In createOrder function
import { sendSMS } from '@/lib/services/sms'
import { getOrderConfirmationSMS } from '@/lib/services/sms-templates'

// After order creation
if (shippingDetails?.phone) {
    await sendSMS({
        to: shippingDetails.phone,
        message: getOrderConfirmationSMS(orderNumber, shippingDetails.fullName),
        orderId: order.id,
    }).catch(console.error) // Don't fail order if SMS fails
}

// In updateOrderStatus function
import { getOrderShippedSMS, getOrderDeliveredSMS } from '@/lib/services/sms-templates'

if (status === 'shipped' && order.tracking_number) {
    // Send shipped SMS
} else if (status === 'delivered') {
    // Send delivered SMS
}
```

## Implementation Checklist

- [ ] Choose SMS provider based on market
- [ ] Set up account with chosen provider
- [ ] Add environment variables
- [ ] Install required packages
- [ ] Create SMS service file
- [ ] Create message templates
- [ ] Integrate with order creation
- [ ] Integrate with order status updates
- [ ] Test SMS delivery
- [ ] Add error handling and logging
- [ ] Update admin settings page to show SMS status
- [ ] Add SMS opt-in/opt-out in user settings

## Cost Considerations

- **Twilio**: ~$0.0075 per SMS (varies by country)
- **TextLocal**: ~₹0.20-0.50 per SMS in India
- **AWS SNS**: ~$0.00645 per SMS (varies by region)
- **MSG91**: ~₹0.15-0.30 per SMS in India

## Best Practices

1. **Opt-in/Opt-out**: Always get user consent before sending SMS
2. **Rate Limiting**: Don't send too many SMS in a short time
3. **Error Handling**: SMS failures shouldn't break order processing
4. **Logging**: Log all SMS attempts for debugging
5. **Testing**: Test with your own phone number first
6. **Compliance**: Follow local SMS regulations (e.g., DNC lists in India)

## Testing

1. Set `SMS_ENABLED=true` in development
2. Use test phone numbers provided by your SMS provider
3. Test all message templates
4. Verify delivery in different scenarios
5. Test error handling (invalid numbers, provider errors)

## Support

For issues or questions:
- Check provider documentation
- Review error logs in application
- Contact provider support if needed

