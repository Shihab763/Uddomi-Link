const mongoose = require('mongoose');

const searchIndexSchema = mongoose.Schema({
    itemType: {
        type: String,
        required: true,
        enum: ['product', 'portfolio', 'user', 'training']
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemType'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        index: true
    }],
    skills: [{
        type: String,
        index: true
    }],
    price: {
        type: Number,
        min: 0,
        index: true
    },
    location: {
        city: String,
        district: String,
        coordinates: {
            type: [Number] // [longitude, latitude]
        }
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    availability: {
        type: String,
        enum: ['available', 'limited', 'unavailable'],
        default: 'available'
    },
    acceptsCustomOrders: {
        type: Boolean,
        default: false
    },
    acceptsBookings: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    searchScore: {
        type: Number,
        default: 1
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Text search index
searchIndexSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text',
    skills: 'text'
});

// Compound indexes for common queries
searchIndexSchema.index({ itemType: 1, category: 1, price: 1 });
searchIndexSchema.index({ itemType: 1, 'location.city': 1, isActive: 1 });
searchIndexSchema.index({ itemType: 1, acceptsCustomOrders: 1, isActive: 1 });
searchIndexSchema.index({ itemType: 1, acceptsBookings: 1, isActive: 1 });

// For autocomplete/suggestions
searchIndexSchema.index({ title: 1, itemType: 1 });

module.exports = mongoose.model('SearchIndex', searchIndexSchema);
