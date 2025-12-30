const mongoose = require('mongoose');
const SearchIndex = require('./searchIndexModel');

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

portfolioSchema.post('save', async function(doc) {
    await updatePortfolioSearchIndex(doc);
});

portfolioSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        await updatePortfolioSearchIndex(doc);
    }
});

portfolioSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await SearchIndex.deleteOne({
            itemType: 'portfolio',
            itemId: doc._id
        });
    }
});

async function updatePortfolioSearchIndex(doc) {
    const User = require('./userModel');
    const creator = await User.findById(doc.creator);
    
    const searchData = {
        title: doc.title,
        description: doc.description,
        category: doc.category,
        tags: doc.tags,
        skills: doc.skills,
        price: doc.priceRange?.min || 0,
        location: creator?.location || {},
        creator: doc.creator,
        acceptsCustomOrders: doc.acceptsCustomOrders,
        isActive: doc.isActive,
        lastUpdated: new Date()
    };

    if (creator?.location?.coordinates) {
        searchData.location = {
            ...searchData.location,
            coordinates: creator.location.coordinates
        };
    }

    await SearchIndex.findOneAndUpdate(
        {
            itemType: 'portfolio',
            itemId: doc._id
        },
        searchData,
        { upsert: true, new: true }
    );
}

module.exports = mongoose.model('Portfolio', portfolioSchema);
