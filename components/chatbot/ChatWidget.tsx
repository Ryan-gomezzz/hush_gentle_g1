'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'Hello! I am your hush gentle assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const toggleChat = () => setIsOpen(!isOpen)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg, 
                    sessionId: sessionId || undefined 
                })
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ reply: 'An error occurred' }))
                throw new Error(errorData.reply || `Server error: ${res.status}`)
            }

            const data = await res.json()

            // Update session ID if returned
            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId)
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'I apologize, I am having trouble connecting right now.' }])
        } catch (error: any) {
            console.error('Chatbot error:', error)
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: error.message || 'I apologize, I am having trouble connecting right now. Please try again.' 
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-sage-100 mb-4 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-sage-500 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="font-serif">Hush Assistant</span>
                        </div>
                        <button onClick={toggleChat} className="hover:bg-white/20 p-1 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-beige-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn(
                                "max-w-[80%] p-3 rounded-xl text-sm leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-sage-600 text-white self-end ml-auto rounded-tr-none"
                                    : "bg-white text-sage-800 shadow-sm rounded-tl-none border border-sage-50"
                            )}>
                                {msg.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-white text-sage-800 p-3 rounded-xl rounded-tl-none self-start shadow-sm w-16 flex items-center justify-center">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-sage-300 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 bg-sage-300 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-sage-300 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-sage-100 flex gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask nicely..."
                            className="flex-1 bg-beige-50 border-none rounded-full px-4 text-sm focus:ring-1 focus:ring-sage-300"
                        />
                        <Button size="sm" type="submit" disabled={loading} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                            <Send className="w-4 h-4 ml-0.5" />
                        </Button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className="w-14 h-14 bg-sage-600 hover:bg-sage-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
            >
                <MessageCircle className="w-7 h-7" />
            </button>
        </div>
    )
}
