import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { orderId: string };
}) {
    return (
        <div className="container mx-auto px-6 py-20 text-center">
            <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-4xl font-serif text-sage-900 mb-4">Order Confirmed!</h1>
            <p className="text-lg text-sage-600 mb-8">
                Thank you for choosing Hush Gentle. Your order <span className="font-mono bg-sage-50 px-2 py-1 rounded text-sage-800">#{searchParams.orderId.slice(0, 8)}</span> has been placed.
            </p>
            <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
            </Link>
        </div>
    )
}
