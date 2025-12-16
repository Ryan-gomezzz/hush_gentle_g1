import { getDashboardKPIs, getRecentOrders, getTopProducts } from '@/lib/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { DollarSign, ShoppingCart, TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'

function formatOrderId(orderId: string, createdAt: string): string {
    const date = new Date(createdAt)
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    return `HG-${dateStr}-${orderId.slice(0, 4).toUpperCase()}`
}

function formatTimeAgo(date: string): string {
    const now = new Date()
    const orderDate = new Date(date)
    const diffMs = now.getTime() - orderDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
}

export default async function DashboardPage() {
    try {
        const kpis = await getDashboardKPIs()
        const recentOrders = await getRecentOrders(4)
        const topProducts = await getTopProducts(4)

        // Ensure all KPI values have defaults to prevent undefined errors
        const safeKpis = {
            totalRevenue: kpis?.totalRevenue ?? 0,
            revenueChange: kpis?.revenueChange ?? 0,
            conversionRate: kpis?.conversionRate ?? 0,
            conversionChange: kpis?.conversionChange ?? 0,
            activeCarts: kpis?.activeCarts ?? 0,
            orderCount: kpis?.orderCount ?? 0,
            orderChange: kpis?.orderChange ?? 0,
            abandonmentRate: kpis?.abandonmentRate ?? 0,
            abandonmentChange: kpis?.abandonmentChange ?? 0,
        }

        return (
        <div>
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome back! Here's what's happening with your store.</p>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                            Total Revenue
                            <DollarSign className="w-4 h-4 text-gray-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-sage-900 mb-2">₹{safeKpis.totalRevenue.toLocaleString('en-IN')}</div>
                        <div className="flex items-center gap-1 text-sm">
                            {safeKpis.revenueChange >= 0 ? (
                                <>
                                    <ArrowUp className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500">+{safeKpis.revenueChange.toFixed(1)}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDown className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">{safeKpis.revenueChange.toFixed(1)}%</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                            Orders
                            <ShoppingCart className="w-4 h-4 text-gray-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-sage-900 mb-2">{safeKpis.orderCount}</div>
                        <div className="flex items-center gap-1 text-sm">
                            {safeKpis.orderChange >= 0 ? (
                                <>
                                    <ArrowUp className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500">+{safeKpis.orderChange.toFixed(1)}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDown className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">{safeKpis.orderChange.toFixed(1)}%</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                            Conversion Rate
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-sage-900 mb-2">{safeKpis.conversionRate.toFixed(1)}%</div>
                        <div className="flex items-center gap-1 text-sm">
                            {safeKpis.conversionChange >= 0 ? (
                                <>
                                    <ArrowUp className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500">+{safeKpis.conversionChange.toFixed(1)}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDown className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">{safeKpis.conversionChange.toFixed(1)}%</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                            Cart Abandonment
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-sage-900 mb-2">{safeKpis.abandonmentRate.toFixed(1)}%</div>
                        <div className="flex items-center gap-1 text-sm">
                            {safeKpis.abandonmentChange <= 0 ? (
                                <>
                                    <ArrowDown className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500">{safeKpis.abandonmentChange.toFixed(1)}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowUp className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">+{safeKpis.abandonmentChange.toFixed(1)}%</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Link href="/dashboard/orders" className="text-sm text-sage-600 hover:text-sage-900">View all</Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {recentOrders.map((order: any) => {
                                    const orderNumber = formatOrderId(order.id, order.created_at)
                                    const timeAgo = formatTimeAgo(order.created_at)
                                    const statusColors: Record<string, string> = {
                                        confirmed: 'bg-green-100 text-green-800',
                                        shipped: 'bg-purple-100 text-purple-800',
                                        delivered: 'bg-green-100 text-green-800',
                                        pending: 'bg-orange-100 text-orange-800',
                                        paid: 'bg-blue-100 text-blue-800',
                                        cancelled: 'bg-red-100 text-red-800',
                                    }
                                    return (
                                        <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                                            <div>
                                                <div className="font-medium text-gray-900">{orderNumber}</div>
                                                <div className="text-sm text-gray-500">
                                                    {order.shipping_details?.fullName || order.user?.full_name || 'Guest'} • {timeAgo}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No orders yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Top Products</CardTitle>
                        <Link href="/dashboard/products" className="text-sm text-sage-600 hover:text-sage-900">View all</Link>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length > 0 ? (
                            <div className="space-y-4">
                                {topProducts.map((product: any) => (
                                    <div key={product.rank} className="flex items-center justify-between pb-4 border-b last:border-0">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {product.rank}. {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {product.sales} sales • ₹{product.revenue.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No product data yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length > 0 ? (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Order ID</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order: any) => (
                                        <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">{order.shipping_details?.fullName || 'Guest'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold">₹{order.total_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No orders yet.</p>
                    )}
                    <div className="mt-4 text-right">
                        <Link href="/dashboard/orders" className="text-sage-600 hover:text-sage-900 text-sm font-medium">View All Orders &rarr;</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
        )
    } catch (error: any) {
        console.error('Dashboard error:', error)
        return (
            <div className="p-8">
                <h1 className="text-3xl font-serif text-gray-800 mb-2">Dashboard</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-4">
                    <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-red-700">
                        {error?.message || 'An error occurred while loading the dashboard. Please try refreshing the page.'}
                    </p>
                </div>
            </div>
        )
    }
}
