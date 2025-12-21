const mongoose = require('mongoose');

const customOrderSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title for your request']
    },
    description: {
        type: String,
        required: [true, 'Please describe what you need']
    },
    category: {
        type: String,
        required: true,
        enum: ['artwork', 'handicraft', 'textile', 'jewelry', 'furniture', 'food', 'service', 'other']
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    referenceImages: [{
        url: String,
        caption: String
    }],
    specifications: {
        dimensions: String,
        materials: [String],
        colors: [String],
        quantity: Number,
        otherRequirements: String
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    sellerResponse: {
        message: String,
        quotedPrice: Number,
        estimatedDelivery: Date,
        responseDate: Date
    },
    conversation: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        attachments: [String],
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);
