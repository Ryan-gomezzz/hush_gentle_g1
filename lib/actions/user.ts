'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import { Product } from '@/types'

/**
 * DPDP Act Compliance: Export all user data
 * Returns a JSON object containing all user-related data
 */
export async function exportUserData(): Promise<{
    profile: any
    orders: any[]
    cart: any
    wishlist: any
    addresses: any[]
    productViews: any[]
    chatbotSessions: any[]
    analyticsEvents: any[]
} | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Fetch all user data in parallel
    const [
        { data: profile },
        { data: orders },
        { data: cart },
        { data: wishlist },
        { data: addresses },
        { data: productViews },
        { data: chatbotSessions },
        { data: analyticsEvents },
    ] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
        supabase
            .from('orders')
            .select('*, items:order_items(*, product:products(id, name, slug))')
            .eq('user_id', user.id),
        supabase
            .from('carts')
            .select('*, items:cart_items(*, product:products(id, name, slug))')
            .eq('user_id', user.id)
            .single(),
        supabase
            .from('wishlists')
            .select('*, items:wishlist_items(*, product:products(id, name, slug))')
            .eq('user_id', user.id)
            .single(),
        supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id),
        supabase
            .from('user_product_views')
            .select('*, product:products(id, name, slug)')
            .eq('user_id', user.id),
        supabase
            .from('chatbot_sessions')
            .select('*, messages:chatbot_messages(*)')
            .eq('user_id', user.id),
        supabase
            .from('analytics_events')
            .select('*')
            .eq('user_id', user.id),
    ])

    return {
        profile: profile || null,
        orders: orders || [],
        cart: cart || null,
        wishlist: wishlist || null,
        addresses: addresses || [],
        productViews: productViews || [],
        chatbotSessions: chatbotSessions || [],
        analyticsEvents: analyticsEvents || [],
    }
}

/**
 * DPDP Act Compliance: Delete all user data (Right to Erasure)
 * This will delete all user-related data from the database
 * Note: Orders may need to be retained for legal/compliance reasons (adjust as needed)
 */
export async function deleteUserData(): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Delete user data in order (respecting foreign key constraints)
    // Note: Some data like orders may need to be anonymized rather than deleted for legal compliance
    
    await Promise.all([
        // Delete user addresses
        supabase
            .from('user_addresses')
            .delete()
            .eq('user_id', user.id),
        
        // Delete wishlist items and wishlist
        supabase
            .from('wishlist_items')
            .delete()
            .in('wishlist_id', 
                (await supabase
                    .from('wishlists')
                    .select('id')
                    .eq('user_id', user.id)
                ).data?.map(w => w.id) || []
            ),
        supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id),
        
        // Delete cart items and cart
        supabase
            .from('cart_items')
            .delete()
            .in('cart_id',
                (await supabase
                    .from('carts')
                    .select('id')
                    .eq('user_id', user.id)
                ).data?.map(c => c.id) || []
            ),
        supabase
            .from('carts')
            .delete()
            .eq('user_id', user.id),
        
        // Delete product views
        supabase
            .from('user_product_views')
            .delete()
            .eq('user_id', user.id),
        
        // Delete chatbot messages and sessions
        supabase
            .from('chatbot_messages')
            .delete()
            .in('session_id',
                (await supabase
                    .from('chatbot_sessions')
                    .select('id')
                    .eq('user_id', user.id)
                ).data?.map(s => s.id) || []
            ),
        supabase
            .from('chatbot_sessions')
            .delete()
            .eq('user_id', user.id),
        
        // Delete analytics events (anonymize user_id)
        supabase
            .from('analytics_events')
            .update({ user_id: null })
            .eq('user_id', user.id),
        
        // Anonymize orders (keep for legal compliance but remove PII)
        // Note: Adjust this based on your legal requirements
        supabase
            .from('orders')
            .update({ 
                user_id: null,
                shipping_details: { anonymized: true }
            })
            .eq('user_id', user.id),
        
        // Delete profile
        supabase
            .from('profiles')
            .delete()
            .eq('id', user.id),
    ])

    // Delete auth user (requires admin client)
    try {
        const adminClient = createAdminClient()
        await adminClient.auth.admin.deleteUser(user.id)
    } catch (error) {
        console.error('Error deleting auth user:', error)
        // Profile deletion above should handle most cleanup
    }
}

/**
 * Check if user has consented to analytics tracking
 */
export async function hasAnalyticsConsent(): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    // Check if consent is stored in profile metadata or a separate consent table
    // For now, we'll check a simple flag - you may want to create a consent table
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

    // Default to false (opt-in)
    // You can add a consent field to profiles table or create a separate consent table
    return false
}

/**
 * Set analytics consent
 */
export async function setAnalyticsConsent(consent: boolean): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Store consent in profile or separate consent table
    // For now, this is a placeholder - implement based on your schema
    // You may want to add a `analytics_consent` field to profiles table
    // or create a `user_consents` table
    // Example implementation:
    // await supabase
    //     .from('profiles')
    //     .update({ analytics_consent: consent })
    //     .eq('id', user.id)
}

/**
 * Track a product view for a user
 */
export async function trackProductView(userId: string | undefined, productId: string) {
    if (!userId) return

    const supabase = createClient()
    
    // Delete old views for this user+product combination to keep only the most recent
    await supabase
        .from('user_product_views')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
    
    // Insert new view with current timestamp
    await supabase
        .from('user_product_views')
        .insert({
            user_id: userId,
            product_id: productId,
            viewed_at: new Date().toISOString(),
        })
}

/**
 * Get recently viewed products for a user
 */
export async function getRecentlyViewed(userId: string | undefined, limit: number = 8): Promise<Product[]> {
    if (!userId) return []

    const supabase = createClient()
    
    const { data: views } = await supabase
        .from('user_product_views')
        .select('product_id, viewed_at')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit)

    if (!views || views.length === 0) return []

    const productIds = views.map(v => v.product_id)
    
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('is_archived', false)

    if (!products) return []

    // Sort products by view order
    const productMap = new Map(products.map(p => [p.id, p]))
    return views
        .map(v => productMap.get(v.product_id))
        .filter((p): p is Product => p !== undefined)
}
