'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeliveryMappingFormProps {
    action: (formData: FormData) => Promise<any>
    mapping?: any
    mode?: 'create' | 'edit'
}

export default function DeliveryMappingForm({ action, mapping, mode = 'create' }: DeliveryMappingFormProps) {
    const [isEditing, setIsEditing] = useState(mode === 'create')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            try {
                await action(formData)
                router.refresh()
                if (mode === 'create') {
                    e.currentTarget.reset()
                } else {
                    setIsEditing(false)
                }
            } catch (error: any) {
                alert(error.message || 'Failed to save mapping')
            }
        })
    }

    if (mode === 'edit' && !isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-sage-600"
                title="Edit"
            >
                <Edit className="w-4 h-4" />
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className={mode === 'create' ? 'space-y-4' : 'inline-block'}>
            {mode === 'create' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode Pattern *
                        </label>
                        <input
                            type="text"
                            name="pincode_pattern"
                            required
                            defaultValue={mapping?.pincode_pattern || ''}
                            placeholder="110* or 400001"
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Use * for wildcard (e.g., 110*)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Days *
                        </label>
                        <input
                            type="number"
                            name="estimated_days"
                            required
                            min="1"
                            defaultValue={mapping?.estimated_days || ''}
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <input
                            type="text"
                            name="description"
                            defaultValue={mapping?.description || ''}
                            placeholder="e.g., Metro cities"
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <input
                            type="number"
                            name="priority"
                            defaultValue={mapping?.priority || 0}
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sage-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Higher priority patterns are checked first</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                value="true"
                                defaultChecked={mapping?.is_active ?? true}
                                className="w-4 h-4 text-sage-600 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>
                    <div className="md:col-span-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Create Mapping'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        name="estimated_days"
                        required
                        min="1"
                        defaultValue={mapping?.estimated_days || ''}
                        className="w-20 p-1 rounded border border-gray-200"
                    />
                    <input
                        type="text"
                        name="description"
                        defaultValue={mapping?.description || ''}
                        placeholder="Description"
                        className="w-32 p-1 rounded border border-gray-200"
                    />
                    <input
                        type="number"
                        name="priority"
                        defaultValue={mapping?.priority || 0}
                        className="w-16 p-1 rounded border border-gray-200"
                    />
                    <input
                        type="hidden"
                        name="is_active"
                        value={mapping?.is_active ? 'true' : 'false'}
                    />
                    <Button type="submit" size="sm" disabled={isPending}>
                        <Save className="w-3 h-3" />
                    </Button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}
        </form>
    )
}

