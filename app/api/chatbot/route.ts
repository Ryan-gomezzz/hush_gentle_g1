import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getProducts } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase-server'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

export async function POST(req: Request) {
    try {
        const { message, sessionId } = await req.json()
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Get or create session
        let currentSessionId = sessionId
        if (!currentSessionId) {
            const { data: newSession, error: sessionError } = await supabase
                .from('chatbot_sessions')
                .insert({ user_id: user?.id || null })
                .select()
                .single()

            if (sessionError || !newSession) {
                console.error('Failed to create session:', sessionError)
            } else {
                currentSessionId = newSession.id
            }
        }

        // Log user message
        if (currentSessionId) {
            await supabase.from('chatbot_messages').insert({
                session_id: currentSessionId,
                role: 'user',
                content: message,
            })
        }

        const products = await getProducts()

        // Create a product context string for the AI
        const productContext = products.map(p =>
            `- ${p.name} (₹${p.price}): ${p.attributes?.benefits || p.description}`
        ).join('\n')

        const systemPrompt = `You are the "Hush Gentle Assistant", a helpful and calming customer service AI for an organic skincare brand.
Your tone is soothing, polite, and minimal.

Here is our product catalog:
${productContext}

Rules:
1. Recommend products based on user issues (dry skin, acne, etc).
2. Prices are in Indian Rupees (₹).
3. If asked about shipping: "We offer free shipping on orders over ₹499. Usually arrives in 3-5 business days."
4. Speak in a gentle, warm manner.
5. Keep answers short (under 3 sentences).
6. Do not make medical claims - only suggest products based on general benefits.
7. Be helpful but not pushy with sales.
`

        if (!process.env.OPENAI_API_KEY) {
            const fallbackReply = "I'm currently undergoing a meditation session (API Key missing). Please check back later!"
            
            // Log assistant message
            if (currentSessionId) {
                await supabase.from('chatbot_messages').insert({
                    session_id: currentSessionId,
                    role: 'assistant',
                    content: fallbackReply,
                })
            }

            return NextResponse.json({ reply: fallbackReply, sessionId: currentSessionId })
        }

        // Get previous messages for context
        let previousMessages: Array<{ role: 'user' | 'assistant', content: string }> = []
        if (currentSessionId) {
            const { data: previousMsgs } = await supabase
                .from('chatbot_messages')
                .select('role, content')
                .eq('session_id', currentSessionId)
                .order('created_at', { ascending: true })
                .limit(10) // Last 10 messages for context

            previousMessages = previousMsgs?.map((msg: any) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })) || []
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...previousMessages.slice(-10), // Include last 10 messages for context
            ],
            model: "gpt-3.5-turbo",
        });

        const reply = completion.choices[0].message.content || "I'm listening..."

        // Log assistant message
        if (currentSessionId) {
            await supabase.from('chatbot_messages').insert({
                session_id: currentSessionId,
                role: 'assistant',
                content: reply,
            })
        }

        return NextResponse.json({ reply, sessionId: currentSessionId })
    } catch (error) {
        console.error('Chat API Error:', error)
        const errorReply = "I'm having a brief moment of silence. Please try again."
        return NextResponse.json({ reply: errorReply }, { status: 500 })
    }
}
