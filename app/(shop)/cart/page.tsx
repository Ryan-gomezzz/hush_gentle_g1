import { getCart, removeFromCart, updateCartItemQuantity } from '@/lib/actions/cart'
import { getUserOrders } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, Minus, Plus, Package } from 'lucide-react'
import CartTabs from '@/components/cart/CartTabs'

export default async function CartPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const cart = await getCart()
    const items = cart?.items || []
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0)
    
    // Fetch user orders if logged in
    const orders = user ? await getUserOrders() : []

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif text-sage-900 mb-8">Your Cart</h1>

            <CartTabs 
                cartItems={items}
                subtotal={subtotal}
                orders={orders}
                isLoggedIn={!!user}
            />
        </div>
    )
}
