import { getProductById, updateProduct } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EditProductForm from '@/components/admin/EditProductForm'
import { redirect, notFound } from 'next/navigation'

async function getCategoriesList() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('id, name, slug')
    return data || []
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await getProductById(params.id)
    const categories = await getCategoriesList()

    if (!product) {
        notFound()
    }

    async function handleSubmit(formData: FormData) {
        'use server'
        try {
            await updateProduct(params.id, formData)
            redirect('/dashboard/products')
        } catch (error) {
            console.error('Error updating product:', error)
            throw error
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Edit Product</h1>
            <p className="text-gray-600 mb-8">Update product details and stock</p>

            <Card>
                <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditProductForm product={product} categories={categories} action={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    )
}

