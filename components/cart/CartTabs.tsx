'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, Minus, Plus, Package } from 'lucide-react'
import { removeFromCart, updateCartItemQuantity } from '@/lib/actions/cart'
import { useRouter } from 'next/navigation'

function formatOrderId(orderId: string, createdAt: string): string {
    const date = new Date(createdAt)
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    return `HG-${dateStr}-${orderId.slice(0, 4).toUpperCase()}`
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    })
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-orange-100 text-orange-800',
        paid: 'bg-blue-100 text-blue-800',
        confirmed: 'bg-green-100 text-green-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

interface CartTabsProps {
    cartItems: any[]
    subtotal: number
    orders: any[]
    isLoggedIn: boolean
}

export default function CartTabs({ cartItems, subtotal, orders, isLoggedIn }: CartTabsProps) {
    const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart')
    const router = useRouter()

    const handleRemoveFromCart = async (itemId: string) => {
        await removeFromCart(itemId)
        router.refresh()
    }

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        await updateCartItemQuantity(itemId, newQuantity)
        router.refresh()
    }

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-sage-200">
                <button
                    onClick={() => setActiveTab('cart')}
                    className={`pb-4 px-2 font-medium transition-colors ${
                        activeTab === 'cart'
                            ? 'text-sage-900 border-b-2 border-sage-900'
                            : 'text-sage-600 hover:text-sage-900'
                    }`}
                >
                    Cart ({cartItems.length})
                </button>
                {isLoggedIn && (
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-4 px-2 font-medium transition-colors ${
                            activeTab === 'orders'
                                ? 'text-sage-900 border-b-2 border-sage-900'
                                : 'text-sage-600 hover:text-sage-900'
                        }`}
                    >
                        Your Orders ({orders.length})
                    </button>
                )}
            </div>

            {/* Cart Tab Content */}
            {activeTab === 'cart' && (
                <>
                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 bg-sage-50 rounded-3xl">
                            <p className="text-sage-600 mb-6 text-lg">Your cart feels a bit light.</p>
                            <Link href="/products">
                                <Button>Start Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Cart Items */}
                            <div className="flex-1 space-y-6">
                                {cartItems.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-sage-100 items-center">
                                        <div className="relative w-20 h-20 bg-beige-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                                            <Image
                                                src={item.product.images?.[0] || '/placeholder.jpg'}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-1"
                                                sizes="80px"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-serif text-sage-900">{item.product.name}</h3>
                                            <p className="text-sm text-sage-500">₹{item.product.price} each</p>
                                        </div>
                                        <div className="flex items-center gap-3 mr-4">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="p-1 rounded-full hover:bg-sage-100 transition-colors"
                                            >
                                                <Minus className="w-4 h-4 text-sage-600" />
                                            </button>
                                            <span className="font-medium text-sage-800 w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 rounded-full hover:bg-sage-100 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 text-sage-600" />
                                            </button>
                                        </div>
                                        <div className="font-bold text-sage-800 mr-4 w-24 text-right">
                                            ₹{(item.product.price * item.quantity).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="w-full lg:w-80 h-fit bg-beige-50 p-6 rounded-2xl">
                                <h3 className="font-serif text-xl mb-4 text-sage-900">Summary</h3>
                                <div className="flex justify-between mb-2 text-sage-700">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-4 text-sage-700">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t border-sage-200 my-4"></div>
                                <div className="flex justify-between mb-8 font-bold text-xl text-sage-900">
                                    <span>Total</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <Link href="/checkout">
                                    <Button className="w-full" size="lg">Checkout</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Orders Tab Content */}
            {activeTab === 'orders' && (
                <>
                    {!isLoggedIn ? (
                        <div className="text-center py-20 bg-sage-50 rounded-3xl">
                            <Package className="w-16 h-16 text-sage-400 mx-auto mb-4" />
                            <p className="text-sage-600 mb-6 text-lg">Sign in to view your orders</p>
                            <Link href="/login">
                                <Button>Sign In</Button>
                            </Link>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-sage-50 rounded-3xl">
                            <Package className="w-16 h-16 text-sage-400 mx-auto mb-4" />
                            <p className="text-sage-600 mb-6 text-lg">You haven't placed any orders yet.</p>
                            <Link href="/products">
                                <Button>Start Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order: any) => {
                                const orderNumber = formatOrderId(order.id, order.created_at)
                                const itemCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0
                                
                                return (
                                    <div key={order.id} className="bg-white rounded-2xl border border-sage-100 p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-serif text-lg text-sage-900">{orderNumber}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-sage-600">
                                                    {formatDate(order.created_at)} • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-sage-900">₹{Number(order.total_amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Order Items */}
                                        <div className="border-t border-sage-100 pt-4 mt-4">
                                            <div className="space-y-3">
                                                {order.items?.map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-4">
                                                        <div className="relative w-16 h-16 bg-beige-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                                                            {item.product?.images?.[0] ? (
                                                                <Image
                                                                    src={item.product.images[0]}
                                                                    alt={item.product?.name || 'Product'}
                                                                    fill
                                                                    className="object-contain p-1"
                                                                    sizes="64px"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-6 h-6 text-sage-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sage-900">{item.product?.name || 'Product'}</p>
                                                            <p className="text-sm text-sage-600">
                                                                Qty: {item.quantity} × ₹{Number(item.price_at_purchase).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-sage-900">
                                                                ₹{(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

