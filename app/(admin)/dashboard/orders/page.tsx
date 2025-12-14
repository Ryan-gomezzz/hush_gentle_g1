import { getAllOrders, getOrderStats } from '@/lib/actions/admin'
import { Eye, Truck, Check, X } from 'lucide-react'
import Link from 'next/link'
import { updateOrderStatus } from '@/lib/actions/admin'

function formatOrderId(orderId: string, createdAt: string): string {
    const date = new Date(createdAt)
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    return `HG-${dateStr}-${orderId.slice(0, 4).toUpperCase()}`
}

export default async function AdminOrdersPage() {
    const orders = await getAllOrders()
    const stats = await getOrderStats()

    const statusColors: Record<string, string> = {
        confirmed: 'bg-green-100 text-green-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        pending: 'bg-orange-100 text-orange-800',
        paid: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800',
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Orders</h1>
                <p className="text-gray-600 mt-1">Manage customer orders</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{stats.shipped}</div>
                    <div className="text-sm text-gray-600">Shipped</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{stats.delivered}</div>
                    <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{stats.cancelled}</div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Order</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Items</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order: any) => {
                            const orderNumber = formatOrderId(order.id, order.created_at)
                            const shippingDetails = order.shipping_details as any
                            const customerName = shippingDetails?.fullName || order.user?.full_name || 'Guest'
                            const customerEmail = shippingDetails?.email || order.user?.email || ''
                            const itemCount = order.items?.length || 0

                            return (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{orderNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{customerName}</div>
                                        <div className="text-xs text-gray-500">{customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{itemCount}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {new Date(order.created_at).toISOString().slice(0, 10)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/dashboard/orders/${order.id}`} className="text-gray-400 hover:text-sage-600">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {(order.status === 'confirmed' || order.status === 'shipped') && (
                                                <Link href={`/dashboard/orders/${order.id}`} className="text-gray-400 hover:text-sage-600">
                                                    <Truck className="w-4 h-4" />
                                                </Link>
                                            )}
                                            {order.status === 'pending' && (
                                                <>
                                                    <form action={async () => {
                                                        'use server'
                                                        await updateOrderStatus(order.id, 'confirmed')
                                                    }}>
                                                        <button type="submit" className="text-gray-400 hover:text-green-600">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                    <form action={async () => {
                                                        'use server'
                                                        await updateOrderStatus(order.id, 'cancelled')
                                                    }}>
                                                        <button type="submit" className="text-gray-400 hover:text-red-600">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
