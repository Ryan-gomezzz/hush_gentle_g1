import { createClient } from '@/lib/supabase-server'
import { hasAnalyticsConsent } from '@/lib/actions/user'

export async function trackEvent(userId: string | undefined | null, eventName: string, metadata: any = {}) {
    try {
        // DPDP Compliance: Check user consent before tracking
        if (userId) {
            const hasConsent = await hasAnalyticsConsent()
            if (!hasConsent) {
                // User has not consented, don't track
                return
            }
        }

        const supabase = createClient()
        await supabase.from('analytics_events').insert({
            user_id: userId || null,
            event_name: eventName,
            metadata: metadata
        })
    } catch (e) {
        // Analytics should not break the app
        console.error('Analytics error:', e)
    }
}

/**
 * Track page view - call from client component
 */
export async function trackPageView(path: string, metadata: any = {}) {
    try {
        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: 'page_view',
                path,
                metadata,
            }),
        })
        if (!response.ok) {
            console.error('Failed to track page view')
        }
    } catch (e) {
        // Analytics should not break the app
        console.error('Analytics error:', e)
    }
}

/**
 * Server-side page view tracking
 */
export async function trackPageViewServer(userId: string | undefined | null, path: string, metadata: any = {}) {
    await trackEvent(userId, 'page_view', { path, ...metadata })
}