'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

interface SettingsProfileProps {
    user: any
    profile: any
}

export default function SettingsProfile({ user, profile }: SettingsProfileProps) {
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
                await updateProfile(formData)
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            } catch (err: any) {
                setError(err.message || 'Failed to update profile')
            }
        })
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-6">
            <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-sage-600" />
                <h2 className="text-xl font-serif text-sage-900">Profile Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        Profile updated successfully
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        defaultValue={profile?.full_name || ''}
                        className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={user?.email || ''}
                        className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    />
                    <p className="text-xs text-sage-500 mt-1">
                        Changing your email will require verification
                    </p>
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </div>
    )
}

