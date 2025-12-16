import { CheckCircle, Circle, Package, Truck, Home, CreditCard } from 'lucide-react'

interface OrderStatusTimelineProps {
    orderId: string
    statusHistory: Array<{
        id: string
        status: string
        created_at: string
        changed_by: string | null
        notes: string | null
    }>
}

export default function OrderStatusTimeline({ statusHistory }: OrderStatusTimelineProps) {
    const statuses = [
        { key: 'pending', label: 'Order Placed', icon: Package },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
        { key: 'paid', label: 'Payment Received', icon: CreditCard },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: Home },
    ]

    // Get the latest status from history
    const latestStatus = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].status : 'pending'
    const currentIndex = statuses.findIndex((s) => s.key === latestStatus)
    const isCancelled = latestStatus === 'cancelled'

    return (
        <div className="relative">
            <div className="space-y-6">
                {statuses.map((status, index) => {
                    const isCompleted = index <= currentIndex && !isCancelled
                    const isCurrent = index === currentIndex && !isCancelled
                    const Icon = status.icon

                    // Find status in history
                    const statusInHistory = statusHistory.find((h) => h.status === status.key)
                    const statusDate = statusInHistory
                        ? new Date(statusInHistory.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
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
                                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    {status.label}
                                </div>
                                {statusDate && (
                                    <div className="text-sm text-gray-500 mt-1">{statusDate}</div>
                                )}
                                {statusInHistory?.notes && (
                                    <div className="text-xs text-gray-400 mt-1">{statusInHistory.notes}</div>
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

