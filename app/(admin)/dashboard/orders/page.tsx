import { getRecentOrders } from '@/lib/actions/admin'

export default async function AdminOrdersPage() {
    // reusing recent orders for now, ideally fetchAllOrders with pagination
    const orders = await getRecentOrders()

    return (
        <div>
            <h1 className="text-3xl font-serif text-gray-800 mb-6">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order: any) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4">#{order.id.slice(0, 8)}</td>
                                <td className="px-6 py-4">{order.status}</td>
                                <td className="px-6 py-4">₹{order.total_amount}</td>
                                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
