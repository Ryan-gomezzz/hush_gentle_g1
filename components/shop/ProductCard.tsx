import Link from 'next/link'
import Image from 'next/image'
import { memo } from 'react'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { addToCart } from '@/lib/actions/cart'
import WishlistButton from './WishlistButton'

function ProductCard({ product }: { product: Product }) {
    const imageUrl = product.images?.[0] || '/placeholder.jpg'

    return (
        <Card className="overflow-hidden border-none shadow-none hover:shadow-lg transition-all duration-300 group bg-transparent">
            <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[4/5] w-full bg-beige-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-4">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500 p-2 md:p-4"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                            <span className="px-2 py-1 bg-gray-900 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                        </div>
                    )}
                </div>
            </Link>

            <CardContent className="px-1 md:px-2 pt-0 pb-2">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-serif text-base md:text-xl text-sage-900 mb-1 hover:text-sage-700 truncate">{product.name}</h3>
                </Link>
                <p className="text-xs md:text-sm text-sage-600 mb-2 line-clamp-2 min-h-[2.5em]">{product.attributes?.benefits || product.description}</p>
                <div className="flex items-center gap-2">
                    <span className="text-sm md:text-lg font-bold text-sage-800">₹{product.price.toFixed(2)}</span>
                </div>
            </CardContent>

            <CardFooter className="px-1 md:px-2 pb-2">
                <div className="w-full flex items-center gap-2">
                    <form action={async () => {
                        'use server'
                        await addToCart(product.id, 1)
                    }} className="flex-1">
                        <Button
                            type="submit"
                            className="w-full h-8 md:h-10 text-xs md:text-sm bg-sage-500 hover:bg-sage-600 text-white"
                            disabled={product.stock <= 0}
                        >
                            {product.stock > 0 ? 'Add' : 'Sold Out'}
                        </Button>
                    </form>
                    <WishlistButton productId={product.id} />
                </div>
            </CardFooter>
        </Card>
    )
}

// Memoize to prevent unnecessary re-renders
export default memo(ProductCard)
