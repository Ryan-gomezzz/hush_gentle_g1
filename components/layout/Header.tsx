import { getCart } from '@/lib/actions/cart'
import { createClient } from '@/lib/supabase-server'
import HeaderWrapper from './HeaderWrapper'
import HeaderContent from './HeaderContent'

export default async function Header() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cart = await getCart()
    const itemCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

    return (
        <HeaderWrapper>
            <HeaderContent user={user} itemCount={itemCount} />
        </HeaderWrapper>
    )
}
