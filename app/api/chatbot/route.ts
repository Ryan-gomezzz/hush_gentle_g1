import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getProducts } from '@/lib/actions/products'

// Initialize OpenAI client
// Note: This requires OPENAI_API_KEY in .env.local
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Fallback to avoid crash if key missing
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json()
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
    `

        if (!process.env.OPENAI_API_KEY) {
            // Fallback for when Key is missing
            return NextResponse.json({ reply: "I'm currently undergoing a meditation session (API Key missing). Please check back later!" })
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo",
        });

        const reply = completion.choices[0].message.content || "I'm listening..."

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ reply: "I'm having a brief moment of silence. Please try again." }, { status: 500 })
    }
}
