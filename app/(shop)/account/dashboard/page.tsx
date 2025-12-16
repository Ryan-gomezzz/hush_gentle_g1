import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getCart } from '@/lib/actions/cart'
import { getRecentlyViewed } from '@/lib/actions/user'
import { getFeaturedProducts } from '@/lib/actions/products'
import ProductCard from '@/components/shop/ProductCard'
import Link from 'next/link'
import { ShoppingBag, Eye, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function UserDashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const cart = await getCart()
    const recentlyViewed = await getRecentlyViewed(user.id, 8)
    const featuredProducts = await getFeaturedProducts().then(products => 
        products.slice(0, 4) // Get 4 featured products for recommendations
    )

    const cartItems = cart?.items || []
    const cartItemCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-serif text-sage-900 mb-2">Welcome Back</h1>
                <p className="text-sage-600">Here's what's happening with your account</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Cart & Recently Viewed */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Cart Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-serif text-sage-900 flex items-center gap-2">
                                <ShoppingBag className="w-6 h-6" />
                                Your Cart
                            </h2>
                            {cartItemCount > 0 && (
                                <Link href="/cart">
                                    <Button variant="outline" size="sm">
                                        View Cart
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {cartItemCount === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sage-500 mb-4">Your cart is empty</p>
                                <Link href="/products">
                                    <Button>Start Shopping</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cartItems.slice(0, 3).map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 bg-beige-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-sage-900">{item.product?.name || 'Product'}</p>
                                            <p className="text-sm text-sage-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="text-sage-800 font-medium">
                                            ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                                {cartItems.length > 3 && (
                                    <p className="text-sm text-sage-500 text-center pt-2">
                                        +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recently Viewed */}
                    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-serif text-sage-900 flex items-center gap-2">
                                <Eye className="w-6 h-6" />
                                Recently Viewed
                            </h2>
                        </div>

                        {recentlyViewed.length === 0 ? (
                            <p className="text-sage-500 text-center py-8">
                                You haven't viewed any products yet. Start browsing to see them here!
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recentlyViewed.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Recommendations */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6">
                        <h2 className="text-xl font-serif text-sage-900 mb-4">Recommended for You</h2>
                        {featuredProducts.length === 0 ? (
                            <p className="text-sage-500 text-sm">No recommendations available</p>
                        ) : (
                            <div className="space-y-4">
                                {featuredProducts.map(product => (
                                    <Link key={product.id} href={`/products/${product.slug}`}>
                                        <div className="p-3 bg-beige-50 rounded-lg hover:bg-beige-100 transition-colors">
                                            <p className="font-medium text-sage-900 text-sm">{product.name}</p>
                                            <p className="text-sage-600 text-sm mt-1">₹{product.price.toFixed(2)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-sage-50 rounded-2xl p-6 border border-sage-200">
                        <h3 className="font-serif text-sage-900 mb-2">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/products">
                                <Button variant="outline" className="w-full justify-start" size="sm">
                                    Browse Products
                                </Button>
                            </Link>
                            <Link href="/wishlist">
                                <Button variant="outline" className="w-full justify-start" size="sm">
                                    View Wishlist
                                </Button>
                            </Link>
                            <Link href="/account">
                                <Button variant="outline" className="w-full justify-start" size="sm">
                                    Account Settings
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

