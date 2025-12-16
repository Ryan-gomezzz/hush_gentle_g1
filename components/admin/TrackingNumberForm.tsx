'use client'

import { useState, useTransition } from 'react'
import { updateOrderTracking } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'

interface TrackingNumberFormProps {
    orderId: string
    currentTrackingNumber: string | null
}

export default function TrackingNumberForm({ orderId, currentTrackingNumber }: TrackingNumberFormProps) {
    const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        startTransition(async () => {
            try {
                await updateOrderTracking(orderId, trackingNumber)
                router.refresh()
            } catch (error) {
                console.error('Failed to update tracking number:', error)
                alert('Failed to update tracking number')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                </label>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                            disabled={isPending}
                        />
                    </div>
                    <Button type="submit" disabled={isPending || !trackingNumber.trim()}>
                        {isPending ? 'Saving...' : 'Update'}
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Add or update the tracking number for this order
                </p>
            </div>
        </form>
    )
}

