'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { trackEvent } from '@/lib/analytics'

/**
 * Merges anonymous cart with user cart on login
 * Should be called after user logs in
 */
export async function mergeCartsOnLogin() {
    const supabase = createClient()
    const cookieStore = cookies()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const anonymousCartId = cookieStore.get('cartId')?.value
    if (!anonymousCartId) return

    // Get user's existing cart
    const { data: userCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

    // Get anonymous cart items
    const { data: anonymousItems } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('cart_id', anonymousCartId)

    if (!anonymousItems || anonymousItems.length === 0) {
        // Clean up empty anonymous cart
        await supabase.from('carts').delete().eq('id', anonymousCartId)
        cookieStore.delete('cartId')
        return
    }

    let targetCartId: string

    if (userCart) {
        // User has existing cart, merge items
        targetCartId = userCart.id
        
        for (const item of anonymousItems) {
            // Check if product already exists in user cart
            const { data: existingItem } = await supabase
                .from('cart_items')
                .select('*')
                .eq('cart_id', targetCartId)
                .eq('product_id', item.product_id)
                .single()

            if (existingItem) {
                // Update quantity
                await supabase
                    .from('cart_items')
                    .update({ quantity: existingItem.quantity + item.quantity })
                    .eq('id', existingItem.id)
            } else {
                // Insert new item
                await supabase
                    .from('cart_items')
                    .insert({
                        cart_id: targetCartId,
                        product_id: item.product_id,
                        quantity: item.quantity,
                    })
            }
        }

        // Delete anonymous cart
        await supabase.from('carts').delete().eq('id', anonymousCartId)
    } else {
        // No user cart, link anonymous cart to user
        await supabase
            .from('carts')
            .update({ user_id: user.id })
            .eq('id', anonymousCartId)
        
        targetCartId = anonymousCartId
    }

    cookieStore.delete('cartId')
    revalidatePath('/cart')
    revalidatePath('/', 'layout')
}

export async function getCart() {
    const supabase = createClient()
    const cookieStore = cookies()
    const { data: { user } } = await supabase.auth.getUser()

    let cartId: string | undefined

    if (user) {
        // Get user's cart
        const { data: userCart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .single()
        
        cartId = userCart?.id
    } else {
        // Get anonymous cart from cookie
        cartId = cookieStore.get('cartId')?.value
    }

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
    const { data: { user } } = await supabase.auth.getUser()

    // Validate stock
    const { data: product } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', productId)
        .single()

    if (!product) {
        throw new Error('Product not found')
    }

    if (product.stock < quantity) {
        throw new Error(`Only ${product.stock} items available in stock`)
    }

    let cartId: string | undefined

    if (user) {
        // Get or create user cart
        const { data: userCart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (userCart) {
            cartId = userCart.id
        } else {
            const { data: newCart, error: createError } = await supabase
                .from('carts')
                .insert({ user_id: user.id })
                .select()
                .single()

            if (createError || !newCart) {
                throw new Error('Failed to create cart')
            }
            cartId = newCart.id
        }
    } else {
        // Anonymous cart
        cartId = cookieStore.get('cartId')?.value

        if (!cartId) {
            const { data: newCart, error: createError } = await supabase
                .from('carts')
                .insert({ session_id: crypto.randomUUID() })
                .select()
                .single()

            if (createError || !newCart || !newCart.id) {
                throw new Error('Failed to create cart')
            }

            cartId = newCart.id
            if (cartId) {
                cookieStore.set('cartId', cartId)
            }
        }
    }

    if (!cartId) {
        throw new Error('Failed to get or create cart')
    }

    // Upsert Item
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single()

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity

    // Check stock again with new quantity
    if (product.stock < newQuantity) {
        throw new Error(`Only ${product.stock} items available in stock`)
    }

    if (existingItem) {
        await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
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

    // Track analytics
    await trackEvent(user?.id, 'add_to_cart', {
        product_id: productId,
        product_name: product.name,
        quantity: quantity,
    })

    revalidatePath('/cart')
    revalidatePath('/', 'layout')
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
    const supabase = createClient()

    if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return removeFromCart(itemId)
    }

    // Get item to check stock
    const { data: item } = await supabase
        .from('cart_items')
        .select('*, product:products(stock, name)')
        .eq('id', itemId)
        .single()

    if (!item) {
        throw new Error('Cart item not found')
    }

    if (item.product.stock < quantity) {
        throw new Error(`Only ${item.product.stock} items available in stock`)
    }

    await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)

    revalidatePath('/cart')
    revalidatePath('/', 'layout')
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
