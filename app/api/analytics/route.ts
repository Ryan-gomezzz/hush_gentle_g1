import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { trackEvent } from '@/lib/analytics'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { event_name, path, metadata } = body

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        await trackEvent(user?.id, event_name, { path, ...metadata })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}

