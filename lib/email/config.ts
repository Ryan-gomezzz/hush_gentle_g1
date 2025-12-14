/**
 * Email configuration - supports multiple providers
 * Set environment variables for your chosen provider
 */

export type EmailProvider = 'resend'

export interface EmailConfig {
    provider: EmailProvider
    fromEmail: string
    fromName?: string
}

export function getEmailConfig(): EmailConfig {
    // Check for Resend (preferred for simplicity)
    if (process.env.RESEND_API_KEY) {
        return {
            provider: 'resend',
            fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@hushgentle.com',
            fromName: 'Hush Gentle',
        }
    }

    // Default to Resend format (but will fail if no API key)
    return {
        provider: 'resend',
        fromEmail: 'noreply@hushgentle.com',
        fromName: 'Hush Gentle',
    }
}

export function isEmailConfigured(): boolean {
    return !!process.env.RESEND_API_KEY
}

