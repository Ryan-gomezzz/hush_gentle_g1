'use client'

import { useState, useTransition } from 'react'
import { deleteAccount } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function SettingsDeleteAccount() {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmText, setConfirmText] = useState('')

    const handleDelete = () => {
        if (!showConfirm) {
            setShowConfirm(true)
            return
        }

        if (confirmText !== 'DELETE') {
            alert('Please type DELETE to confirm')
            return
        }

        startTransition(async () => {
            try {
                await deleteAccount()
            } catch (err: any) {
                alert(err.message || 'Failed to delete account')
            }
        })
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-serif text-red-900">Delete Account</h2>
            </div>

            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">
                            <p className="font-medium mb-2">Warning: This action cannot be undone</p>
                            <p>
                                Deleting your account will permanently remove all your data including:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Order history</li>
                                <li>Saved addresses</li>
                                <li>Wishlist items</li>
                                <li>Account preferences</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {showConfirm && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-red-700 mb-2">
                                Type <span className="font-mono font-bold">DELETE</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full p-3 rounded-lg border border-red-200 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>
                )}

                <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending || (showConfirm && confirmText !== 'DELETE')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    {isPending ? 'Deleting...' : showConfirm ? 'Confirm Deletion' : 'Delete My Account'}
                </Button>

                {showConfirm && (
                    <Button
                        type="button"
                        onClick={() => {
                            setShowConfirm(false)
                            setConfirmText('')
                        }}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    )
}

