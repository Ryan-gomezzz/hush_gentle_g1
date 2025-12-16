import { getUserOrders } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function OrdersPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/orders')
    }

    const orders = await getUserOrders()

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-800',
            confirmed: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-serif text-sage-900">My Orders</h1>
                    <p className="text-sage-600 mt-2">View and track your order history</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-12 text-center">
                    <Package className="w-16 h-16 text-sage-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-serif text-sage-900 mb-2">No orders yet</h2>
                    <p className="text-sage-600 mb-6">Start shopping to see your orders here</p>
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => {
                        const shippingDetails = order.shipping_details as any
                        const orderNumber = order.order_number || `HG-${order.id.slice(0, 8).toUpperCase()}`
                        const itemCount = order.items?.length || 0
                        const totalItems = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-serif text-sage-900">
                                                Order {orderNumber}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-sage-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Placed on {formatDate(order.created_at)}</span>
                                            </div>
                                            {order.estimated_delivery_date && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>
                                                        Est. delivery:{' '}
                                                        {formatDate(order.estimated_delivery_date)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-sage-900 mb-1">
                                            ₹{Number(order.total_amount).toFixed(2)}
                                        </div>
                                        {order.discount_amount > 0 && (
                                            <div className="text-sm text-green-600">
                                                Saved ₹{Number(order.discount_amount).toFixed(2)}
                                            </div>
                                        )}
                                        <div className="text-sm text-sage-600">
                                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-sage-100 pt-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="relative w-16 h-16 bg-beige-100 rounded-lg overflow-hidden">
                                                {item.product?.images?.[0] && (
                                                    <Image
                                                        src={item.product.images[0]}
                                                        alt={item.product.name || 'Product'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {itemCount > 3 && (
                                            <div className="text-sm text-sage-600">
                                                +{itemCount - 3} more
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Link href={`/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                        {order.status === 'delivered' && (
                                            <Button variant="outline" size="sm">
                                                Reorder
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

