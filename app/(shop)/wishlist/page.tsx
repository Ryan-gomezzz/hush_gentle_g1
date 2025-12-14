import { getWishlist, removeFromWishlist } from '@/lib/actions/wishlist'
import { addToCart } from '@/lib/actions/cart'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function WishlistPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const wishlist = await getWishlist()
    const items = wishlist?.items || []

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="w-8 h-8 text-sage-600" />
                <h1 className="text-4xl font-serif text-sage-900">Your Wishlist</h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-sage-50 rounded-3xl">
                    <Heart className="w-16 h-16 text-sage-300 mx-auto mb-4" />
                    <p className="text-sage-600 mb-6 text-lg">Your wishlist is empty.</p>
                    <Link href="/products">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item: any) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-sage-100 overflow-hidden hover:shadow-md transition-shadow">
                            <Link href={`/products/${item.product.slug}`}>
                                <div className="relative aspect-square w-full bg-beige-100">
                                    <Image
                                        src={item.product.images?.[0] || '/placeholder.jpg'}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Link>
                            <div className="p-4">
                                <Link href={`/products/${item.product.slug}`}>
                                    <h3 className="font-serif text-sage-900 mb-2 hover:text-sage-700">{item.product.name}</h3>
                                </Link>
                                <p className="text-lg font-bold text-sage-800 mb-4">₹{item.product.price.toFixed(2)}</p>
                                <div className="flex gap-2">
                                    <form action={async () => {
                                        'use server'
                                        await addToCart(item.product.id, 1)
                                    }} className="flex-1">
                                        <Button type="submit" size="sm" className="w-full">
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                    </form>
                                    <form action={async () => {
                                        'use server'
                                        await removeFromWishlist(item.product.id)
                                    }}>
                                        <button type="submit" className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                            <Heart className="w-5 h-5 fill-current" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

