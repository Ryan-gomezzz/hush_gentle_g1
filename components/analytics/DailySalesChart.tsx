'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DailySalesChartProps {
    data: Array<{ date: string; sales: number }>
}

export default function DailySalesChart({ data }: DailySalesChartProps) {
    // Format dates for display (show day/month)
    const formattedData = data.map(item => ({
        ...item,
        dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="dateLabel" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Sales']}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

