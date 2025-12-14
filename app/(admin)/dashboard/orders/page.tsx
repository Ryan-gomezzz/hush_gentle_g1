import { getAllOrders, getOrderStats } from '@/lib/actions/admin'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import OrderStatusDropdown from '@/components/admin/OrderStatusDropdown'

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
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => {
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
                                    <td className="px-6 py-4 text-gray-700">
                                        <div className="space-y-1">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="text-sm">
                                                        {item.product?.name || 'Unknown Product'} (Qty: {item.quantity})
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-gray-400">No items</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/orders/${order.id}`} className="text-gray-400 hover:text-sage-600">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
