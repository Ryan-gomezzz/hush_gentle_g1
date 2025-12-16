'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Offer {
  id: string
  title: string
  description?: string
}

export default function OffersBanner() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function fetchOffers() {
      const supabase = createClient()
      const { data } = await supabase
        .from('offers')
        .select('id, title, description')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data && data.length > 0) {
        setOffers(data)
      } else {
        setIsVisible(false)
      }
    }

    fetchOffers()
  }, [])

  useEffect(() => {
    if (offers.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 6000) // Rotate every 6 seconds

    return () => clearInterval(interval)
  }, [offers.length])

  if (!isVisible || offers.length === 0) {
    return null
  }

  const currentOffer = offers[currentIndex]

  return (
    <div className="bg-sage-100/80 text-sage-800 py-2 px-4 text-center text-sm border-b border-sage-200">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="font-medium">{currentOffer.title}</span>
        {currentOffer.description && (
          <span className="text-sage-600 hidden sm:inline">— {currentOffer.description}</span>
        )}
        {offers.length > 1 && (
          <div className="flex gap-1 ml-4">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-sage-600 w-4' : 'bg-sage-300'
                }`}
                aria-label={`View offer ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

