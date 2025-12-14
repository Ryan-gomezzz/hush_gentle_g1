'use client'

import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'

export default function CheckoutTracker() {
    useEffect(() => {
        trackPageView('/checkout', { event_name: 'checkout_started' })
    }, [])

    return null
}

