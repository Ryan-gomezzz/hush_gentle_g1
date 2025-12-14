import { getProducts } from "@/lib/actions/products";
import ProductCard from "@/components/shop/ProductCard";
import Link from 'next/link';
import { cn } from "@/utils/cn";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { category?: string };
}) {
    const category = searchParams.category;
    const products = await getProducts(category);

    const categories = [
        { label: "All", value: undefined },
        { label: "Hand Care", value: "hand-care" },
        { label: "Foot Care", value: "foot-care" },
        { label: "Body Care", value: "body-care" },
        { label: "Face Care", value: "face-care" },
    ];

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <h1 className="text-4xl font-serif text-sage-900 mb-4 md:mb-0">Shop Gentle</h1>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {categories.map((c) => (
                        <Link
                            key={c.label}
                            href={c.value ? `/products?category=${c.value}` : '/products'}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                category === c.value || (!category && !c.value)
                                    ? "bg-sage-600 text-white"
                                    : "bg-sage-100 text-sage-800 hover:bg-sage-200"
                            )}
                        >
                            {c.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-20">
                        <h3 className="text-xl text-sage-700 font-serif mb-2">No products found</h3>
                        <p className="text-sage-500">Try selecting a different category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
