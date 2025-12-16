import { getDailySales, getSalesTrend, getChatbotConversion } from '@/lib/actions/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { TrendingUp, TrendingDown, MessageCircle, Users } from 'lucide-react'

// Dynamic import for chart component to reduce initial bundle size
const DailySalesChart = dynamic(() => import('@/components/analytics/DailySalesChart'), {
    ssr: false, // Charts are client-side only
    loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>,
})

export default async function AnalyticsPage() {
    const dailySales = await getDailySales()
    const salesTrend = await getSalesTrend()
    const chatbotConversion = await getChatbotConversion()

    return (
        <div>
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Data Analytics</h1>
            <p className="text-gray-600 mb-8">Visual insights into your store's performance</p>

            {/* Sales Trend Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Sales Trend (30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {salesTrend.isIncrease ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                                <div className="text-2xl font-bold text-sage-900">
                                    ₹{salesTrend.currentSales.toLocaleString('en-IN')}
                                </div>
                                <div className={`text-sm ${salesTrend.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                    {salesTrend.isIncrease ? '+' : ''}{salesTrend.change.toFixed(1)}% vs previous period
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Chatbot Conversion
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sage-900 mb-1">
                            {chatbotConversion.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">
                            {chatbotConversion.convertedUsers} of {chatbotConversion.totalChatbotUsers} users converted
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Chatbot Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sage-900 mb-1">
                            {chatbotConversion.totalChatbotUsers}
                        </div>
                        <div className="text-sm text-gray-600">
                            Total users who used chatbot
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Sales Chart */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Daily Sales (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <DailySalesChart data={dailySales} />
                </CardContent>
            </Card>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Period (30 days)</span>
                                <span className="font-bold text-sage-900">₹{salesTrend.currentSales.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Previous Period (30 days)</span>
                                <span className="font-bold text-gray-700">₹{salesTrend.previousSales.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Change</span>
                                    <span className={`font-bold ${salesTrend.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                        {salesTrend.isIncrease ? '+' : ''}{salesTrend.change.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Chatbot Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Chatbot Users</span>
                                <span className="font-bold text-sage-900">{chatbotConversion.totalChatbotUsers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Converted to Buyers</span>
                                <span className="font-bold text-green-600">{chatbotConversion.convertedUsers}</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Conversion Rate</span>
                                    <span className="font-bold text-sage-900">{chatbotConversion.conversionRate.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

