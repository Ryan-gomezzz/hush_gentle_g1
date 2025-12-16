import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/products';
import { Star } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { createClient } from '@/lib/supabase-server';
import { trackProductView } from '@/lib/actions/user';
import ProductImageGallery from '@/components/shop/ProductImageGallery';
import ProductPurchaseForm from '@/components/shop/ProductPurchaseForm';

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
    
    // Track for recently viewed
    await trackProductView(user?.id, product.id);

    const productImages = product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg']
    const skus = (product as any).skus || []

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Gallery */}
                <ProductImageGallery images={productImages} productName={product.name} />

                {/* Info */}
                <div className="flex flex-col justify-center">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="px-3 py-1 bg-beige-200 text-sage-800 text-xs font-bold uppercase tracking-wider rounded-full">
                            {product.category_id ? 'Natural Care' : 'Collection'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-sage-900 mb-4 leading-tight">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
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

                    <ProductPurchaseForm
                        productId={product.id}
                        basePrice={product.price}
                        baseStock={product.stock}
                        skus={skus}
                        images={productImages}
                        productName={product.name}
                    />

                    <p className="text-xs text-sage-500 text-center md:text-left">
                        Free shipping on orders over ₹499. 30-day gentle return policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
