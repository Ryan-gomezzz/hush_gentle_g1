'use server'

import { createClient } from '@/lib/supabase-server'

/**
 * Verifies if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return profile?.is_admin === true
}

/**
 * Throws an error if the current user is not an admin
 * Use this in server actions that require admin access
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

