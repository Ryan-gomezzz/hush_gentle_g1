import { getAllCoupons, deleteCoupon } from '@/lib/actions/coupons'
import { requireAdmin } from '@/lib/utils/admin-check'
import Link from 'next/link'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteCouponButton from '@/components/admin/DeleteCouponButton'

export default async function AdminCouponsPage() {
    await requireAdmin()
    const coupons = await getAllCoupons()

    const formatDate = (date: string | null) => {
        if (!date) return 'No expiry'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const isActive = (coupon: any) => {
        if (!coupon.is_active) return false
        const now = new Date()
        const validFrom = new Date(coupon.valid_from)
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

        if (validFrom > now) return false
        if (validUntil && validUntil < now) return false
        return true
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-serif text-gray-800">Coupons</h1>
                    <p className="text-gray-600 mt-1">Manage discount codes</p>
                </div>
                <Link href="/dashboard/coupons/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Coupon
                    </Button>
                </Link>
            </div>

            {coupons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500 mb-4">No coupons created yet</p>
                    <Link href="/dashboard/coupons/new">
                        <Button>Create Your First Coupon</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Discount</th>
                                <th className="px-6 py-3">Usage</th>
                                <th className="px-6 py-3">Valid From</th>
                                <th className="px-6 py-3">Valid Until</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-medium text-gray-900">{coupon.code}</div>
                                        {coupon.min_order_amount > 0 && (
                                            <div className="text-xs text-gray-500">
                                                Min: ₹{coupon.min_order_amount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-sage-900">
                                            {coupon.discount_value}% OFF
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700">
                                            {coupon.used_count} / {coupon.max_uses_total || '∞'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {coupon.max_uses_per_user} per user
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {formatDate(coupon.valid_from)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {formatDate(coupon.valid_until)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                isActive(coupon)
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {isActive(coupon) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/coupons/${coupon.id}`}
                                                className="text-gray-400 hover:text-sage-600"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

