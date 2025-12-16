import { getCouponById, updateCoupon } from '@/lib/actions/coupons'
import { requireAdmin } from '@/lib/utils/admin-check'
import { redirect, notFound } from 'next/navigation'
import CouponForm from '@/components/admin/CouponForm'

export default async function EditCouponPage({ params }: { params: { id: string } }) {
    await requireAdmin()
    const coupon = await getCouponById(params.id)

    if (!coupon) {
        notFound()
    }

    async function handleSubmit(formData: FormData) {
        'use server'
        try {
            await updateCoupon(params.id, formData)
            redirect('/dashboard/coupons')
        } catch (error: any) {
            return { error: error.message || 'Failed to update coupon' }
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Edit Coupon</h1>
                <p className="text-gray-600 mt-1">Update coupon: {coupon.code}</p>
            </div>

            <CouponForm action={handleSubmit} coupon={coupon} />
        </div>
    )
}

