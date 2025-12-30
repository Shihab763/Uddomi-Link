const mongoose = require('mongoose');

const analyticsEventSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            'portfolio_view', 'portfolio_favorite', 'portfolio_custom_request',
            'product_view', 'product_purchase', 'product_review',
            'booking_request', 'booking_confirmation', 'booking_completion',
            'custom_order_request', 'custom_order_completion',
            'search_performed', 'wishlist_add', 'wishlist_remove',
            'training_view', 'training_completion',
            'profile_view', 'message_sent'
        ]
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['portfolio', 'product', 'user', 'booking', 'custom_order', 'training']
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

analyticsEventSchema.index({ user: 1, eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ targetId: 1, targetType: 1, createdAt: -1 });

const userAnalyticsSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profileViews: {
        type: Number,
        default: 0
    },
    portfolioViews: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    totalCustomOrders: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    wishlistCount: {
        type: Number,
        default: 0
    },
    monthlyStats: [{
        month: String,
        year: Number,
        views: Number,
        revenue: Number,
        orders: Number,
        bookings: Number
    }],
    topPortfolioItems: [{
        portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
        title: String,
        views: Number,
        favorites: Number,
        customRequests: Number
    }]
}, {
    timestamps: true
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);

module.exports = { AnalyticsEvent, UserAnalytics };
