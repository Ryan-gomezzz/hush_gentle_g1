import { createClient } from '@/lib/supabase-server'

export async function trackEvent(userId: string | undefined | null, eventName: string, metadata: any = {}) {
    try {
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
