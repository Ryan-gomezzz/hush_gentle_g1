'use server'

import { createClient } from '@/lib/supabase-server'

export async function getDashboardStats() {
    const supabase = createClient()

    // 1. Total Sales
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')

    const totalSales = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0
    const activeOrders = orders?.filter(o => o.status === 'pending' || o.status === 'paid').length || 0

    // 2. Conversion Rate (Simulated using analytics events table if populated, else mock)
    // For MVP let's return a hardcoded value if no traffic data
    const conversionRate = 2.4 // Mock 2.4%

    return {
        totalSales,
        activeOrders,
        conversionRate
    }
}

export async function getRecentOrders() {
    const supabase = createClient()
    const { data: orders } = await supabase
        .from('orders')
        .select('*, user:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

    return orders || []
}
