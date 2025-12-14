'use server'

import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'

/**
 * Get daily sales data for the last 30 days
 */
export async function getDailySales() {
    await requireAdmin()
    const supabase = createClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all orders in the last 30 days
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['confirmed', 'paid', 'shipped', 'delivered'])

    // Group by date
    const dailySales = new Map<string, number>()

    // Initialize all dates in range with 0
    for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateKey = date.toISOString().split('T')[0]
        dailySales.set(dateKey, 0)
    }

    // Aggregate sales by date
    orders?.forEach((order) => {
        const dateKey = new Date(order.created_at).toISOString().split('T')[0]
        const current = dailySales.get(dateKey) || 0
        dailySales.set(dateKey, current + Number(order.total_amount || 0))
    })

    // Convert to array and sort by date
    const salesData = Array.from(dailySales.entries())
        .map(([date, sales]) => ({
            date,
            sales: Math.round(sales * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

    return salesData
}

/**
 * Calculate sales trend (increase/decrease vs previous period)
 */
export async function getSalesTrend() {
    await requireAdmin()
    const supabase = createClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Current period (last 30 days)
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['confirmed', 'paid', 'shipped', 'delivered'])

    // Previous period (30-60 days ago)
    const { data: previousOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['confirmed', 'paid', 'shipped', 'delivered'])

    const currentSales = recentOrders?.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 0
    const previousSales = previousOrders?.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 0

    const change = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0

    return {
        currentSales: Math.round(currentSales * 100) / 100,
        previousSales: Math.round(previousSales * 100) / 100,
        change: Math.round(change * 100) / 100,
        isIncrease: change >= 0,
    }
}

/**
 * Calculate chatbot conversion rate
 * Users who used chatbot → converted to buyers
 */
export async function getChatbotConversion() {
    await requireAdmin()
    const supabase = createClient()

    // Get all users who have chatbot sessions
    const { data: chatbotSessions } = await supabase
        .from('chatbot_sessions')
        .select('user_id, created_at')
        .not('user_id', 'is', null)

    if (!chatbotSessions || chatbotSessions.length === 0) {
        return {
            totalChatbotUsers: 0,
            convertedUsers: 0,
            conversionRate: 0,
        }
    }

    const chatbotUserIds = new Set(chatbotSessions.map(s => s.user_id).filter(Boolean))

    // Get users who placed orders
    const { data: orders } = await supabase
        .from('orders')
        .select('user_id, created_at')
        .not('user_id', 'is', null)
        .in('status', ['confirmed', 'paid', 'shipped', 'delivered'])

    // Find users who used chatbot AND placed an order (chatbot session before order)
    const convertedUserIds = new Set<string>()

    chatbotSessions.forEach((session) => {
        if (!session.user_id) return

        const sessionDate = new Date(session.created_at)
        const userOrders = orders?.filter(
            o => o.user_id === session.user_id && new Date(o.created_at) >= sessionDate
        ) || []

        if (userOrders.length > 0) {
            convertedUserIds.add(session.user_id)
        }
    })

    const totalChatbotUsers = chatbotUserIds.size
    const convertedUsers = convertedUserIds.size
    const conversionRate = totalChatbotUsers > 0 ? (convertedUsers / totalChatbotUsers) * 100 : 0

    return {
        totalChatbotUsers,
        convertedUsers,
        conversionRate: Math.round(conversionRate * 10) / 10,
    }
}

