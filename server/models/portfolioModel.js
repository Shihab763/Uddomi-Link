const mongoose = require('mongoose');

const portfolioSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    mediaType: {
        type: String,
        required: true,
        enum: ['image', 'video', 'document']
    },
    mediaUrl: {
        type: String,
        required: [true, 'Please add media URL']
    },
    thumbnailUrl: {
        type: String
    },
    category: {
        type: String,
        required: true,
        enum: ['painting', 'music', 'dance', 'craft', 'textile', 'agriculture', 'food', 'design', 'other']
    },
    tags: [{
        type: String
    }],
    skills: [{
        type: String
    }],
    acceptsCustomOrders: {
        type: Boolean,
        default: false
    },
    priceRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    favoriteCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    customOrderEnabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

portfolioSchema.index({ title: 'text', description: 'text', tags: 'text', skills: 'text' });

module.exports = mongoose.model('Portfolio', portfolioSchema);
