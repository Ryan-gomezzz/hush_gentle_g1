'use client'

import { useEffect, useState } from 'react'

export default function GeoLocationTracker() {
  const [hasRequested, setHasRequested] = useState(false)

  useEffect(() => {
    // DPDP Compliance: Check for explicit consent before requesting location
    // Only request once per session
    if (hasRequested || typeof window === 'undefined') return

    // Check if user has explicitly consented to location tracking
    const locationConsent = localStorage.getItem('location_tracking_consent')
    if (locationConsent !== 'true') {
      // User has not consented, don't request location
      setHasRequested(true)
      return
    }

    // Check if permission was already granted/denied
    const permissionStatus = localStorage.getItem('geo_permission_status')
    if (permissionStatus === 'denied' || permissionStatus === 'granted') {
      setHasRequested(true)
      if (permissionStatus === 'granted') {
        getLocation()
      }
      return
    }

    // Request permission
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('geo_permission_status', 'granted')
          setHasRequested(true)
          sendLocation(position)
        },
        (error) => {
          localStorage.setItem('geo_permission_status', 'denied')
          setHasRequested(true)
          // Silently fail - don't track if permission denied
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 3600000, // Cache for 1 hour
        }
      )
    }
  }, [hasRequested])

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => sendLocation(position),
        () => {
          // Silently fail
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 3600000,
        }
      )
    }
  }

  const sendLocation = async (position: GeolocationPosition) => {
    try {
      // Reverse geocode to get location details (using a free service)
      const { latitude, longitude } = position.coords

      // Send to analytics API
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'location_tracked',
          location: {
            latitude,
            longitude,
            // Country, region, city will be determined server-side if needed
          },
        }),
      })
    } catch (error) {
      // Silently fail - analytics should not break the app
    }
  }

  return null
}

