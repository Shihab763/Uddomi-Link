const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['handicrafts', 'textiles', 'pottery', 'jewelry', 'food', 'furniture', 'other']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: 0,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
