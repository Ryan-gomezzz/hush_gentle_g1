import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'

interface OrderStatisticsProps {
    stats: {
        total: number
        totalRevenue: number
        averageOrderValue: number
        pending: number
        shipped: number
        delivered: number
        cancelled: number
    }
    startDate?: string
    endDate?: string
}

export default function OrderStatistics({ stats, startDate, endDate }: OrderStatisticsProps) {
    const dateRangeText = startDate || endDate
        ? `${startDate ? new Date(startDate).toLocaleDateString() : 'All'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'Now'}`
        : 'All Time'

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif text-gray-800">Statistics</h2>
                <span className="text-sm text-gray-600">{dateRangeText}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-sage-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Average Order Value</span>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₹{stats.averageOrderValue.toFixed(2)}</div>
                </div>
            </div>
        </div>
    )
}

