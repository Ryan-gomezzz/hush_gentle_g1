'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Star, MessageCircle, Settings, BarChart, Ticket, Menu, X } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/products', label: 'Products', icon: Package },
        { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/dashboard/coupons', label: 'Coupons', icon: Ticket },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
        { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
        { href: '/dashboard/chatbot', label: 'Chatbot', icon: MessageCircle },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-sage-900 text-white p-6 transition-transform duration-300 md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif">Hush Admin</h2>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 hover:bg-sage-800 rounded"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-sage-800 text-white'
                                    : 'opacity-80 hover:opacity-100 hover:bg-sage-800/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-white border-b border-gray-200 flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-serif text-lg text-sage-900">Dashboard</span>
                </div>

                <div className="p-4 md:p-8 overflow-x-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
