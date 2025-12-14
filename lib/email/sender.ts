/**
 * Email sender - provider-agnostic email sending
 */

import { getEmailConfig, isEmailConfigured } from './config'

export interface EmailOptions {
    to: string
    subject: string
    html: string
    text: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    if (!isEmailConfigured()) {
        console.warn('Email not configured - skipping send')
        return false
    }

    const config = getEmailConfig()

    try {
        // Resend-only for now (keeps build stable and minimal deps).
        return await sendViaResend(options, config)
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}

async function sendViaResend(options: EmailOptions, config: any): Promise<boolean> {
    try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { error } = await resend.emails.send({
            from: `${config.fromName || 'Hush Gentle'} <${config.fromEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        })

        if (error) {
            console.error('Resend error:', error)
            return false
        }

        return true
    } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('Resend package not installed. Run: npm install resend')
        } else {
            console.error('Resend error:', error)
        }
        return false
    }
}

