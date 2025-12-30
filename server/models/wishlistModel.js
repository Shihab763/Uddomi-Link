const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        itemType: {
            type: String,
            enum: ['portfolio', 'product', 'creator', 'training'],
            required: true
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'items.itemType'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    categories: [{
        name: String,
        itemIds: [mongoose.Schema.Types.ObjectId]
    }]
}, {
    timestamps: true
});

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.itemId': 1, 'items.itemType': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
