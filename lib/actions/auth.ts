'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { AuthState } from '@/lib/auth'

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
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
    redirect('/')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    const { error } = await supabase.auth.signUp({
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

    return { message: 'Check your email to continue sign in process.' }
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
