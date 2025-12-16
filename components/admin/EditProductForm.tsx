'use client'

import { useState, useEffect } from 'react'
import ImageUpload from './ImageUpload'
import { Product } from '@/types'

interface EditProductFormProps {
    product: Product
    categories: Array<{ id: string; name: string; slug: string }>
    action: (formData: FormData) => Promise<void>
}

export default function EditProductForm({ product, categories, action }: EditProductFormProps) {
    const [imageUrls, setImageUrls] = useState<string[]>(product.images || [])

    useEffect(() => {
        setImageUrls(product.images || [])
    }, [product.images])

    async function handleSubmit(formData: FormData) {
        // Ensure images are included in form data
        if (imageUrls.length === 0) {
            alert('Please upload at least one product image')
            return
        }
        
        // Set the images as JSON string
        formData.set('images', JSON.stringify(imageUrls))
        
        await action(formData)
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={product.name}
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                    <input
                        name="slug"
                        type="text"
                        defaultValue={product.slug}
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    name="description"
                    rows={4}
                    defaultValue={product.description || ''}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={product.price}
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                    <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={product.stock}
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                        name="category_id"
                        defaultValue={product.category_id || ''}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <ImageUpload
                onImagesChange={setImageUrls}
                maxImages={10}
                existingImages={product.images || []}
            />

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                    <input
                        name="ingredients"
                        type="text"
                        defaultValue={product.attributes?.ingredients?.join(', ') || ''}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                        placeholder="Comma-separated: Shea Butter, Almond Oil, Vitamin E"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                    <textarea
                        name="benefits"
                        rows={2}
                        defaultValue={product.attributes?.benefits || ''}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                        placeholder="Key benefits of this product..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Instructions</label>
                    <textarea
                        name="usage"
                        rows={2}
                        defaultValue={product.attributes?.usage || ''}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                        placeholder="How to use this product..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-2">
                    <input
                        name="is_featured"
                        type="checkbox"
                        value="true"
                        defaultChecked={product.is_featured}
                        className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                    />
                    <span className="text-sm text-gray-700">Feature this product on homepage</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        name="is_archived"
                        type="checkbox"
                        value="true"
                        defaultChecked={product.is_archived}
                        className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                    />
                    <span className="text-sm text-gray-700">Archive this product (hide from catalog)</span>
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    className="px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg transition-colors"
                >
                    Update Product
                </button>
                <a
                    href="/dashboard/products"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </a>
            </div>
        </form>
    )
}

