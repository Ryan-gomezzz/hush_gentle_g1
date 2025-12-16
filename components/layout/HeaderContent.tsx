'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, Heart } from 'lucide-react'
import SearchBar from './SearchBar'
import { useHeaderContext } from './HeaderWrapper'

export default function HeaderContent({ user, itemCount }: { user: any, itemCount: number }) {
    const { isHomepage } = useHeaderContext()
    const textColorClass = isHomepage 
        ? 'text-white hover:text-white/80' 
        : 'text-sage-700 hover:text-sage-900'

    return (
        <nav className="flex justify-between items-center max-w-7xl mx-auto gap-2 md:gap-4">
            {/* Left: Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
                <Image
                    src="/images/logo.png"
                    alt="Hush Gentle Logo"
                    width={120}
                    height={40}
                    className="object-contain h-7 md:h-8 w-auto"
                    priority
                />
            </Link>

            {/* Center: Shop Link */}
            <div className="hidden lg:flex items-center">
                <Link 
                    href="/products" 
                    className={`font-medium text-sm uppercase tracking-wider transition-colors ${textColorClass}`}
                >
                    Shop
                </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xs md:max-w-md mx-2 md:mx-4 hidden sm:block">
                <SearchBar />
            </div>

            {/* Right: Icons Group */}
            <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
                {/* Wishlist Icon */}
                <Link 
                    href="/wishlist" 
                    className={`transition-colors relative ${textColorClass}`}
                    aria-label="Wishlist"
                >
                    <Heart className="w-5 h-5" />
                </Link>

                {/* Cart Icon */}
                <Link 
                    href="/cart" 
                    className={`relative transition-colors ${textColorClass}`}
                    aria-label="Shopping Cart"
                >
                    <ShoppingBag className="w-5 h-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-sage-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium">
                            {itemCount}
                        </span>
                    )}
                </Link>

                {/* User/Login Icon */}
                {user ? (
                    <div className="relative group">
                        <Link 
                            href="/account/dashboard" 
                            className={`transition-colors ${textColorClass}`}
                            aria-label="Account"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <Link 
                        href="/login" 
                        className={`transition-colors ${textColorClass}`}
                        aria-label="Login"
                    >
                        <User className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </nav>
    )
}

