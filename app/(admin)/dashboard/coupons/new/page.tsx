import { createCoupon } from '@/lib/actions/coupons'
import { requireAdmin } from '@/lib/utils/admin-check'
import { redirect } from 'next/navigation'
import CouponForm from '@/components/admin/CouponForm'

export default async function NewCouponPage() {
    await requireAdmin()

    async function handleSubmit(formData: FormData) {
        'use server'
        try {
            await createCoupon(formData)
            redirect('/dashboard/coupons')
        } catch (error: any) {
            return { error: error.message || 'Failed to create coupon' }
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Create Coupon</h1>
                <p className="text-gray-600 mt-1">Add a new discount code</p>
            </div>

            <CouponForm action={handleSubmit} />
        </div>
    )
}

