import Link from 'next/link'
import Image from 'next/image'
import { getCart } from '@/lib/actions/cart'
import { ShoppingBag, User } from 'lucide-react'

export default async function Header() {
    const cart = await getCart()
    const itemCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

    return (
        <header className="py-4 px-6 md:px-12 bg-offwhite/90 sticky top-0 z-50 backdrop-blur-md border-b border-sage-100">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">

                {/* Logo */}
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <Image
                        src="/images/logo.png"
                        alt="Hush Gentle Logo"
                        width={150}
                        height={50}
                        className="object-contain h-10 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-8 text-sage-700 font-medium">
                    <Link href="/products" className="hover:text-sage-900 transition-colors">Shop</Link>
                    <Link href="/about" className="hover:text-sage-900 transition-colors">Our Story</Link>
                    <Link href="/ingredients" className="hover:text-sage-900 transition-colors">Ingredients</Link>
                </div>

                {/* Icons */}
                <div className="flex gap-6 items-center">
                    <Link href="/login" className="text-sage-700 hover:text-sage-900">
                        <User className="w-5 h-5" />
                    </Link>
                    <Link href="/cart" className="relative text-sage-700 hover:text-sage-900 flex items-center gap-1">
                        <ShoppingBag className="w-5 h-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-sage-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                {itemCount}
                            </span>
                        )}
                        <span className="hidden md:inline text-sm">Cart</span>
                    </Link>
                </div>
            </nav>
        </header>
    )
}
