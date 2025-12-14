'use server'

import { createClient } from '@/lib/supabase-server'
import { Product } from '@/types'

export async function getProducts(categorySlug?: string): Promise<Product[]> {
    const supabase = createClient()

    let query = supabase
        .from('products')
        .select('*, category:categories(slug, name)')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

    if (categorySlug) {
        // We need to join with categories to filter by slug
        // However, Supabase complex filtering on joined tables usually requires inner joins or valid foreign keys.
        // simpler approach: fetch category ID first or use !inner if allowed.
        // For now, let's just fetching all and filtering client side if volume is small, or use correct join syntax.
        // Correct Supabase syntax for filtering on foreign table:
        query = supabase
            .from('products')
            .select('*, category:categories!inner(slug, name)')
            .eq('is_archived', false)
            .eq('category.slug', categorySlug)
            .order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(slug, name)')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data as Product
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const supabase = createClient()

    const { data: featured, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_archived', false)
        .limit(4)

    if (error) {
        console.error('Error fetching featured products:', error)
        return []
    }

    if (featured && featured.length > 0) {
        return featured as Product[]
    }

    // Fallback: Get latest 4 products if no featured ones exist
    const { data: latest, error: fallbackError } = await supabase
        .from('products')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(4)

    if (fallbackError) {
        console.error('Error fetching fallback products:', fallbackError)
        return []
    }

    return latest as Product[]
}
