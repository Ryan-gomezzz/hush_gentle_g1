import { getAllDeliveryMappings, createDeliveryMapping, updateDeliveryMapping, deleteDeliveryMapping } from '@/lib/actions/admin-settings'
import { requireAdmin } from '@/lib/utils/admin-check'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DeliveryMappingForm from '@/components/admin/DeliveryMappingForm'
import DeleteDeliveryMappingButton from '@/components/admin/DeleteDeliveryMappingButton'

export default async function DeliverySettingsPage() {
    await requireAdmin()
    const mappings = await getAllDeliveryMappings()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Delivery Settings</h1>
                <p className="text-gray-600 mt-1">Configure delivery time estimates by pincode patterns</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-serif text-gray-800 mb-4">Add New Mapping</h2>
                <DeliveryMappingForm action={createDeliveryMapping} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-serif text-gray-800">Existing Mappings</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Patterns support wildcards (e.g., '110*' for all Delhi pincodes starting with 110)
                    </p>
                </div>
                {mappings.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No delivery mappings configured yet
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Pincode Pattern</th>
                                <th className="px-6 py-3">Estimated Days</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Priority</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.map((mapping: any) => (
                                <tr key={mapping.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                        {mapping.pincode_pattern}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{mapping.estimated_days} days</td>
                                    <td className="px-6 py-4 text-gray-700">{mapping.description || '-'}</td>
                                    <td className="px-6 py-4 text-gray-700">{mapping.priority}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                mapping.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {mapping.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <DeliveryMappingForm
                                                action={async (formData) => {
                                                    'use server'
                                                    await updateDeliveryMapping(mapping.id, formData)
                                                }}
                                                mapping={mapping}
                                                mode="edit"
                                            />
                                            <DeleteDeliveryMappingButton mappingId={mapping.id} />
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

