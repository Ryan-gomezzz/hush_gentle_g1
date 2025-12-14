import { createOrder } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-2xl">
            <h1 className="text-3xl font-serif text-sage-900 mb-8 text-center">Checkout</h1>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-100">
                <form action={createOrder} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-sage-800">Shipping Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">Full Name</label>
                                <input name="fullName" required className="w-full p-3 rounded-lg border border-sage-200 bg-beige-50 focus:ring-sage-400 focus:border-sage-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">Email</label>
                                <input name="email" type="email" required className="w-full p-3 rounded-lg border border-sage-200 bg-beige-50 focus:ring-sage-400 focus:border-sage-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-sage-700 mb-1">Address</label>
                            <input name="address" required className="w-full p-3 rounded-lg border border-sage-200 bg-beige-50 focus:ring-sage-400 focus:border-sage-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">City</label>
                                <input name="city" required className="w-full p-3 rounded-lg border border-sage-200 bg-beige-50 focus:ring-sage-400 focus:border-sage-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">Zip Code</label>
                                <input name="zip" required className="w-full p-3 rounded-lg border border-sage-200 bg-beige-50 focus:ring-sage-400 focus:border-sage-400" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-sage-100">
                        <p className="text-sm text-sage-500 mb-4">Payment will be handled securely via Stripe (Simulated for Demo).</p>
                        <Button type="submit" size="lg" className="w-full">
                            Place Order
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
