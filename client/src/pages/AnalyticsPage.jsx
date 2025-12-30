import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

function AnalyticsPage() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('30days');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchAnalytics();
    }, [navigate, user, timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/analytics/user', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">No analytics data available</p>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const overviewCards = [
        {
            title: 'Profile Views',
            value: analytics.overview.profileViews,
            icon: '👁️',
            color: 'from-blue-500 to-blue-600',
            change: analytics.engagementMetrics.profileViewGrowth
        },
        {
            title: 'Portfolio Views',
            value: analytics.overview.portfolioViews,
            icon: '🎨',
            color: 'from-purple-500 to-purple-600',
            change: '+12%'
        },
        {
            title: 'Total Revenue',
            value: `৳${analytics.overview.totalRevenue.toFixed(2)}`,
            icon: '💰',
            color: 'from-green-500 to-green-600',
            change: analytics.engagementMetrics.revenueGrowth
        },
        {
            title: 'Total Orders',
            value: analytics.overview.totalOrders,
            icon: '📦',
            color: 'from-orange-500 to-orange-600',
            change: '+8%'
        },
        {
            title: 'Bookings',
            value: analytics.overview.totalBookings,
            icon: '📅',
            color: 'from-teal-500 to-teal-600',
            change: '+15%'
        },
        {
            title: 'Custom Orders',
            value: analytics.overview.totalCustomOrders,
            icon: '🎯',
            color: 'from-pink-500 to-pink-600',
            change: '+20%'
        }
    ];

    const weeklyData = analytics.weeklyData || [];

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
                    <p className="text-lg opacity-90">Track your performance and growth on Uddomi Link</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}
                        >
                            Portfolio Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'wishlist' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}
                        >
                            Wishlist Analytics
                        </button>
                        {user.roles && user.roles.includes('admin') && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}
                            >
                                Admin Analytics
                            </button>
                        )}
                    </div>

                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border rounded-lg px-4 py-2 bg-white"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="1year">Last Year</option>
                    </select>
                </div>

                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {overviewCards.map((card, index) => (
                                <div
                                    key={index}
                                    className={`bg-gradient-to-br ${card.color} text-white p-6 rounded-xl shadow-lg`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm opacity-90">{card.title}</p>
                                            <p className="text-3xl font-bold mt-2">{card.value}</p>
                                            <p className="text-sm mt-2">
                                                {card.change && (
                                                    <span className={`${card.change.startsWith('+') ? 'text-green-300' : 'text-red-300'}`}>
                                                        {card.change} from last period
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-4xl">{card.icon}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Weekly Views Trend</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weeklyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="views"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                name="Views"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Top Portfolio Items</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.topPortfolioItems.slice(0, 5)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="title" angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="views" fill="#0088FE" name="Views" />
                                            <Bar dataKey="favorites" fill="#00C49F" name="Favorites" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Engagement Metrics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">Conversion Rate</span>
                                            <span className="text-sm font-bold">{analytics.engagementMetrics.conversionRate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(analytics.engagementMetrics.conversionRate, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">Profile View Growth</span>
                                            <span className="text-sm font-bold">{analytics.engagementMetrics.profileViewGrowth}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(Math.abs(analytics.engagementMetrics.profileViewGrowth), 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">Revenue Growth</span>
                                            <span className="text-sm font-bold">{analytics.engagementMetrics.revenueGrowth}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(Math.abs(analytics.engagementMetrics.revenueGrowth), 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {analytics.recentEvents && analytics.recentEvents.length > 0 ? (
                                        analytics.recentEvents.map((event, index) => (
                                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <div className="mr-3 text-lg">
                                                    {event.eventType === 'portfolio_view' && '👁️'}
                                                    {event.eventType === 'portfolio_favorite' && '❤️'}
                                                    {event.eventType === 'custom_order_request' && '🎯'}
                                                    {event.eventType === 'booking_request' && '📅'}
                                                    {event.eventType === 'product_purchase' && '🛍️'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium capitalize">
                                                        {event.eventType.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(event.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'portfolio' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Portfolio Analytics</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {analytics.topPortfolioItems.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h3 className="font-bold mb-2">{item.title}</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Views</p>
                                            <p className="font-bold">{item.views}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Favorites</p>
                                            <p className="font-bold">{item.favorites}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Custom Requests</p>
                                            <p className="font-bold">{item.customRequests}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Conversion</p>
                                            <p className="font-bold">
                                                {item.views > 0 ? ((item.customRequests / item.views) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Wishlist Analytics</h2>
                        <p className="text-gray-600 mb-4">
                            Total items in wishlist: {analytics.overview.wishlistCount}
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-center text-gray-500">
                                Wishlist analytics would show:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-gray-600">
                                <li>Most wishlisted items</li>
                                <li>Wishlist to purchase conversion rate</li>
                                <li>Popular categories in your wishlist</li>
                                <li>Trends in wishlist additions</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'admin' && user.roles && user.roles.includes('admin') && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Admin Platform Analytics</h2>
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg mb-4">Admin analytics dashboard</p>
                            <p className="text-gray-500">
                                This section shows platform-wide metrics, user growth, revenue trends, and system performance.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsPage;
