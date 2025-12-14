'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getCart() {
    const supabase = createClient()
    const cookieStore = cookies()
    const cartId = cookieStore.get('cartId')?.value

    if (!cartId) return null

    const { data: cart } = await supabase
        .from('carts')
        .select('*, items:cart_items(*, product:products(*))')
        .eq('id', cartId)
        .single()

    return cart
}

export async function addToCart(productId: string, quantity: number = 1) {
    const supabase = createClient()
    const cookieStore = cookies()
    let cartId = cookieStore.get('cartId')?.value

    // 1. Create cart if doesn't exist
    if (!cartId) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert({})
            .select()
            .single()

        if (createError || !newCart) {
            throw new Error('Failed to create cart')
        }

        cartId = newCart.id
        cookieStore.set('cartId', cartId!)
    }

    // 2. Upsert Item
    // Check if item exists to increment
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single()

    if (existingItem) {
        await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id)
    } else {
        await supabase
            .from('cart_items')
            .insert({
                cart_id: cartId,
                product_id: productId,
                quantity: quantity,
            })
    }

    revalidatePath('/cart')
    revalidatePath('/', 'layout') // Update cart count in header
}

export async function removeFromCart(itemId: string) {
    const supabase = createClient()
    await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

    revalidatePath('/cart')
    revalidatePath('/', 'layout')
}
