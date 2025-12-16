'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function SettingsPassword() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            try {
                await changePassword(formData)
                setSuccess(true)
                e.currentTarget.reset()
                setTimeout(() => setSuccess(false), 3000)
            } catch (err: any) {
                setError(err.message || 'Failed to change password')
            }
        })
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-sage-600" />
                <h2 className="text-xl font-serif text-sage-900">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        Password changed successfully
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                        Current Password
                    </label>
                    <input
                        type="password"
                        name="current_password"
                        required
                        className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        required
                        minLength={6}
                        className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                    <p className="text-xs text-sage-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        name="confirm_password"
                        required
                        minLength={6}
                        className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Changing...' : 'Change Password'}
                </Button>
            </form>
        </div>
    )
}

