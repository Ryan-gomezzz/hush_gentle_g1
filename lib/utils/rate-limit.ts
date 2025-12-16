/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
    [key: string]: {
        count: number
        resetTime: number
    }
}

const store: RateLimitStore = {}

/**
 * Rate limit check
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute default
): boolean {
    const now = Date.now()
    const key = identifier

    if (!store[key] || now > store[key].resetTime) {
        // Create new window
        store[key] = {
            count: 1,
            resetTime: now + windowMs,
        }
        return true
    }

    if (store[key].count >= maxRequests) {
        return false
    }

    store[key].count++
    return true
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(
    identifier: string,
    maxRequests: number = 10
): number {
    const key = identifier
    if (!store[key]) {
        return maxRequests
    }
    return Math.max(0, maxRequests - store[key].count)
}

/**
 * Clear rate limit for an identifier (useful for testing)
 */
export function clearRateLimit(identifier: string): void {
    delete store[identifier]
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
        if (now > store[key].resetTime) {
            delete store[key]
        }
    })
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}

