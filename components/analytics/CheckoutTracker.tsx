'use client'

import { useEffect } from 'react'

export default function CheckoutTracker() {
    useEffect(() => {
        // Client-side checkout tracking via API route
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: 'checkout_started',
                path: '/checkout',
            }),
        }).catch(() => {
            // Silently fail - analytics should not break the app
        })
    }, [])

    return null
}

