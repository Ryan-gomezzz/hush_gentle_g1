import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'
import { formatDistanceToNow } from 'date-fns'

async function getNonConvertedConversations() {
    const supabase = createClient()
    
    // Get sessions from last 48 hours that are not converted
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    
    const { data: sessions } = await supabase
        .from('chatbot_sessions')
        .select(`
            id,
            created_at,
            user_id,
            converted,
            messages:chatbot_messages(
                id,
                role,
                content,
                created_at
            )
        `)
        .eq('converted', false)
        .gte('created_at', fortyEightHoursAgo)
        .order('created_at', { ascending: false })
        .limit(100)

    return sessions || []
}

export default async function ChatbotPage() {
    await requireAdmin()
    const conversations = await getNonConvertedConversations()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-serif text-gray-800">Chatbot Conversations</h1>
                <p className="text-gray-600 mt-1">Non-converted conversations from the last 48 hours</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {conversations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No non-converted conversations in the last 48 hours</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {conversations.map((session: any) => (
                            <div key={session.id} className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Session {session.id.slice(0, 8)}...
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                        Not Converted
                                    </span>
                                </div>
                                
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {session.messages && session.messages.length > 0 ? (
                                        session.messages.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className={`p-3 rounded-lg ${
                                                    msg.role === 'user'
                                                        ? 'bg-sage-50 text-sage-900 ml-4'
                                                        : 'bg-gray-50 text-gray-700 mr-4'
                                                }`}
                                            >
                                                <p className="text-xs font-medium mb-1 uppercase text-gray-500">
                                                    {msg.role}
                                                </p>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm">No messages</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

