'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageViewTracker() {
    const pathname = usePathname()

    useEffect(() => {
        if (pathname) {
            // Client-side page view tracking via API route
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: 'page_view',
                    path: pathname,
                }),
            }).catch(() => {
                // Silently fail - analytics should not break the app
            })
        }
    }, [pathname])

    return null
}

