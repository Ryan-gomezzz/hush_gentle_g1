import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { trackEvent } from '@/lib/analytics'
import { analyticsEventSchema } from '@/lib/utils/validation'
import { checkRateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: 100 requests per minute per user/IP
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        const identifier = user?.id || ip
        if (!checkRateLimit(identifier, 100, 60000)) {
            return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
        }

        // Validate input
        const body = await request.json()
        const validationResult = analyticsEventSchema.safeParse(body)
        
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data' },
                { status: 400 }
            )
        }

        const { event_name, path, metadata, location } = validationResult.data

        // Include location in metadata if provided
        const eventMetadata = {
            path,
            ...metadata,
            ...(location && { location }),
        }

        await trackEvent(user?.id, event_name, eventMetadata)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}

