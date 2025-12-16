import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getOffers() {
    const supabase = createClient()
    const { data } = await supabase
        .from('offers')
        .select('*')
        .order('display_order', { ascending: true })
    return data || []
}

export default async function OffersPage() {
    await requireAdmin()
    const offers = await getOffers()

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-serif text-gray-800">Offers Banner</h1>
                    <p className="text-gray-600 mt-1">Manage rotating offers displayed in the header</p>
                </div>
                <Link href="/dashboard/offers/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Offer
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {offers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No offers created yet</p>
                        <Link href="/dashboard/offers/new">
                            <Button className="mt-4">Create First Offer</Button>
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer) => (
                                <tr key={offer.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{offer.title}</td>
                                    <td className="px-6 py-4 text-gray-600">{offer.description || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            offer.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {offer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{offer.display_order}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/offers/${offer.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

