'use server'

import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'

export async function getDashboardKPIs() {
    await requireAdmin()
    const supabase = createClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Optimized: Use parallel queries and aggregate in database where possible
    const [
        { data: recentOrders },
        { data: previousOrders },
        { data: checkoutStarted },
        { data: checkoutCompleted },
        { data: prevStarted },
        { data: prevCompleted },
        { data: allCarts },
        { data: prevAllCarts },
    ] = await Promise.all([
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
        
        // 7. Recent carts with items
        supabase
            .from('carts')
            .select('id, updated_at, items:cart_items(id)')
            .not('user_id', 'is', null)
            .gte('updated_at', thirtyDaysAgo.toISOString()),
        
        // 8. Previous period carts
        supabase
            .from('carts')
            .select('id, items:cart_items(id)')
            .not('user_id', 'is', null)
            .gte('updated_at', previousPeriodStart.toISOString())
            .lt('updated_at', thirtyDaysAgo.toISOString()),
    ])

    // Calculate metrics
    const totalRevenue = recentOrders?.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 0
    const previousRevenue = previousOrders?.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 0
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    const orderCount = recentOrders?.length || 0
    const previousOrderCount = previousOrders?.length || 0
    const orderChange = previousOrderCount > 0 ? ((orderCount - previousOrderCount) / previousOrderCount) * 100 : 0

    const startedCount = checkoutStarted?.length || 0
    const completedCount = checkoutCompleted?.length || 0
    const conversionRate = startedCount > 0 ? (completedCount / startedCount) * 100 : 0

    const prevStartedCount = prevStarted?.length || 0
    const prevCompletedCount = prevCompleted?.length || 0
    const prevConversionRate = prevStartedCount > 0 ? (prevCompletedCount / prevStartedCount) * 100 : 0
    const conversionChange = prevConversionRate > 0 ? conversionRate - prevConversionRate : 0

    const abandonedCarts = allCarts?.filter(cart => cart.items && cart.items.length > 0) || []
    const abandonedCount = abandonedCarts?.length || 0
    const totalCartsWithItems = (startedCount || 0) + (abandonedCount || 0)
    const abandonmentRate = totalCartsWithItems > 0 ? (abandonedCount / totalCartsWithItems) * 100 : 0

    const prevAbandoned = prevAllCarts?.filter(cart => cart.items && cart.items.length > 0) || []
    const prevAbandonedCount = prevAbandoned?.length || 0
    const prevTotalCarts = (prevStartedCount || 0) + (prevAbandonedCount || 0)
    const prevAbandonmentRate = prevTotalCarts > 0 ? (prevAbandonedCount / prevTotalCarts) * 100 : 0
    const abandonmentChange = prevAbandonmentRate > 0 ? abandonmentRate - prevAbandonmentRate : 0

    return {
        totalRevenue: Math.round((totalRevenue || 0) * 100) / 100,
        revenueChange: Math.round((revenueChange || 0) * 100) / 100,
        orderCount: orderCount || 0,
        orderChange: Math.round((orderChange || 0) * 100) / 100,
        conversionRate: Math.round((conversionRate || 0) * 10) / 10,
        conversionChange: Math.round((conversionChange || 0) * 10) / 10,
        abandonmentRate: Math.round((abandonmentRate || 0) * 10) / 10,
        abandonmentChange: Math.round((abandonmentChange || 0) * 10) / 10,
    }
}

export async function getDashboardStats() {
    await requireAdmin()
    const supabase = createClient()

    // 1. Total Sales
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')

    const totalSales = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0
    const activeOrders = orders?.filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'confirmed').length || 0

    // 2. Conversion Rate
    const { data: checkoutStarted } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'checkout_started')

    const { data: checkoutCompleted } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'checkout_completed')

    const startedCount = checkoutStarted?.length || 0
    const completedCount = checkoutCompleted?.length || 0
    const conversionRate = startedCount > 0 ? (completedCount / startedCount) * 100 : 0

    return {
        totalSales,
        activeOrders,
        conversionRate: Math.round(conversionRate * 10) / 10
    }
}

export async function getRecentOrders(limit: number = 5) {
    await requireAdmin()
    const supabase = createClient()
    const { data: orders } = await supabase
        .from('orders')
        .select('*, user:profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(limit)

    return orders || []
}

export async function getAllOrders() {
    await requireAdmin()
    const supabase = createClient()
    
    // Optimized: Fetch all data in parallel to avoid sequential N+1 queries
    const [ordersResult, profilesResult, orderItemsResult, productsResult] = await Promise.all([
        supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false }),
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

export async function getOrderById(id: string) {
    await requireAdmin()
    const supabase = createClient()
    const { data: order } = await supabase
        .from('orders')
        .select('*, user:profiles(full_name, email), items:order_items(*, product:products(*))')
        .eq('id', id)
        .single()

    return order
}

export async function updateOrderStatus(orderId: string, status: string) {
    await requireAdmin()
    const supabase = createClient()

    const validStatuses = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status')
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

    if (error) {
        throw new Error('Failed to update order status')
    }

    // Revalidate paths to refresh dashboard KPIs and orders list
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard/analytics')

    return data
}

export async function getTopProducts(limit: number = 10) {
    await requireAdmin()
    const supabase = createClient()

    // First, get order IDs for completed orders
    const { data: completedOrders } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['confirmed', 'paid', 'shipped', 'delivered'])

    if (!completedOrders || completedOrders.length === 0) {
        return []
    }

    const orderIds = completedOrders.map(order => order.id)

    // Then get order items for those orders
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, price_at_purchase, product:products(name)')
        .in('order_id', orderIds)

    // Aggregate by product
    const productMap = new Map<string, { name: string; sales: number; revenue: number }>()

    orderItems?.forEach((item: any) => {
        const productId = item.product_id
        const quantity = item.quantity
        const revenue = Number(item.price_at_purchase) * quantity

        if (productMap.has(productId)) {
            const existing = productMap.get(productId)!
            existing.sales += quantity
            existing.revenue += revenue
        } else {
            productMap.set(productId, {
                name: item.product?.name || 'Unknown',
                sales: quantity,
                revenue,
            })
        }
    })

    const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit)
        .map((product, index) => ({
            rank: index + 1,
            ...product,
            revenue: Math.round(product.revenue * 100) / 100,
        }))

    return topProducts
}

export async function getOrderStats() {
    await requireAdmin()
    const supabase = createClient()

    const { data: orders } = await supabase
        .from('orders')
        .select('status')

    const stats = {
        pending: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    }

    orders?.forEach((order) => {
        if (order.status === 'pending' || order.status === 'confirmed') {
            stats.pending++
        } else if (order.status === 'shipped') {
            stats.shipped++
        } else if (order.status === 'delivered') {
            stats.delivered++
        } else if (order.status === 'cancelled') {
            stats.cancelled++
        }
    })

    return stats
}
