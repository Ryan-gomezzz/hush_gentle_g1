import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getUserAddresses, deleteAddress, setDefaultAddress } from '@/lib/actions/addresses'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Star } from 'lucide-react'
import Link from 'next/link'

export default async function AddressesPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const deliveryAddresses = await getUserAddresses(user.id, 'delivery')
    const billingAddresses = await getUserAddresses(user.id, 'billing')

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-sage-900 mb-2">Manage Addresses</h1>
                <p className="text-sage-600">Save up to 2 delivery addresses and 1 billing address</p>
            </div>

            {/* Delivery Addresses */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif text-sage-900">Delivery Addresses</h2>
                    {deliveryAddresses.length < 2 && (
                        <Link href="/account/addresses/new?type=delivery">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Delivery Address
                            </Button>
                        </Link>
                    )}
                </div>
                {deliveryAddresses.length === 0 ? (
                    <p className="text-sage-500">No delivery addresses saved</p>
                ) : (
                    <div className="grid gap-4">
                        {deliveryAddresses.map((addr) => (
                            <AddressCard
                                key={addr.id}
                                address={addr}
                                onDelete={deleteAddress}
                                onSetDefault={setDefaultAddress}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Billing Addresses */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif text-sage-900">Billing Address</h2>
                    {billingAddresses.length === 0 && (
                        <Link href="/account/addresses/new?type=billing">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Billing Address
                            </Button>
                        </Link>
                    )}
                </div>
                {billingAddresses.length === 0 ? (
                    <p className="text-sage-500">No billing address saved</p>
                ) : (
                    <div className="grid gap-4">
                        {billingAddresses.map((addr) => (
                            <AddressCard
                                key={addr.id}
                                address={addr}
                                onDelete={deleteAddress}
                                onSetDefault={setDefaultAddress}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

async function AddressCard({ 
    address, 
    onDelete, 
    onSetDefault 
}: { 
    address: any
    onDelete: (id: string) => Promise<void>
    onSetDefault: (id: string, type: 'delivery' | 'billing') => Promise<void>
}) {
    return (
        <div className="bg-white p-6 rounded-lg border border-sage-200 flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sage-900">{address.full_name}</h3>
                    {address.is_default && (
                        <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Default
                        </span>
                    )}
                </div>
                <p className="text-sage-600 text-sm mb-1">{address.email}</p>
                {address.phone && <p className="text-sage-600 text-sm mb-1">{address.phone}</p>}
                <p className="text-sage-700">{address.address}</p>
                <p className="text-sage-700">
                    {address.city}{address.state ? `, ${address.state}` : ''} {address.zip_code}
                </p>
            </div>
            <div className="flex gap-2 ml-4">
                {!address.is_default && (
                    <form action={async () => {
                        'use server'
                        await onSetDefault(address.id, address.type)
                    }}>
                        <Button type="submit" variant="outline" size="sm">
                            Set Default
                        </Button>
                    </form>
                )}
                <form action={async () => {
                    'use server'
                    await onDelete(address.id)
                }}>
                    <Button type="submit" variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}

