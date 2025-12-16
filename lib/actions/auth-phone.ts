'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Send OTP to phone number
 */
export async function sendOTP(phoneNumber: string) {
    const supabase = createClient()
    
    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
    
    const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
    })

    if (error) {
        return { success: false, message: error.message }
    }

    return { success: true, message: 'OTP sent successfully' }
}

/**
 * Verify OTP and sign in
 */
export async function verifyOTP(prevState: { success: boolean; message: string } | null, formData: FormData) {
    const supabase = createClient()
    const phoneNumber = formData.get('phoneNumber') as string
    const token = formData.get('otp') as string
    const redirectTo = formData.get('redirectTo') as string || '/account/dashboard'
    
    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
    
    const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
    })

    if (error) {
        return { success: false, message: error.message }
    }

    if (!data.user) {
        return { success: false, message: 'Verification failed' }
    }

    // Merge anonymous cart with user cart on login
    const { mergeCartsOnLogin } = await import('@/lib/actions/cart')
    await mergeCartsOnLogin()

    revalidatePath('/', 'layout')
    
    const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/account/dashboard'
    redirect(safeRedirect)
}

