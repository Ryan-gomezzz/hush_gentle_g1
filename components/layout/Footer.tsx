import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="py-16 bg-sage-50 text-sage-800 border-t border-sage-200">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand */}
                <div>
                    <h3 className="text-2xl font-serif mb-4 text-sage-900">Hush Gentle</h3>
                    <p className="font-light text-sm text-sage-600 mb-6">
                        Natural, honest, and gentle skincare for sensitive bodies. No harsh chemicals, just nature.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-bold text-sage-900 mb-4">Shop</h4>
                    <ul className="space-y-2 text-sm text-sage-600">
                        <li><Link href="/products" className="hover:underline">All Products</Link></li>
                        <li><Link href="/products?category=hand-care" className="hover:underline">Hand Care</Link></li>
                        <li><Link href="/products?category=foot-care" className="hover:underline">Foot Care</Link></li>
                        <li><Link href="/products?category=body-care" className="hover:underline">Body Care</Link></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="font-bold text-sage-900 mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-sage-600">
                        <li><Link href="/track-order" className="hover:underline">Track Order</Link></li>
                        <li><Link href="/shipping" className="hover:underline">Shipping & Returns</Link></li>
                        <li><Link href="/faq" className="hover:underline">FAQs</Link></li>
                        <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold text-sage-900 mb-4">Stay in the Loop</h4>
                    <p className="text-xs text-sage-600 mb-4">Join our newsletter for calming tips and gentle offers.</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Your email"
                            className="px-4 py-2 rounded-lg border border-sage-200 text-sm w-full bg-white focus:outline-none focus:ring-1 focus:ring-sage-400"
                        />
                        <button className="px-4 py-2 bg-sage-500 text-white text-xs font-bold rounded-lg hover:bg-sage-600">
                            Join
                        </button>
                    </div>
                </div>

            </div>
            <div className="mt-12 text-center text-xs opacity-60">
                &copy; {new Date().getFullYear()} Hush Gentle. All rights reserved.
            </div>
        </footer>
    )
}
