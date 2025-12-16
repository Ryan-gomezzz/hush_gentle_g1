import { createOrder } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'
import CheckoutTracker from '@/components/analytics/CheckoutTracker'
import { trackPageViewServer } from '@/lib/analytics'
import { createClient } from '@/lib/supabase-server'
import { getUserAddresses } from '@/lib/actions/addresses'
import { getCart } from '@/lib/actions/cart'
import { redirect } from 'next/navigation'
import CheckoutAddressForm from '@/components/checkout/CheckoutAddressForm'
import CheckoutSummary from '@/components/checkout/CheckoutSummary'

export default async function CheckoutPage() {
    // Track checkout started server-side
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/checkout')
    }
    await trackPageViewServer(user?.id, '/checkout', { event_name: 'checkout_started' })

    const deliveryAddresses = await getUserAddresses(user.id, 'delivery')
    const billingAddresses = await getUserAddresses(user.id, 'billing')
    
    // Get cart to calculate subtotal
    const cart = await getCart()
    const items = cart?.items || []
    const subtotal = items.reduce((acc: number, item: any) => {
        return acc + (Number(item.product?.price || 0) * item.quantity)
    }, 0)

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <CheckoutTracker />
            <h1 className="text-3xl font-serif text-sage-900 mb-8 text-center">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-100">
                        <form action={createOrder} className="space-y-6">
                            <CheckoutAddressForm 
                                deliveryAddresses={deliveryAddresses}
                                billingAddresses={billingAddresses}
                            />

                            <div className="pt-4 border-t border-sage-100">
                                <h3 className="font-bold text-sage-800 mb-3">Payment Method</h3>
                                <div className="space-y-2 mb-4">
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-sage-200 bg-beige-50 cursor-pointer">
                                        <input type="radio" name="paymentMethod" value="cod" defaultChecked />
                                        <span className="text-sage-800 font-medium">Cash on Delivery (COD)</span>
                                    </label>
                                    <p className="text-sm text-sage-500">For demo purposes, payment is set to Cash on Delivery.</p>
                                </div>
                                <Button type="submit" size="lg" className="w-full">
                                    Place Order
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <CheckoutSummary initialSubtotal={subtotal} />
                </div>
            </div>
        </div>
    )
}
