import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/products';
import { addToCart } from '@/lib/actions/cart';
import { Button } from '@/components/ui/button';
import { Star, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { createClient } from '@/lib/supabase-server';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    // Track product view
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await trackEvent(user?.id, 'product_view', {
        product_id: product.id,
        product_name: product.name,
        product_slug: params.slug,
    });

    const imageUrl = product.images?.[0] || '/placeholder.jpg';

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                {/* Gallery */}
                <div className="relative aspect-square w-full bg-beige-50 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center p-8">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="px-3 py-1 bg-beige-200 text-sage-800 text-xs font-bold uppercase tracking-wider rounded-full">
                            {product.category_id ? 'Organic Care' : 'Collection'}
                        </span>
                        {product.stock > 0 ? (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> In Stock
                            </span>
                        ) : (
                            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-sage-900 mb-4 leading-tight">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <p className="text-3xl font-bold text-sage-800">₹{product.price.toFixed(2)}</p>
                        <div className="flex items-center text-yellow-500 text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sage-500 ml-2">(12 reviews)</span>
                        </div>
                    </div>

                    <p className="text-lg text-sage-600 mb-8 font-light leading-relaxed">
                        {product.description}
                    </p>

                    <div className="bg-sage-50 p-6 rounded-2xl mb-8 border border-sage-100">
                        <h3 className="font-serif text-lg text-sage-800 mb-3">Why it's gentle:</h3>
                        <ul className="space-y-2">
                            {product.attributes?.ingredients?.map((ing: string) => (
                                <li key={ing} className="flex items-center gap-2 text-sage-700 text-sm">
                                    <span className="w-1.5 h-1.5 bg-sage-400 rounded-full" />
                                    {ing}
                                </li>
                            )) || <li className="text-sage-500 italic">Ingredients coming soon...</li>}
                        </ul>
                    </div>

                    <form action={async () => {
                        'use server';
                        await addToCart(product.id, 1);
                    }} className="mb-4">
                        <Button
                            size="lg"
                            className="w-full md:w-auto min-w-[200px] text-lg py-6"
                            disabled={product.stock <= 0}
                        >
                            {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                        </Button>
                    </form>

                    <p className="text-xs text-sage-500 text-center md:text-left">
                        Free shipping on orders over $50. 30-day gentle return policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
