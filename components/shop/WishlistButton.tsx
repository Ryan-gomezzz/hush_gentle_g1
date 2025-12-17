'use client'

import { useState, useEffect, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/actions/wishlist'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
    productId: string
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
    const [isInList, setIsInList] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const inList = await isInWishlist(productId)
                setIsInList(inList)
            } catch (error) {
                console.error('Error checking wishlist status:', error)
            } finally {
                setIsLoading(false)
            }
        }

        checkWishlistStatus()
    }, [productId])

    const handleToggle = () => {
        startTransition(async () => {
            try {
                if (isInList) {
                    await removeFromWishlist(productId)
                    setIsInList(false)
                } else {
                    await addToWishlist(productId)
                    setIsInList(true)
                }
                router.refresh()
            } catch (error: any) {
                console.error('Wishlist error:', error)
                // Show error message to user
                alert(error.message || 'Failed to update wishlist. Please try again.')
            }
        })
    }

    if (isLoading) {
        return (
            <button
                disabled
                className="p-2 text-gray-300 hover:text-gray-400 transition-colors"
                aria-label="Loading wishlist status"
            >
                <Heart className="w-5 h-5" />
            </button>
        )
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2 transition-colors ${
                isInList
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
            } disabled:opacity-50`}
            aria-label={isInList ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart className={`w-5 h-5 ${isInList ? 'fill-current' : ''}`} />
        </button>
    )
}

