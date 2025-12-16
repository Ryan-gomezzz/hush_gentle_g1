'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Coupon } from '@/lib/actions/coupons'

interface CouponFormProps {
    action: (formData: FormData) => Promise<{ error?: string } | void>
    coupon?: Coupon
}

export default function CouponForm({ action, coupon }: CouponFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await action(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code *
                    </label>
                    <input
                        type="text"
                        name="code"
                        required
                        defaultValue={coupon?.code}
                        disabled={!!coupon} // Can't edit code after creation
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500 disabled:bg-gray-50"
                        placeholder="SUMMER2024"
                        pattern="[A-Z0-9]+"
                        title="Only uppercase letters and numbers"
                    />
                    {coupon && (
                        <p className="text-xs text-gray-500 mt-1">Coupon code cannot be changed</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value (%) *
                    </label>
                    <input
                        type="number"
                        name="discount_value"
                        required
                        min="1"
                        max="100"
                        step="0.01"
                        defaultValue={coupon?.discount_value || ''}
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                        placeholder="10"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Uses Total
                    </label>
                    <input
                        type="number"
                        name="max_uses_total"
                        min="1"
                        defaultValue={coupon?.max_uses_total || ''}
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                        placeholder="Leave empty for unlimited"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Uses Per User *
                    </label>
                    <input
                        type="number"
                        name="max_uses_per_user"
                        required
                        min="1"
                        defaultValue={coupon?.max_uses_per_user || 1}
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid From *
                    </label>
                    <input
                        type="datetime-local"
                        name="valid_from"
                        required
                        defaultValue={
                            coupon?.valid_from
                                ? new Date(coupon.valid_from).toISOString().slice(0, 16)
                                : new Date().toISOString().slice(0, 16)
                        }
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid Until
                    </label>
                    <input
                        type="datetime-local"
                        name="valid_until"
                        defaultValue={
                            coupon?.valid_until
                                ? new Date(coupon.valid_until).toISOString().slice(0, 16)
                                : ''
                        }
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Amount (₹)
                    </label>
                    <input
                        type="number"
                        name="min_order_amount"
                        min="0"
                        step="0.01"
                        defaultValue={coupon?.min_order_amount || 0}
                        className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>

                <div>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_active"
                            value="true"
                            defaultChecked={coupon?.is_active ?? true}
                            className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Link href="/dashboard/coupons">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}

