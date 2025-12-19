'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ShoppingBag, User, Heart, ChevronRight, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'

interface MobileNavProps {
    user: any
    itemCount: number
}

export default function MobileNav({ user, itemCount }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <div className="lg:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -mr-2 text-current hover:opacity-70 transition-opacity"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[300px] h-full bg-white z-50 shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <span className="font-serif text-lg text-sage-900 font-medium">Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 -mr-2 text-sage-500 hover:text-sage-900 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4">
                                <div className="px-4 mb-6">
                                    <SearchBar />
                                </div>

                                <nav className="flex flex-col">
                                    <Link
                                        href="/"
                                        className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-sage-800 hover:bg-sage-50 transition-colors"
                                    >
                                        <span>Home</span>
                                        <ChevronRight className="w-4 h-4 text-sage-400" />
                                    </Link>
                                    <Link
                                        href="/products"
                                        className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-sage-800 hover:bg-sage-50 transition-colors"
                                    >
                                        <span>Shop All</span>
                                        <ChevronRight className="w-4 h-4 text-sage-400" />
                                    </Link>
                                    <Link
                                        href="/products?category=face-care"
                                        className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-sage-800 hover:bg-sage-50 transition-colors"
                                    >
                                        <span>Face Care</span>
                                        <ChevronRight className="w-4 h-4 text-sage-400" />
                                    </Link>
                                    <Link
                                        href="/products?category=body-care"
                                        className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-sage-800 hover:bg-sage-50 transition-colors"
                                    >
                                        <span>Body Care</span>
                                        <ChevronRight className="w-4 h-4 text-sage-400" />
                                    </Link>

                                    <div className="mt-6 px-6">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</p>
                                        <div className="space-y-4">
                                            {user ? (
                                                <Link
                                                    href="/account/dashboard"
                                                    className="flex items-center gap-3 text-sage-700 hover:text-sage-900"
                                                >
                                                    <User className="w-5 h-5" />
                                                    <span>My Account</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/login"
                                                    className="flex items-center gap-3 text-sage-700 hover:text-sage-900"
                                                >
                                                    <User className="w-5 h-5" />
                                                    <span>Log In / Sign Up</span>
                                                </Link>
                                            )}

                                            <Link
                                                href="/wishlist"
                                                className="flex items-center gap-3 text-sage-700 hover:text-sage-900"
                                            >
                                                <Heart className="w-5 h-5" />
                                                <span>Wishlist</span>
                                            </Link>

                                            <Link
                                                href="/cart"
                                                className="flex items-center gap-3 text-sage-700 hover:text-sage-900"
                                            >
                                                <div className="relative">
                                                    <ShoppingBag className="w-5 h-5" />
                                                    {itemCount > 0 && (
                                                        <span className="absolute -top-2 -right-2 bg-sage-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                                            {itemCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <span>Cart ({itemCount})</span>
                                            </Link>
                                        </div>
                                    </div>
                                </nav>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <p className="text-xs text-center text-gray-400">
                                    © 2024 Hush Gentle. All rights reserved.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
