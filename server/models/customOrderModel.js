const mongoose = require('mongoose');

const customOrderSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add description']
    },
    requirements: {
        type: String,
        required: true
    },
    budgetRange: {
        min: { type: Number, required: true, min: 0 },
        max: { type: Number, required: true, min: 0 }
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    portfolioItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio'
    },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        attachments: [String],
        timestamp: { type: Date, default: Date.now }
    }],
    finalPrice: {
        type: Number,
        min: 0
    },
    deliveryDate: {
        type: Date
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);
