import { getProducts } from '@/lib/actions/products'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

async function getCategoriesList() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('id, name, slug')
    return data || []
}

export default async function AdminProductsPage() {
    const products = await getProducts()
    const categories = await getCategoriesList()
    const categoryMap = new Map(categories.map(c => [c.id, c.name]))

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-serif text-gray-800">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product catalog</p>
                </div>
                <Link href="/dashboard/products/new">
                    <Button className="bg-sage-600 hover:bg-sage-700">+ Add Product</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Stock</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const isLowStock = product.stock < 20
                            return (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 bg-beige-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={product.images?.[0] || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {product.category_id ? categoryMap.get(product.category_id) || 'Uncategorized' : 'Uncategorized'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">₹{Number(product.price).toFixed(2)}</td>
                                    <td className={`px-6 py-4 font-medium ${isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                                        {product.stock}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            {product.is_archived ? 'archived' : 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/products/${product.slug}`} target="_blank" className="text-gray-400 hover:text-sage-600">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link href={`/dashboard/products/${product.id}`} className="text-gray-400 hover:text-sage-600">
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <DeleteProductButton productId={product.id} productName={product.name} />
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
