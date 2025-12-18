import Link from "next/link";
import { getFeaturedProducts } from "@/lib/actions/products";
import ProductCard from "@/components/shop/ProductCard";
import HeroCarousel from "@/components/shop/HeroCarousel";

export default async function Home() {
    const featuredProducts = await getFeaturedProducts();

    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Hero Section */}
            <div className="relative">
                <HeroCarousel />
            </div>

            {/* Featured Products */}
            <section className="py-8 md:py-12 px-4 md:px-12 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-serif text-sage-900 mb-2">Our Favorites</h2>
                        <p className="text-sage-600">Hand-picked gentle essentials.</p>
                    </div>
                    <Link href="/products" className="text-sage-700 hover:text-sage-900 font-medium border-b border-sage-300 pb-1">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                    {featuredProducts.length > 0 ? (
                        featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="col-span-4 text-center text-sage-500 py-12">No products found. Please seed the database.</p>
                    )}
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-12 md:py-20 px-6 md:px-8 bg-white text-center">
                <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-8 md:mb-12">Why Hush Gentle?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                    <div className="p-8 bg-beige-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-serif text-sage-700 mb-3">Natural Ingredients</h3>
                        <p className="text-gray-600 leading-relaxed">Carefully sourced natural ingredients from trusted suppliers. No fillers, just pure goodness.</p>
                    </div>
                    <div className="p-8 bg-beige-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-serif text-sage-700 mb-3">Cruelty Free</h3>
                        <p className="text-gray-600 leading-relaxed">We never test on animals. Kindness is our core ingredient, from sourcing to packaging.</p>
                    </div>
                    <div className="p-8 bg-beige-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-serif text-sage-700 mb-3">Sensitive Safe</h3>
                        <p className="text-gray-600 leading-relaxed">Formulated specifically for delicate and reactive skin types. Hypoallergenic by design.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
