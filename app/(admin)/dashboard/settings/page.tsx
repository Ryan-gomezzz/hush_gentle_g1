import { requireAdmin } from '@/lib/utils/admin-check'
import Link from 'next/link'
import { Settings, Truck, Bell, Package } from 'lucide-react'

export default async function AdminSettingsPage() {
    await requireAdmin()

    const settingsSections = [
        {
            href: '/dashboard/settings/delivery',
            title: 'Delivery Settings',
            description: 'Configure delivery time estimates by pincode',
            icon: Truck,
        },
        {
            href: '/dashboard/settings/notifications',
            title: 'Notifications',
            description: 'Configure email and SMS notification settings',
            icon: Bell,
        },
    ]

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your store settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingsSections.map((section) => {
                    const Icon = section.icon
                    return (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-sage-100 rounded-lg p-3">
                                    <Icon className="w-6 h-6 text-sage-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-serif text-gray-800 mb-2">{section.title}</h2>
                                    <p className="text-gray-600 text-sm">{section.description}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

