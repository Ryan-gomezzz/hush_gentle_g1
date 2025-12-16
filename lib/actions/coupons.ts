'use server'

import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'

export type Coupon = {
    id: string
    code: string
    discount_type: 'percentage'
    discount_value: number
    max_uses_total: number | null
    max_uses_per_user: number
    used_count: number
    is_active: boolean
    valid_from: string
    valid_until: string | null
    min_order_amount: number
    created_at: string
    updated_at: string
}

export async function getAllCoupons(): Promise<Coupon[]> {
    await requireAdmin()
    const supabase = createClient()

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching coupons:', error)
        return []
    }

    return data || []
}

export async function getCouponById(id: string): Promise<Coupon | null> {
    await requireAdmin()
    const supabase = createClient()

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        console.error('Error fetching coupon:', error)
        return null
    }

    return data
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

    if (error || !data) {
        return null
    }

    return data
}

export async function validateCoupon(
    code: string,
    userId: string | null,
    orderAmount: number
): Promise<{
    isValid: boolean
    coupon: Coupon | null
    discountAmount: number
    errorMessage: string | null
}> {
    const supabase = createClient()

    // Call the database function
    const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code: code.toUpperCase(),
        user_uuid: userId,
        order_amount: orderAmount,
    })

    if (error || !data || !Array.isArray(data) || data.length === 0) {
        return {
            isValid: false,
            coupon: null,
            discountAmount: 0,
            errorMessage: 'Invalid coupon code',
        }
    }

    const result = data[0] as any

    if (!result.is_valid) {
        return {
            isValid: false,
            coupon: null,
            discountAmount: 0,
            errorMessage: result.error_message || 'Invalid coupon code',
        }
    }

    // Fetch the full coupon details
    const coupon = await getCouponByCode(code)

    return {
        isValid: true,
        coupon,
        discountAmount: Number(result.discount_amount),
        errorMessage: null,
    }
}

export async function createCoupon(formData: FormData) {
    await requireAdmin()
    const supabase = createClient()

    const code = (formData.get('code') as string)?.trim().toUpperCase()
    const discountValue = Number(formData.get('discount_value'))
    const maxUsesTotal = formData.get('max_uses_total') ? Number(formData.get('max_uses_total')) : null
    const maxUsesPerUser = Number(formData.get('max_uses_per_user')) || 1
    const validFrom = formData.get('valid_from') as string
    const validUntil = formData.get('valid_until') as string || null
    const minOrderAmount = Number(formData.get('min_order_amount')) || 0
    const isActive = formData.get('is_active') === 'true'

    // Validation
    if (!code || code.length < 3) {
        throw new Error('Coupon code must be at least 3 characters')
    }

    if (discountValue <= 0 || discountValue > 100) {
        throw new Error('Discount value must be between 1 and 100')
    }

    if (maxUsesTotal !== null && maxUsesTotal < 1) {
        throw new Error('Max uses total must be at least 1')
    }

    if (maxUsesPerUser < 1) {
        throw new Error('Max uses per user must be at least 1')
    }

    if (minOrderAmount < 0) {
        throw new Error('Minimum order amount cannot be negative')
    }

    // Check if code already exists
    const existing = await getCouponByCode(code)
    if (existing) {
        throw new Error('Coupon code already exists')
    }

    const { data, error } = await supabase
        .from('coupons')
        .insert({
            code,
            discount_type: 'percentage',
            discount_value: discountValue,
            max_uses_total: maxUsesTotal,
            max_uses_per_user: maxUsesPerUser,
            is_active: isActive,
            valid_from: validFrom || new Date().toISOString(),
            valid_until: validUntil || null,
            min_order_amount: minOrderAmount,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating coupon:', error)
        throw new Error('Failed to create coupon')
    }

    return data
}

export async function updateCoupon(id: string, formData: FormData) {
    await requireAdmin()
    const supabase = createClient()

    const discountValue = Number(formData.get('discount_value'))
    const maxUsesTotal = formData.get('max_uses_total') ? Number(formData.get('max_uses_total')) : null
    const maxUsesPerUser = Number(formData.get('max_uses_per_user')) || 1
    const validFrom = formData.get('valid_from') as string
    const validUntil = formData.get('valid_until') as string || null
    const minOrderAmount = Number(formData.get('min_order_amount')) || 0
    const isActive = formData.get('is_active') === 'true'

    // Validation
    if (discountValue <= 0 || discountValue > 100) {
        throw new Error('Discount value must be between 1 and 100')
    }

    if (maxUsesTotal !== null && maxUsesTotal < 1) {
        throw new Error('Max uses total must be at least 1')
    }

    if (maxUsesPerUser < 1) {
        throw new Error('Max uses per user must be at least 1')
    }

    if (minOrderAmount < 0) {
        throw new Error('Minimum order amount cannot be negative')
    }

    const { data, error } = await supabase
        .from('coupons')
        .update({
            discount_value: discountValue,
            max_uses_total: maxUsesTotal,
            max_uses_per_user: maxUsesPerUser,
            is_active: isActive,
            valid_from: validFrom,
            valid_until: validUntil || null,
            min_order_amount: minOrderAmount,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating coupon:', error)
        throw new Error('Failed to update coupon')
    }

    return data
}

export async function deleteCoupon(id: string) {
    await requireAdmin()
    const supabase = createClient()

    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting coupon:', error)
        throw new Error('Failed to delete coupon')
    }
}

