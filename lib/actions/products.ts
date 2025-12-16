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
        // First get the category ID by slug
        const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single()

        if (category) {
            query = query.eq('category_id', category.id)
        } else {
            // Category not found, return empty array
            return []
        }
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product & { skus?: any[] } | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(slug, name), skus:product_skus(*)')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data as Product & { skus?: any[] }
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

    // Validate and sanitize inputs
    const name = (formData.get('name') as string)?.trim() || ''
    const slug = (formData.get('slug') as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || ''
    const description = (formData.get('description') as string)?.trim() || ''
    const priceStr = formData.get('price') as string
    const stockStr = formData.get('stock') as string
    const categoryId = (formData.get('category_id') as string)?.trim() || ''
    const isFeatured = formData.get('is_featured') === 'true'

    // Validate required fields
    if (!name || !slug || !description) {
        throw new Error('Name, slug, and description are required')
    }

    // Validate price and stock
    const price = parseFloat(priceStr)
    const stock = parseInt(stockStr)

    if (isNaN(price) || price < 0) {
        throw new Error('Invalid price')
    }

    if (isNaN(stock) || stock < 0) {
        throw new Error('Invalid stock quantity')
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new Error('Slug must contain only lowercase letters, numbers, and hyphens')
    }
    
    // Parse images - support JSON array from ImageUpload component or comma/newline-separated URLs
    const imagesInput = formData.get('images') as string || ''
    let images: string[] = []
    
    try {
        // Try to parse as JSON array first (from ImageUpload component)
        const parsed = JSON.parse(imagesInput)
        if (Array.isArray(parsed)) {
            images = parsed.filter(Boolean)
        } else {
            // Fallback to string parsing
            images = imagesInput
                .split(/[,\n]/)
                .map(img => img.trim())
                .filter(Boolean)
        }
    } catch {
        // Not JSON, parse as comma/newline-separated string
        images = imagesInput
            .split(/[,\n]/)
            .map(img => img.trim())
            .filter(Boolean)
    }
    
    if (images.length === 0) {
        throw new Error('At least one image is required')
    }
    
    // Parse attributes
    const ingredients = (formData.get('ingredients') as string)?.split(',').filter(Boolean) || []
    const benefits = formData.get('benefits') as string || ''
    const usage = formData.get('usage') as string || ''

    const attributes = {
        ingredients,
        benefits,
        usage,
    }

    const { data: product, error } = await supabase
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

    // Create SKUs if provided
    const skuCount = parseInt(formData.get('sku_count') as string) || 0
    if (skuCount > 0 && product) {
        const skus = []
        for (let i = 0; i < skuCount; i++) {
            const size = formData.get(`sku_size_${i}`) as string
            const priceStr = formData.get(`sku_price_${i}`) as string
            const stockStr = formData.get(`sku_stock_${i}`) as string
            const skuCode = formData.get(`sku_code_${i}`) as string

            if (size && stockStr) {
                skus.push({
                    product_id: product.id,
                    size,
                    price: priceStr ? parseFloat(priceStr) : null,
                    stock: parseInt(stockStr),
                    sku_code: skuCode || null,
                })
            }
        }

        if (skus.length > 0) {
            const { error: skuError } = await supabase
                .from('product_skus')
                .insert(skus)

            if (skuError) {
                console.error('Error creating SKUs:', skuError)
                // Don't throw - product is created, SKUs can be added later
            }
        }
    }

    return product
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
    
    // Parse images - support JSON array from ImageUpload component or comma-separated URLs
    const imagesInput = formData.get('images') as string || ''
    let images: string[] = []
    
    try {
        // Try to parse as JSON array first (from ImageUpload component)
        const parsed = JSON.parse(imagesInput)
        if (Array.isArray(parsed)) {
            images = parsed.filter(Boolean)
        } else {
            // Fallback to string parsing
            images = imagesInput
                .split(',')
                .map(img => img.trim())
                .filter(Boolean)
        }
    } catch {
        // Not JSON, parse as comma-separated string
        images = imagesInput
            .split(',')
            .map(img => img.trim())
            .filter(Boolean)
    }
    
    if (images.length === 0) {
        throw new Error('At least one image is required')
    }
    
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