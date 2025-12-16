'use server'

import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'

export async function getAllDeliveryMappings() {
    await requireAdmin()
    const supabase = createClient()

    const { data, error } = await supabase
        .from('delivery_time_mappings')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching delivery mappings:', error)
        return []
    }

    return data || []
}

export async function createDeliveryMapping(formData: FormData) {
    await requireAdmin()
    const supabase = createClient()

    const pincodePattern = (formData.get('pincode_pattern') as string)?.trim()
    const estimatedDays = Number(formData.get('estimated_days'))
    const description = (formData.get('description') as string)?.trim() || null
    const priority = Number(formData.get('priority')) || 0
    const isActive = formData.get('is_active') === 'true'

    if (!pincodePattern || estimatedDays < 1) {
        throw new Error('Pincode pattern and estimated days are required')
    }

    const { data, error } = await supabase
        .from('delivery_time_mappings')
        .insert({
            pincode_pattern: pincodePattern,
            estimated_days: estimatedDays,
            description,
            priority,
            is_active: isActive,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating delivery mapping:', error)
        throw new Error('Failed to create delivery mapping')
    }

    return data
}

export async function updateDeliveryMapping(id: string, formData: FormData) {
    await requireAdmin()
    const supabase = createClient()

    const estimatedDays = Number(formData.get('estimated_days'))
    const description = (formData.get('description') as string)?.trim() || null
    const priority = Number(formData.get('priority')) || 0
    const isActive = formData.get('is_active') === 'true'

    if (estimatedDays < 1) {
        throw new Error('Estimated days must be at least 1')
    }

    const { data, error } = await supabase
        .from('delivery_time_mappings')
        .update({
            estimated_days: estimatedDays,
            description,
            priority,
            is_active: isActive,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating delivery mapping:', error)
        throw new Error('Failed to update delivery mapping')
    }

    return data
}

export async function deleteDeliveryMapping(id: string) {
    await requireAdmin()
    const supabase = createClient()

    const { error } = await supabase
        .from('delivery_time_mappings')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting delivery mapping:', error)
        throw new Error('Failed to delete delivery mapping')
    }
}

