'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { AuthState } from '@/lib/auth'

export async function login(prevState: AuthState, formData: FormData, redirectTo: string = '/'): Promise<AuthState> {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { message: error.message }
    }

    // Merge anonymous cart with user cart on login
    const { mergeCartsOnLogin } = await import('@/lib/actions/cart')
    await mergeCartsOnLogin()

    revalidatePath('/', 'layout')
    
    // Redirect to dashboard for logged-in users, or specified URL
    const safeRedirect = redirectTo.startsWith('/') && redirectTo !== '/' ? redirectTo : '/account/dashboard'
    redirect(safeRedirect)
}

export async function signup(prevState: AuthState, formData: FormData, redirectTo: string = '/'): Promise<AuthState> {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    const { data: signupData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        return { message: error.message }
    }

    // Auto-confirm user for demo/testing (bypasses email confirmation)
    // This allows immediate login without checking email
    if (signupData.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
            const { createAdminClient } = await import('@/lib/supabase-server')
            const adminClient = createAdminClient()
            
            // Update user to confirmed status
            await adminClient.auth.admin.updateUserById(signupData.user.id, {
                email_confirm: true,
            })
        } catch (adminError) {
            // If auto-confirmation fails, user will need to check email
            console.warn('Auto-confirmation failed, user must verify email:', adminError)
            return { message: 'Check your email to continue sign in process.' }
        }
    }

    // Auto-login the user after successful signup
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (loginError) {
        return { message: 'Account created. Please log in.' }
    }

    // Merge anonymous cart with user cart on signup
    const { mergeCartsOnLogin } = await import('@/lib/actions/cart')
    await mergeCartsOnLogin()

    revalidatePath('/', 'layout')
    
    // Return success state with redirect URL - redirect to dashboard for new users
    const safeRedirect = redirectTo.startsWith('/') && redirectTo !== '/' ? redirectTo : '/account/dashboard'
    return { message: `SUCCESS_REDIRECT:${safeRedirect}` }
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
