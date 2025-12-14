import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
// import AddToCartButton from './AddToCartButton' // Client component

export default function ProductCard({ product }: { product: Product }) {
    const imageUrl = product.images?.[0] || '/placeholder.jpg'

    return (
        <Card className="overflow-hidden border-none shadow-none hover:shadow-lg transition-all duration-300 group bg-transparent">
            <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden mb-4">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                        </div>
                    )}
                </div>
            </Link>

            <CardContent className="px-2 pt-0 pb-2">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-serif text-xl text-sage-900 mb-1 hover:text-sage-700 truncate">{product.name}</h3>
                </Link>
                <p className="text-sm text-sage-600 mb-3 line-clamp-2">{product.attributes?.benefits || product.description}</p>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-sage-800">₹{product.price.toFixed(2)}</span>
                </div>
            </CardContent>

            <CardFooter className="px-2 pb-2">
                {/* Placeholder for Client Component */}
                <Button className="w-full bg-sage-500 hover:bg-sage-600 text-white">
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    )
}
