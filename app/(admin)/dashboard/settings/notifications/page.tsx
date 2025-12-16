import { requireAdmin } from '@/lib/utils/admin-check'

export default async function NotificationsSettingsPage() {
    await requireAdmin()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Notification Settings</h1>
                <p className="text-gray-600 mt-1">Configure email and SMS notifications</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-serif text-gray-800 mb-4">Email Notifications</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Email notifications are currently handled automatically for order confirmations and status updates.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                                Email templates and settings can be configured in the email service configuration.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h2 className="text-lg font-serif text-gray-800 mb-4">SMS Notifications</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            SMS notifications require integration with an SMS provider. See the documentation for setup instructions.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> SMS integration documentation is available in{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded">docs/sms-integration.md</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

