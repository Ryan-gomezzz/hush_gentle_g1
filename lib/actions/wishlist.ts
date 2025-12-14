'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getWishlist() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: wishlist } = await supabase
        .from('wishlists')
        .select('*, items:wishlist_items(*, product:products(*))')
        .eq('user_id', user.id)
        .single()

    return wishlist
}

export async function addToWishlist(productId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to add items to wishlist')
    }

    // Get or create wishlist
    let { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!wishlist) {
        const { data: newWishlist, error } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id })
            .select()
            .single()

        if (error || !newWishlist) {
            throw new Error('Failed to create wishlist')
        }
        wishlist = newWishlist
    }

    if (!wishlist?.id) {
        throw new Error('Failed to load wishlist')
    }

    // Check if item already exists
    const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('wishlist_id', wishlist.id)
        .eq('product_id', productId)
        .single()

    if (existing) {
        // Already in wishlist
        return
    }

    // Add item
    const { error } = await supabase
        .from('wishlist_items')
        .insert({
            wishlist_id: wishlist.id,
            product_id: productId,
        })

    if (error) {
        throw new Error('Failed to add to wishlist')
    }

    revalidatePath('/wishlist')
}

export async function removeFromWishlist(productId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in')
    }

    const { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!wishlist) {
        return
    }

    await supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlist.id)
        .eq('product_id', productId)

    revalidatePath('/wishlist')
}

export async function isInWishlist(productId: string): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!wishlist) return false

    const { data: item } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('wishlist_id', wishlist.id)
        .eq('product_id', productId)
        .single()

    return !!item
}

