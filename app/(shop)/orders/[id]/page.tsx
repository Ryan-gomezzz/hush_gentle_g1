import { getUserOrders } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Calendar, MapPin, Truck, CheckCircle } from 'lucide-react'
import OrderTrackingTimeline from '@/components/orders/OrderTrackingTimeline'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/orders')
    }

    const orders = await getUserOrders()
    const order = orders.find((o: any) => o.id === params.id)

    if (!order) {
        notFound()
    }

    const shippingDetails = order.shipping_details as any
    const orderNumber = order.order_number || `HG-${order.id.slice(0, 8).toUpperCase()}`

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
            <div className="mb-8">
                <Link href="/orders" className="text-sage-600 hover:text-sage-900 mb-4 inline-block">
                    ← Back to Orders
                </Link>
                <h1 className="text-4xl font-serif text-sage-900 mt-4">Order Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status */}
                    <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-serif text-sage-900">Order Status</h2>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    order.status
                                )}`}
                            >
                                {getStatusLabel(order.status)}
                            </span>
                        </div>
                        <OrderTrackingTimeline orderId={order.id} currentStatus={order.status} />
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6">
                        <h2 className="text-xl font-serif text-sage-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-sage-100"
                                >
                                    <div className="relative w-20 h-20 bg-beige-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product?.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-sage-300 m-auto" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sage-900 mb-1">
                                            {item.product?.name || 'Unknown Product'}
                                        </h3>
                                        <div className="text-sm text-sage-600">
                                            Quantity: {item.quantity} × ₹{Number(item.price_at_purchase).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sage-900">
                                            ₹{(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6">
                        <h2 className="text-xl font-serif text-sage-900 mb-4">Shipping Address</h2>
                        <div className="text-sage-700 space-y-1">
                            <p className="font-medium">{shippingDetails?.fullName}</p>
                            <p>{shippingDetails?.address}</p>
                            <p>
                                {shippingDetails?.city}
                                {shippingDetails?.state ? `, ${shippingDetails.state}` : ''}{' '}
                                {shippingDetails?.zip}
                            </p>
                            <p>{shippingDetails?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6 sticky top-8">
                        <h2 className="text-xl font-serif text-sage-900 mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sage-700">
                                <span>Order Number</span>
                                <span className="font-mono font-medium">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-sage-700">
                                <span>Placed on</span>
                                <span>{formatDate(order.created_at)}</span>
                            </div>
                            {order.estimated_delivery_date && (
                                <div className="flex justify-between text-sage-700">
                                    <span>Est. Delivery</span>
                                    <span>{formatDate(order.estimated_delivery_date)}</span>
                                </div>
                            )}
                            {order.tracking_number && (
                                <div className="flex justify-between text-sage-700">
                                    <span>Tracking</span>
                                    <span className="font-mono text-sm">{order.tracking_number}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-sage-100 pt-4 space-y-2">
                            <div className="flex justify-between text-sage-700">
                                <span>Subtotal</span>
                                <span>
                                    ₹{(Number(order.total_amount) + Number(order.discount_amount || 0)).toFixed(2)}
                                </span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{Number(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-sage-900 pt-2 border-t border-sage-100">
                                <span>Total</span>
                                <span>₹{Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-sage-100">
                            <Link href="/products">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

