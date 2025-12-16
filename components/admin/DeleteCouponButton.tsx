'use client'

import { useState, useTransition } from 'react'
import { deleteCoupon } from '@/lib/actions/coupons'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteCouponButtonProps {
    couponId: string
    couponCode: string
}

export default function DeleteCouponButton({ couponId, couponCode }: DeleteCouponButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleDelete = () => {
        if (!showConfirm) {
            setShowConfirm(true)
            return
        }

        startTransition(async () => {
            try {
                await deleteCoupon(couponId)
                router.refresh()
            } catch (error) {
                console.error('Failed to delete coupon:', error)
                alert('Failed to delete coupon')
            }
        })
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
            title={showConfirm ? 'Click again to confirm' : 'Delete'}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}

