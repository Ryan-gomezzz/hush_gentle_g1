import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SettingsProfile from '@/components/account/SettingsProfile'
import SettingsPassword from '@/components/account/SettingsPassword'
import SettingsDeleteAccount from '@/components/account/SettingsDeleteAccount'

export default async function SettingsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/account/settings')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif text-sage-900 mb-8">Account Settings</h1>

            <div className="space-y-6">
                <SettingsProfile user={user} profile={profile} />
                <SettingsPassword />
                <SettingsDeleteAccount />
            </div>
        </div>
    )
}

