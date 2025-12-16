'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DateRangeFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')

    const handleApply = () => {
        const params = new URLSearchParams()
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        router.push(`/dashboard/orders?${params.toString()}`)
    }

    const handleClear = () => {
        setStartDate('')
        setEndDate('')
        router.push('/dashboard/orders')
    }

    return (
        <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-800">Filter by Date Range</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500"
                    />
                </div>
                <div className="flex items-end gap-2">
                    <Button onClick={handleApply} size="sm">
                        Apply
                    </Button>
                    <Button onClick={handleClear} variant="outline" size="sm">
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    )
}

