import { getCart, removeFromCart, updateCartItemQuantity } from '@/lib/actions/cart'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, Minus, Plus } from 'lucide-react'

export default async function CartPage() {
    const cart = await getCart()
    const items = cart?.items || []
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0)

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif text-sage-900 mb-8">Your Cart</h1>

            {items.length === 0 ? (
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
                        {items.map((item: any) => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-sage-100 items-center">
                                <div className="relative w-20 h-20 bg-beige-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.product.images?.[0] || '/placeholder.jpg'}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-serif text-sage-900">{item.product.name}</h3>
                                    <p className="text-sm text-sage-500">₹{item.product.price} each</p>
                                </div>
                                <div className="flex items-center gap-3 mr-4">
                                    <form action={async () => {
                                        'use server'
                                        await updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))
                                    }}>
                                        <button type="submit" className="p-1 rounded-full hover:bg-sage-100 transition-colors">
                                            <Minus className="w-4 h-4 text-sage-600" />
                                        </button>
                                    </form>
                                    <span className="font-medium text-sage-800 w-8 text-center">{item.quantity}</span>
                                    <form action={async () => {
                                        'use server'
                                        await updateCartItemQuantity(item.id, item.quantity + 1)
                                    }}>
                                        <button type="submit" className="p-1 rounded-full hover:bg-sage-100 transition-colors">
                                            <Plus className="w-4 h-4 text-sage-600" />
                                        </button>
                                    </form>
                                </div>
                                <div className="font-bold text-sage-800 mr-4 w-24 text-right">
                                    ₹{(item.product.price * item.quantity).toFixed(2)}
                                </div>
                                <form action={async () => {
                                    'use server'
                                    await removeFromCart(item.id)
                                }}>
                                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
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
        </div>
    )
}
