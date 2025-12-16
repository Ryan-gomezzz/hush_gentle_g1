import { getOrderById, updateOrderTracking } from '@/lib/actions/admin'
import { requireAdmin } from '@/lib/utils/admin-check'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar, MapPin, Truck } from 'lucide-react'
import OrderStatusDropdown from '@/components/admin/OrderStatusDropdown'
import TrackingNumberForm from '@/components/admin/TrackingNumberForm'
import OrderStatusTimeline from '@/components/admin/OrderStatusTimeline'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    await requireAdmin()
    const order = await getOrderById(params.id)

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

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/dashboard/orders"
                    className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>
                <h1 className="text-3xl font-serif text-gray-800">Order Details</h1>
                <p className="text-gray-600 mt-1">Order {orderNumber}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status & Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-serif text-gray-800">Order Status</h2>
                            <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                        </div>
                        <OrderStatusTimeline orderId={order.id} statusHistory={order.status_history || []} />
                    </div>

                    {/* Tracking Number */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-serif text-gray-800 mb-4">Tracking Information</h2>
                        <TrackingNumberForm orderId={order.id} currentTrackingNumber={order.tracking_number} />
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-serif text-gray-800 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 mb-1">
                                            {item.product?.name || 'Unknown Product'}
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            Quantity: {item.quantity} × ₹{Number(item.price_at_purchase).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            ₹{(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-serif text-gray-800 mb-4">Shipping Address</h2>
                        <div className="text-gray-700 space-y-1">
                            <p className="font-medium">{shippingDetails?.fullName}</p>
                            <p>{shippingDetails?.address}</p>
                            <p>
                                {shippingDetails?.city}
                                {shippingDetails?.state ? `, ${shippingDetails.state}` : ''}{' '}
                                {shippingDetails?.zip}
                            </p>
                            <p>{shippingDetails?.email}</p>
                            {order.pincode && (
                                <p className="text-sm text-gray-500 mt-2">Pincode: {order.pincode}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                        <h2 className="text-xl font-serif text-gray-800 mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-700">
                                <span>Order Number</span>
                                <span className="font-mono font-medium">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Customer</span>
                                <span>{order.user?.full_name || shippingDetails?.fullName || 'Guest'}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Email</span>
                                <span className="text-sm">{order.user?.email || shippingDetails?.email}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Placed on</span>
                                <span className="text-sm">{formatDate(order.created_at)}</span>
                            </div>
                            {order.estimated_delivery_date && (
                                <div className="flex justify-between text-gray-700">
                                    <span>Est. Delivery</span>
                                    <span className="text-sm">{formatDate(order.estimated_delivery_date)}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal</span>
                                <span>
                                    ₹{(Number(order.total_amount) + Number(order.discount_amount || 0)).toFixed(2)}
                                </span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    {order.coupon && (
                                        <span className="text-xs text-gray-500">({order.coupon.code})</span>
                                    )}
                                    <span>-₹{Number(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span>₹{Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

