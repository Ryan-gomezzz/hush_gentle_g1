'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from '@/lib/actions/products'
import { useRouter } from 'next/navigation'

interface DeleteProductButtonProps {
    productId: string
    productName: string
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleDelete = () => {
        if (!showConfirm) {
            setShowConfirm(true)
            return
        }

        startTransition(async () => {
            try {
                await deleteProduct(productId)
                setShowConfirm(false)
                router.refresh()
            } catch (error: any) {
                alert(error.message || 'Failed to delete product. Please try again.')
                setShowConfirm(false)
            }
        })
    }

    const handleCancel = () => {
        setShowConfirm(false)
    }

    return (
        <div className="relative">
            {showConfirm ? (
                <div className="absolute right-0 top-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
                    <p className="text-sm text-gray-700 mb-2">Delete {productName}?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isPending}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title="Delete product"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

