'use server'

import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'

export async function getDashboardKPIs() {
    await requireAdmin()
    const supabase = createClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Use Promise.allSettled to handle individual query failures gracefully
    const results = await Promise.allSettled([
        // 1. Recent orders (last 30 days)
        supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .in('status', ['confirmed', 'paid', 'shipped', 'delivered']),
        
        // 2. Previous period orders
        supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString())
            .in('status', ['confirmed', 'paid', 'shipped', 'delivered']),
        
        // 3. Recent checkout started
        supabase
            .from('analytics_events')
            .select('id')
            .eq('event_name', 'checkout_started')
            .gte('created_at', thirtyDaysAgo.toISOString()),
        
        // 4. Recent checkout completed
        supabase
            .from('analytics_events')
            .select('id')
            .eq('event_name', 'checkout_completed')
            .gte('created_at', thirtyDaysAgo.toISOString()),
        
        // 5. Previous period checkout started
        supabase
            .from('analytics_events')
            .select('id')
            .eq('event_name', 'checkout_started')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString()),
        
        // 6. Previous period checkout completed
        supabase
            .from('analytics_events')
            .select('id')
            .eq('event_name', 'checkout_completed')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString()),
        
        // 7. All active carts
        supabase
            .from('carts')
            .select('id')
            .gte('updated_at', thirtyDaysAgo.toISOString()),
        
        // 8. Previous period carts
        supabase
            .from('carts')
            .select('id')
            .gte('updated_at', previousPeriodStart.toISOString())
            .lt('updated_at', thirtyDaysAgo.toISOString()),
    ])

    // Extract data from results, defaulting to empty array on failure
    const recentOrders = results[0].status === 'fulfilled' ? (results[0].value.data || []) : []
    const previousOrders = results[1].status === 'fulfilled' ? (results[1].value.data || []) : []
    const checkoutStarted = results[2].status === 'fulfilled' ? (results[2].value.data || []) : []
    const checkoutCompleted = results[3].status === 'fulfilled' ? (results[3].value.data || []) : []
    const prevStarted = results[4].status === 'fulfilled' ? (results[4].value.data || []) : []
    const prevCompleted = results[5].status === 'fulfilled' ? (results[5].value.data || []) : []
    const allCarts = results[6].status === 'fulfilled' ? (results[6].value.data || []) : []
    const prevAllCarts = results[7].status === 'fulfilled' ? (results[7].value.data || []) : []

    const totalRevenue = (recentOrders || []).reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0)
    const prevRevenue = (previousOrders || []).reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0)
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    const conversionRate = (checkoutStarted?.length || 0) > 0
        ? ((checkoutCompleted?.length || 0) / (checkoutStarted?.length || 1)) * 100
        : 0

    const prevConversionRate = (prevStarted?.length || 0) > 0
        ? ((prevCompleted?.length || 0) / (prevStarted?.length || 1)) * 100
        : 0

    const conversionChange = prevConversionRate > 0
        ? conversionRate - prevConversionRate
        : 0

    const orderCount = recentOrders?.length || 0
    const prevOrderCount = previousOrders?.length || 0
    const orderChange = prevOrderCount > 0
        ? ((orderCount - prevOrderCount) / prevOrderCount) * 100
        : 0

    // Calculate abandonment rate (checkout started but not completed)
    const abandonmentRate = (checkoutStarted?.length || 0) > 0
        ? (((checkoutStarted?.length || 0) - (checkoutCompleted?.length || 0)) / (checkoutStarted?.length || 1)) * 100
        : 0

    const prevAbandonmentRate = (prevStarted?.length || 0) > 0
        ? (((prevStarted?.length || 0) - (prevCompleted?.length || 0)) / (prevStarted?.length || 1)) * 100
        : 0

    const abandonmentChange = prevAbandonmentRate > 0
        ? abandonmentRate - prevAbandonmentRate
        : 0

    return {
        totalRevenue,
        revenueChange,
        conversionRate,
        conversionChange,
        activeCarts: allCarts?.length || 0,
        orderCount,
        orderChange,
        abandonmentRate,
        abandonmentChange,
    }
}

export async function getRecentOrders(limit: number = 5) {
    await requireAdmin()
    const supabase = createClient()

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            total_amount,
            created_at,
            shipping_details,
            user:profiles!orders_user_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent orders:', error)
        return []
    }

    return orders || []
}

export async function getTopProducts(limit: number = 5) {
    await requireAdmin()
    const supabase = createClient()

    const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
            product_id,
            quantity,
            product:products(id, name, images)
        `)

    if (error || !orderItems) {
        console.error('Error fetching top products:', error)
        return []
    }

    // Aggregate by product
    const productMap = new Map<string, { id: string; name: string; images: string[]; totalSold: number }>()
    
    orderItems.forEach((item: any) => {
        const productId = item.product_id
        if (!productMap.has(productId)) {
            productMap.set(productId, {
                id: item.product?.id || productId,
                name: item.product?.name || 'Unknown Product',
                images: item.product?.images || [],
                totalSold: 0,
            })
        }
        const product = productMap.get(productId)!
        product.totalSold += item.quantity
    })

    // Sort by total sold and return top N
    return Array.from(productMap.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit)
}

export async function getOrderStats(startDate?: string, endDate?: string) {
    await requireAdmin()
    const supabase = createClient()

    let ordersQuery = supabase
        .from('orders')
        .select('status, total_amount, created_at')

    if (startDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate)
    }
    if (endDate) {
        ordersQuery = ordersQuery.lte('created_at', endDate)
    }

    const { data: orders, error } = await ordersQuery

    if (error || !orders) {
        return {
            pending: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            total: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
        }
    }

    const completedOrders = orders.filter((o: any) => ['confirmed', 'paid', 'shipped', 'delivered'].includes(o.status))
    const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0)

    const stats = {
        pending: orders.filter((o: any) => o.status === 'pending').length,
        shipped: orders.filter((o: any) => o.status === 'shipped').length,
        delivered: orders.filter((o: any) => o.status === 'delivered').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
        total: orders.length,
        totalRevenue: totalRevenue,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    }

    return stats
}

export async function getAllOrders(startDate?: string, endDate?: string) {
    await requireAdmin()
    const supabase = createClient()
    
    // Build orders query with date filters
    let ordersQuery = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (startDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate)
    }
    if (endDate) {
        ordersQuery = ordersQuery.lte('created_at', endDate)
    }
    
    // Optimized: Fetch all data in parallel to avoid sequential N+1 queries
    const [ordersResult, profilesResult, orderItemsResult, productsResult] = await Promise.all([
        ordersQuery,
        supabase
            .from('profiles')
            .select('id, full_name, email'),
        supabase
            .from('order_items')
            .select('*'),
        supabase
            .from('products')
            .select('id, name'),
    ])

    const { data: orders, error: ordersError } = ordersResult
    const { data: profiles } = profilesResult
    const { data: orderItems } = orderItemsResult
    const { data: products } = productsResult

    if (ordersError || !orders || orders.length === 0) {
        if (ordersError) {
            console.error('Error fetching orders:', ordersError)
        }
        return []
    }

    // Create lookup maps for O(1) access
    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    const productsMap = new Map((products || []).map((p: any) => [p.id, p]))
    const itemsByOrderId = new Map<string, any[]>()

    // Group order items by order_id
    orderItems?.forEach((item: any) => {
        const orderId = item.order_id
        if (!itemsByOrderId.has(orderId)) {
            itemsByOrderId.set(orderId, [])
        }
        itemsByOrderId.get(orderId)!.push({
            ...item,
            product: productsMap.get(item.product_id) || { name: 'Unknown Product' },
        })
    })

    // Attach user and items to orders
    return orders.map((order: any) => ({
        ...order,
        user: order.user_id ? profilesMap.get(order.user_id) || null : null,
        items: itemsByOrderId.get(order.id) || [],
    }))
}

export async function updateOrderStatus(orderId: string, status: string) {
    await requireAdmin()
    const supabase = createClient()

    const validStatuses = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status')
    }

    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)

    if (error) {
        console.error('Error updating order status:', error)
        throw new Error('Failed to update order status')
    }
}

export async function getOrderById(orderId: string) {
    await requireAdmin()
    const supabase = createClient()

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            user:profiles!orders_user_id_fkey(id, email, full_name),
            items:order_items(
                id,
                quantity,
                price_at_purchase,
                product:products(
                    id,
                    name,
                    slug,
                    images,
                    price
                )
            ),
            coupon:coupons(id, code, discount_value),
            status_history:order_status_history(
                id,
                status,
                created_at,
                changed_by,
                notes
            )
        `)
        .eq('id', orderId)
        .single()

    if (orderError || !order) {
        console.error('Error fetching order:', orderError)
        return null
    }

    return order
}

export async function updateOrderTracking(orderId: string, trackingNumber: string) {
    await requireAdmin()
    const supabase = createClient()

    const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber })
        .eq('id', orderId)

    if (error) {
        console.error('Error updating tracking number:', error)
        throw new Error('Failed to update tracking number')
    }
}
