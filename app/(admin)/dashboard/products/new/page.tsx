import { createProduct } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProductForm from '@/components/admin/ProductForm'
import { redirect } from 'next/navigation'

async function getCategoriesList() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('id, name, slug')
    return data || []
}

export default async function NewProductPage() {
    const categories = await getCategoriesList()

    async function handleSubmit(formData: FormData) {
        'use server'
        try {
            await createProduct(formData)
            redirect('/dashboard/products')
        } catch (error) {
            console.error('Error creating product:', error)
            throw error
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Add New Product</h1>
            <p className="text-gray-600 mb-8">Create a new product for your catalog</p>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm categories={categories} action={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    )
}

