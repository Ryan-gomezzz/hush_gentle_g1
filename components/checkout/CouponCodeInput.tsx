'use client'

import { useState, useTransition } from 'react'
import { validateCoupon } from '@/lib/actions/coupons'
import { Check, X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CouponCodeInputProps {
    orderTotal: number
    onCouponApplied: (code: string, discountAmount: number) => void
    onCouponRemoved: () => void
}

export default function CouponCodeInput({ orderTotal, onCouponApplied, onCouponRemoved }: CouponCodeInputProps) {
    const [code, setCode] = useState('')
    const [isPending, startTransition] = useTransition()
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleApply = () => {
        if (!code.trim()) {
            setError('Please enter a coupon code')
            return
        }

        setError(null)
        startTransition(async () => {
            try {
                // Get user ID if available (for per-user validation)
                // Note: userId will be validated server-side during order creation
                const result = await validateCoupon(code.trim(), null, orderTotal)

                if (result.isValid && result.coupon) {
                    setAppliedCoupon({
                        code: result.coupon.code,
                        discountAmount: result.discountAmount,
                    })
                    onCouponApplied(result.coupon.code, result.discountAmount)
                    setError(null)
                } else {
                    setError(result.errorMessage || 'Invalid coupon code')
                    setAppliedCoupon(null)
                    onCouponRemoved()
                }
            } catch (err: any) {
                setError(err.message || 'Failed to validate coupon')
                setAppliedCoupon(null)
                onCouponRemoved()
            }
        })
    }

    const handleRemove = () => {
        setAppliedCoupon(null)
        setCode('')
        setError(null)
        onCouponRemoved()
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-sage-700">Coupon Code</label>
            {appliedCoupon ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Check className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                        <div className="font-medium text-green-900">{appliedCoupon.code}</div>
                        <div className="text-sm text-green-700">
                            Discount: ₹{appliedCoupon.discountAmount.toFixed(2)}
                        </div>
                    </div>
                    <input type="hidden" name="coupon_code" value={appliedCoupon.code} />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-green-600 hover:text-green-800"
                        title="Remove coupon"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.toUpperCase())
                                setError(null)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleApply()
                                }
                            }}
                            placeholder="Enter coupon code"
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-sage-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                            disabled={isPending}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={isPending || !code.trim()}
                        variant="outline"
                    >
                        {isPending ? 'Applying...' : 'Apply'}
                    </Button>
                </div>
            )}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    )
}

