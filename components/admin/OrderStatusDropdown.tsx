'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface OrderStatusDropdownProps {
    orderId: string
    currentStatus: string
}

const statusWorkflow: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [], // Final state
    cancelled: [], // Final state
}

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    paid: 'Paid',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
}

export default function OrderStatusDropdown({ orderId, currentStatus }: OrderStatusDropdownProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)

    const availableStatuses = statusWorkflow[currentStatus] || []
    const isFinalState = availableStatuses.length === 0

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus || isPending) return

        setSelectedStatus(newStatus)
        
        startTransition(async () => {
            try {
                await updateOrderStatus(orderId, newStatus)
                router.refresh()
            } catch (error) {
                console.error('Failed to update order status:', error)
                setSelectedStatus(currentStatus) // Revert on error
            }
        })
    }

    if (isFinalState) {
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[currentStatus] || currentStatus}
            </span>
        )
    }

    return (
        <div className="relative">
            <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isPending}
                className={`px-3 py-1 rounded-full text-xs border-0 focus:ring-2 focus:ring-sage-500 cursor-pointer ${
                    statusColors[currentStatus] || 'bg-gray-100 text-gray-800'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value={currentStatus}>{statusLabels[currentStatus] || currentStatus}</option>
                {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                        {statusLabels[status] || status}
                    </option>
                ))}
            </select>
            {isPending && (
                <span className="ml-2 text-xs text-gray-500">Updating...</span>
            )}
        </div>
    )
}

