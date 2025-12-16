'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface Address {
  id: string
  user_id: string
  type: 'delivery' | 'billing'
  full_name: string
  email: string
  phone?: string
  address: string
  city: string
  state?: string
  zip_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export async function getUserAddresses(userId: string, type?: 'delivery' | 'billing'): Promise<Address[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching addresses:', error)
    return []
  }

  return data as Address[]
}

export async function createAddress(
  userId: string,
  addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  type: 'delivery' | 'billing'
) {
  const supabase = createClient()

  // Check limits
  if (type === 'delivery') {
    const { data: existing } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'delivery')

    if (existing && existing.length >= 2) {
      throw new Error('Maximum 2 delivery addresses allowed')
    }
  } else {
    const { data: existing } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'billing')

    if (existing && existing.length >= 1) {
      throw new Error('Maximum 1 billing address allowed')
    }
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      user_id: userId,
      ...addressData,
      type,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating address:', error)
    throw new Error('Failed to create address')
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')
  return data
}

export async function updateAddress(addressId: string, addressData: Partial<Address>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_addresses')
    .update(addressData)
    .eq('id', addressId)
    .select()
    .single()

  if (error) {
    console.error('Error updating address:', error)
    throw new Error('Failed to update address')
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')
  return data
}

export async function deleteAddress(addressId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', addressId)

  if (error) {
    console.error('Error deleting address:', error)
    throw new Error('Failed to delete address')
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')
}

export async function setDefaultAddress(addressId: string, type: 'delivery' | 'billing') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Unset all other defaults of the same type
  await supabase
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .eq('type', type)

  // Set this address as default
  const { data, error } = await supabase
    .from('user_addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single()

  if (error) {
    console.error('Error setting default address:', error)
    throw new Error('Failed to set default address')
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')
  return data
}

