'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Star, MessageCircle, Settings, BarChart } from 'lucide-react'

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
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
        { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
        { href: '/dashboard/chatbot', label: 'Chatbot', icon: MessageCircle },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-sage-900 text-white p-6 hidden md:block">
                <h2 className="text-2xl font-serif mb-8">Hush Admin</h2>
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
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
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
