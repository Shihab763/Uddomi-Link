const { AnalyticsEvent, UserAnalytics } = require('../models/analyticsModel');
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');
const Product = require('../models/productModel');
const Booking = require('../models/bookingModel');
const CustomOrder = require('../models/customOrderModel');

const getUserAnalytics = async (req, res) => {
    try {
        let userAnalytics = await UserAnalytics.findOne({ user: req.user._id });

        if (!userAnalytics) {
            userAnalytics = await UserAnalytics.create({
                user: req.user._id,
                profileViews: 0,
                portfolioViews: 0,
                totalRevenue: 0,
                totalOrders: 0,
                totalBookings: 0,
                totalCustomOrders: 0,
                averageRating: 0,
                wishlistCount: 0,
                monthlyStats: []
            });
        }

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentEvents = await AnalyticsEvent.find({
            $or: [
                { targetId: req.user._id, targetType: 'user' },
                { 'metadata.creatorId': req.user._id }
            ],
            createdAt: { $gte: last30Days }
        }).sort({ createdAt: -1 });

        const portfolioItems = await Portfolio.find({ creator: req.user._id })
            .select('title viewCount favoriteCount customOrderEnabled')
            .sort({ viewCount: -1 })
            .limit(5);

        const topPortfolioItems = portfolioItems.map(item => ({
            portfolioId: item._id,
            title: item.title,
            views: item.viewCount,
            favorites: item.favoriteCount,
            customRequests: item.customOrderEnabled ? item.customOrderEnabled : 0
        }));

        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        const currentYear = new Date().getFullYear();

        let monthlyStat = userAnalytics.monthlyStats.find(stat =>
            stat.month === currentMonth && stat.year === currentYear
        );

        if (!monthlyStat) {
            monthlyStat = {
                month: currentMonth,
                year: currentYear,
                views: 0,
                revenue: 0,
                orders: 0,
                bookings: 0
            };
            userAnalytics.monthlyStats.push(monthlyStat);
        }

        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });

            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayEvents = await AnalyticsEvent.countDocuments({
                $or: [
                    { targetId: req.user._id, targetType: 'user' },
                    { 'metadata.creatorId': req.user._id }
                ],
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            weeklyData.push({
                day: dayStr,
                views: dayEvents
            });
        }

        const userProducts = await Product.find({ seller: req.user._id });
        const productRevenue = userProducts.reduce((sum, product) => sum + (product.price || 0), 0);

        const userBookings = await Booking.find({ seller: req.user._id, status: 'completed' });
        const bookingRevenue = userBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

        const userCustomOrders = await CustomOrder.find({ creator: req.user._id, status: 'completed' });
        const customOrderRevenue = userCustomOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0);

        userAnalytics.totalRevenue = productRevenue + bookingRevenue + customOrderRevenue;
        userAnalytics.totalOrders = userProducts.length;
        userAnalytics.totalBookings = userBookings.length;
        userAnalytics.totalCustomOrders = userCustomOrders.length;
        userAnalytics.topPortfolioItems = topPortfolioItems;
        
        monthlyStat.views = weeklyData.reduce((sum, day) => sum + day.views, 0);
        monthlyStat.revenue = userAnalytics.totalRevenue;
        monthlyStat.orders = userAnalytics.totalOrders;
        monthlyStat.bookings = userAnalytics.totalBookings;

        await userAnalytics.save();

        const analyticsData = {
            overview: {
                profileViews: userAnalytics.profileViews,
                portfolioViews: userAnalytics.portfolioViews,
                totalRevenue: userAnalytics.totalRevenue,
                totalOrders: userAnalytics.totalOrders,
                totalBookings: userAnalytics.totalBookings,
                totalCustomOrders: userAnalytics.totalCustomOrders,
                averageRating: userAnalytics.averageRating,
                wishlistCount: userAnalytics.wishlistCount
            },
            topPortfolioItems: userAnalytics.topPortfolioItems,
            monthlyStats: userAnalytics.monthlyStats,
            weeklyData,
            recentEvents: recentEvents.slice(0, 10),
            engagementMetrics: {
                profileViewGrowth: calculateGrowth(userAnalytics.monthlyStats, 'views'),
                revenueGrowth: calculateGrowth(userAnalytics.monthlyStats, 'revenue'),
                conversionRate: userAnalytics.totalOrders > 0 ?
                    ((userAnalytics.totalOrders / userAnalytics.portfolioViews) * 100).toFixed(2) : 0
            }
        };

        res.json(analyticsData);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPortfolioAnalytics = async (req, res) => {
    try {
        const { portfolioId } = req.params;

        const portfolio = await Portfolio.findById(portfolioId);
        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        if (portfolio.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const events = await AnalyticsEvent.find({
            targetId: portfolioId,
            targetType: 'portfolio',
            createdAt: { $gte: last30Days }
        }).sort({ createdAt: -1 });

        const dailyViews = {};
        const eventTypes = {};

        events.forEach(event => {
            const date = event.createdAt.toISOString().split('T')[0];
            dailyViews[date] = (dailyViews[date] || 0) + 1;
            eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
        });

        const customOrders = await CustomOrder.countDocuments({
            portfolioItem: portfolioId,
            status: { $in: ['accepted', 'in_progress', 'completed'] }
        });

        const wishlistCount = await AnalyticsEvent.countDocuments({
            targetId: portfolioId,
            targetType: 'portfolio',
            eventType: 'portfolio_favorite'
        });

        const analytics = {
            portfolioId: portfolio._id,
            title: portfolio.title,
            totalViews: portfolio.viewCount,
            totalFavorites: portfolio.favoriteCount,
            customOrders,
            wishlistCount,
            dailyViews: Object.entries(dailyViews).map(([date, count]) => ({ date, count })),
            eventTypes,
            performance: {
                viewToFavoriteRatio: portfolio.viewCount > 0 ?
                    ((portfolio.favoriteCount / portfolio.viewCount) * 100).toFixed(2) : 0,
                viewToOrderRatio: portfolio.viewCount > 0 ?
                    ((customOrders / portfolio.viewCount) * 100).toFixed(2) : 0
            },
            recentActivity: events.slice(0, 10)
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSearchAnalytics = async (req, res) => {
    try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const searchEvents = await AnalyticsEvent.find({
            eventType: 'search_performed',
            createdAt: { $gte: last30Days },
            user: req.user._id
        });

        const popularSearches = {};
        const searchCategories = {};

        searchEvents.forEach(event => {
            const searchTerm = event.metadata?.query || 'unknown';
            const category = event.metadata?.category || 'general';

            popularSearches[searchTerm] = (popularSearches[searchTerm] || 0) + 1;
            searchCategories[category] = (searchCategories[category] || 0) + 1;
        });

        const sortedSearches = Object.entries(popularSearches)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([term, count]) => ({ term, count }));

        const analytics = {
            totalSearches: searchEvents.length,
            popularSearches: sortedSearches,
            searchCategories,
            searchFrequency: searchEvents.length / 30,
            lastSearches: searchEvents.slice(0, 5).map(event => ({
                term: event.metadata?.query,
                category: event.metadata?.category,
                date: event.createdAt
            }))
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getWishlistAnalytics = async (req, res) => {
    try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const wishlistEvents = await AnalyticsEvent.find({
            user: req.user._id,
            eventType: { $in: ['wishlist_add', 'wishlist_remove'] },
            createdAt: { $gte: last30Days }
        });

        const addsByType = {};
        const removalsByType = {};
        const dailyActivity = {};

        wishlistEvents.forEach(event => {
            const date = event.createdAt.toISOString().split('T')[0];
            const itemType = event.targetType;

            dailyActivity[date] = dailyActivity[date] || { adds: 0, removes: 0 };

            if (event.eventType === 'wishlist_add') {
                addsByType[itemType] = (addsByType[itemType] || 0) + 1;
                dailyActivity[date].adds += 1;
            } else {
                removalsByType[itemType] = (removalsByType[itemType] || 0) + 1;
                dailyActivity[date].removes += 1;
            }
        });

        const conversionEvents = await AnalyticsEvent.find({
            user: req.user._id,
            eventType: { $in: ['product_purchase', 'booking_request', 'custom_order_request'] },
            'metadata.source': 'wishlist',
            createdAt: { $gte: last30Days }
        });

        const analytics = {
            totalAdds: Object.values(addsByType).reduce((a, b) => a + b, 0),
            totalRemovals: Object.values(removalsByType).reduce((a, b) => a + b, 0),
            addsByType,
            removalsByType,
            dailyActivity: Object.entries(dailyActivity).map(([date, activity]) => ({
                date,
                adds: activity.adds,
                removes: activity.removes
            })),
            conversionRate: wishlistEvents.length > 0 ?
                ((conversionEvents.length / Object.values(addsByType).reduce((a, b) => a + b, 0)) * 100).toFixed(2) : 0,
            conversions: conversionEvents.length
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAdminAnalytics = async (req, res) => {
    try {
        if (!req.user.roles || !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const totalUsers = await User.countDocuments();
        const totalBusinessOwners = await User.countDocuments({ roles: 'business-owner' });
        const totalArtists = await User.countDocuments({ roles: 'artist' });
        const totalNGOs = await User.countDocuments({ roles: 'ngo' });

        const totalProducts = await Product.countDocuments();
        const totalPortfolios = await Portfolio.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalCustomOrders = await CustomOrder.countDocuments();

        const recentUsers = await User.find()
            .select('name email roles createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        const platformEvents = await AnalyticsEvent.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const analytics = {
            platformOverview: {
                totalUsers,
                totalBusinessOwners,
                totalArtists,
                totalNGOs,
                totalProducts,
                totalPortfolios,
                totalBookings,
                totalCustomOrders
            },
            growth: {
                userGrowth: await calculateMonthlyGrowth(User),
                productGrowth: await calculateMonthlyGrowth(Product),
                portfolioGrowth: await calculateMonthlyGrowth(Portfolio)
            },
            recentUsers,
            platformActivity: platformEvents,
            topCategories: await getTopCategories(),
            revenueStats: await getRevenueStats()
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateGrowth(monthlyStats, metric) {
    if (monthlyStats.length < 2) return 0;

    const currentMonth = monthlyStats[monthlyStats.length - 1];
    const previousMonth = monthlyStats[monthlyStats.length - 2];

    if (previousMonth[metric] === 0) return 100;

    return (((currentMonth[metric] - previousMonth[metric]) / previousMonth[metric]) * 100).toFixed(2);
}

async function calculateMonthlyGrowth(Model) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthCount = await Model.countDocuments({
        createdAt: { $gte: lastMonth, $lt: thisMonth }
    });

    const thisMonthCount = await Model.countDocuments({
        createdAt: { $gte: thisMonth }
    });

    if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;

    return (((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(2);
}

async function getTopCategories() {
    const portfolioCategories = await Portfolio.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    const productCategories = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    return { portfolioCategories, productCategories };
}

async function getRevenueStats() {
    const completedBookings = await Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const completedOrders = await CustomOrder.aggregate([
        { $match: { status: 'completed', finalPrice: { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$finalPrice" } } }
    ]);

    return {
        bookingRevenue: completedBookings[0]?.total || 0,
        orderRevenue: completedOrders[0]?.total || 0,
        totalRevenue: (completedBookings[0]?.total || 0) + (completedOrders[0]?.total || 0)
    };
}

module.exports = {
    getUserAnalytics,
    getPortfolioAnalytics,
    getSearchAnalytics,
    getWishlistAnalytics,
    getAdminAnalytics
};
