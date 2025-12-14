/**
 * Email sender - provider-agnostic email sending
 */

import { getEmailConfig, isEmailConfigured, type EmailProvider } from './config'

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
        switch (config.provider) {
            case 'resend':
                return await sendViaResend(options, config)
            case 'sendgrid':
                return await sendViaSendGrid(options, config)
            case 'smtp':
                return await sendViaSMTP(options, config)
            default:
                console.error('Unknown email provider')
                return false
        }
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}

async function sendViaResend(options: EmailOptions, config: any): Promise<boolean> {
    try {
        // Dynamic import to avoid build-time dependency
        // @ts-ignore - Optional dependency, may not be installed
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

async function sendViaSendGrid(options: EmailOptions, config: any): Promise<boolean> {
    try {
        // Dynamic import to avoid build-time dependency
        // @ts-ignore - Optional dependency, may not be installed
        const sgMail = await import('@sendgrid/mail')
        sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!)

        const msg = {
            to: options.to,
            from: {
                email: config.fromEmail,
                name: config.fromName || 'Hush Gentle',
            },
            subject: options.subject,
            html: options.html,
            text: options.text,
        }

        await sgMail.default.send(msg)
        return true
    } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('SendGrid package not installed. Run: npm install @sendgrid/mail')
        } else {
            console.error('SendGrid error:', error.response?.body || error)
        }
        return false
    }
}

async function sendViaSMTP(options: EmailOptions, config: any): Promise<boolean> {
    try {
        // Dynamic import to avoid build-time dependency
        // @ts-ignore - Optional dependency, may not be installed
        const nodemailer = await import('nodemailer')

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: `"${config.fromName || 'Hush Gentle'}" <${config.fromEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        })
        return true
    } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('Nodemailer package not installed. Run: npm install nodemailer')
        } else {
            console.error('SMTP error:', error)
        }
        return false
    }
}

