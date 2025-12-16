import { z } from 'zod'

/**
 * Validation schemas for API routes and server actions
 */

export const analyticsEventSchema = z.object({
    event_name: z.string().min(1).max(100),
    path: z.string().max(500).optional(),
    metadata: z.record(z.any()).optional(),
    location: z.object({
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
    }).optional(),
})

export const chatbotMessageSchema = z.object({
    message: z.string().min(1).max(2000).trim(),
    sessionId: z.string().uuid().optional(),
})

export const addressSchema = z.object({
    full_name: z.string().min(1).max(200).trim(),
    email: z.string().email().max(255),
    phone: z.string().max(20).optional(),
    address: z.string().min(1).max(500).trim(),
    city: z.string().min(1).max(100).trim(),
    state: z.string().max(100).trim().optional(),
    zip_code: z.string().min(1).max(20).trim(),
    type: z.enum(['delivery', 'billing']),
    is_default: z.boolean().optional(),
})

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim()
        .slice(0, 10000) // Limit length
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): string {
    const emailSchema = z.string().email().max(255)
    return emailSchema.parse(email.trim().toLowerCase())
}

/**
 * Validate UUID
 */
export function validateUUID(id: string): string {
    const uuidSchema = z.string().uuid()
    return uuidSchema.parse(id)
}

