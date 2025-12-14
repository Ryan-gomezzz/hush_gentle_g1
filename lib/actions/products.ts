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

// Admin functions
export async function getProductById(id: string): Promise<Product | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(slug, name)')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data as Product
}

export async function createProduct(formData: FormData) {
    const { requireAdmin } = await import('@/lib/utils/admin-check')
    await requireAdmin()

    const supabase = createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const categoryId = formData.get('category_id') as string
    const isFeatured = formData.get('is_featured') === 'true'
    const images = (formData.get('images') as string)?.split(',').filter(Boolean) || []
    
    // Parse attributes
    const ingredients = (formData.get('ingredients') as string)?.split(',').filter(Boolean) || []
    const benefits = formData.get('benefits') as string || ''
    const usage = formData.get('usage') as string || ''

    const attributes = {
        ingredients,
        benefits,
        usage,
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            name,
            slug,
            description,
            price,
            stock,
            category_id: categoryId || null,
            images,
            attributes,
            is_featured: isFeatured,
            is_archived: false,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating product:', error)
        throw new Error('Failed to create product')
    }

    return data
}

export async function updateProduct(id: string, formData: FormData) {
    const { requireAdmin } = await import('@/lib/utils/admin-check')
    await requireAdmin()

    const supabase = createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const categoryId = formData.get('category_id') as string
    const isFeatured = formData.get('is_featured') === 'true'
    const isArchived = formData.get('is_archived') === 'true'
    const images = (formData.get('images') as string)?.split(',').filter(Boolean) || []
    
    // Parse attributes
    const ingredients = (formData.get('ingredients') as string)?.split(',').filter(Boolean) || []
    const benefits = formData.get('benefits') as string || ''
    const usage = formData.get('usage') as string || ''

    const attributes = {
        ingredients,
        benefits,
        usage,
    }

    const { data, error } = await supabase
        .from('products')
        .update({
            name,
            slug,
            description,
            price,
            stock,
            category_id: categoryId || null,
            images,
            attributes,
            is_featured: isFeatured,
            is_archived: isArchived,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating product:', error)
        throw new Error('Failed to update product')
    }

    return data
}

export async function deleteProduct(id: string) {
    const { requireAdmin } = await import('@/lib/utils/admin-check')
    await requireAdmin()

    const supabase = createClient()

    // Soft delete by archiving
    const { error } = await supabase
        .from('products')
        .update({ is_archived: true })
        .eq('id', id)

    if (error) {
        console.error('Error deleting product:', error)
        throw new Error('Failed to delete product')
    }
}