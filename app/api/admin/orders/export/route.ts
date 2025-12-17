import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/utils/admin-check'

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication first
        try {
            await requireAdmin()
        } catch (authError: any) {
            console.error('Admin authentication failed:', authError)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createClient()

        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let query = supabase
            .from('orders')
            .select(`
                *,
                user:profiles!orders_user_id_fkey(id, email, full_name),
                items:order_items(
                    quantity,
                    price_at_purchase,
                    product:products(name)
                )
            `)
            .order('created_at', { ascending: false })

        if (startDate) {
            query = query.gte('created_at', startDate)
        }
        if (endDate) {
            query = query.lte('created_at', endDate)
        }

        const { data: orders, error } = await query

        if (error) {
            console.error('Error fetching orders for export:', error)
            return NextResponse.json({ 
                error: 'Failed to fetch orders', 
                details: error.message 
            }, { status: 500 })
        }

        if (!orders) {
            return NextResponse.json({ error: 'No orders found' }, { status: 404 })
        }

        // Convert to CSV
        const headers = [
            'Order Number',
            'Date',
            'Customer Name',
            'Customer Email',
            'Items',
            'Quantity',
            'Total Amount',
            'Discount',
            'Status',
            'Pincode',
            'Estimated Delivery',
            'Tracking Number',
        ]

        const rows = (orders || []).map((order: any) => {
            const shippingDetails = order.shipping_details as any
            const orderNumber = order.order_number || `HG-${order.id.slice(0, 8).toUpperCase()}`
            const items = (order.items || [])
                .map((item: any) => `${item.product?.name || 'Unknown'} (${item.quantity})`)
                .join('; ')
            const totalQuantity = (order.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0)

            return [
                orderNumber,
                new Date(order.created_at).toLocaleDateString('en-US'),
                shippingDetails?.fullName || order.user?.full_name || 'Guest',
                shippingDetails?.email || order.user?.email || '',
                items,
                totalQuantity,
                Number(order.total_amount).toFixed(2),
                Number(order.discount_amount || 0).toFixed(2),
                order.status,
                order.pincode || shippingDetails?.zip || '',
                order.estimated_delivery_date
                    ? new Date(order.estimated_delivery_date).toLocaleDateString('en-US')
                    : '',
                order.tracking_number || '',
            ]
        })

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n')

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })
    } catch (error: any) {
        console.error('Error exporting orders:', error)
        return NextResponse.json({ error: error.message || 'Failed to export orders' }, { status: 500 })
    }
}

