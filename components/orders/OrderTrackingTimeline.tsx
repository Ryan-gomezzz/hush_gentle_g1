import { createClient } from '@/lib/supabase-server'
import { CheckCircle, Circle, Package, Truck, Home } from 'lucide-react'

interface OrderTrackingTimelineProps {
    orderId: string
    currentStatus: string
}

export default async function OrderTrackingTimeline({ orderId, currentStatus }: OrderTrackingTimelineProps) {
    const supabase = createClient()

    // Fetch status history
    const { data: statusHistory } = await supabase
        .from('order_status_history')
        .select('status, created_at, notes')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })

    const statuses = [
        { key: 'pending', label: 'Order Placed', icon: Package },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
        { key: 'paid', label: 'Payment Received', icon: CheckCircle },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: Home },
    ]

    const getStatusIndex = (status: string) => {
        const index = statuses.findIndex((s) => s.key === status)
        return index >= 0 ? index : 0
    }

    const currentIndex = getStatusIndex(currentStatus)
    const isCancelled = currentStatus === 'cancelled'

    return (
        <div className="relative">
            <div className="space-y-6">
                {statuses.map((status, index) => {
                    const isCompleted = index <= currentIndex && !isCancelled
                    const isCurrent = index === currentIndex && !isCancelled
                    const Icon = status.icon

                    // Check if this status exists in history
                    const statusInHistory = statusHistory?.find((h) => h.status === status.key)
                    const statusDate = statusInHistory
                        ? new Date(statusInHistory.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                          })
                        : null

                    return (
                        <div key={status.key} className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                                {index < statuses.length - 1 && (
                                    <div
                                        className={`absolute top-8 left-1/2 w-0.5 h-12 transform -translate-x-1/2 ${
                                            isCompleted ? 'bg-sage-400' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isCompleted
                                            ? 'bg-sage-600 text-white'
                                            : isCurrent
                                              ? 'bg-sage-100 text-sage-600 border-2 border-sage-600'
                                              : 'bg-gray-100 text-gray-400'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex-1 pt-1">
                                <div
                                    className={`font-medium ${
                                        isCompleted || isCurrent ? 'text-sage-900' : 'text-gray-500'
                                    }`}
                                >
                                    {status.label}
                                </div>
                                {statusDate && (
                                    <div className="text-sm text-gray-500 mt-1">{statusDate}</div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {isCancelled && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                        <Circle className="w-5 h-5" />
                        <span className="font-medium">Order Cancelled</span>
                    </div>
                </div>
            )}
        </div>
    )
}

