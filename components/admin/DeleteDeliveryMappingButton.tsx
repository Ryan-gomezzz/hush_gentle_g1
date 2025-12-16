'use client'

import { useState, useTransition } from 'react'
import { deleteDeliveryMapping } from '@/lib/actions/admin-settings'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteDeliveryMappingButtonProps {
    mappingId: string
}

export default function DeleteDeliveryMappingButton({ mappingId }: DeleteDeliveryMappingButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleDelete = () => {
        if (!showConfirm) {
            setShowConfirm(true)
            setTimeout(() => setShowConfirm(false), 3000)
            return
        }

        startTransition(async () => {
            try {
                await deleteDeliveryMapping(mappingId)
                router.refresh()
            } catch (error) {
                console.error('Failed to delete mapping:', error)
                alert('Failed to delete mapping')
            }
        })
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`text-gray-400 hover:text-red-600 disabled:opacity-50 ${
                showConfirm ? 'text-red-600' : ''
            }`}
            title={showConfirm ? 'Click again to confirm' : 'Delete'}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}

