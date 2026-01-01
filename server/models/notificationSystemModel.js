const mongoose = require('mongoose');

const notificationSystemSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['message', 'order_status', 'booking_request', 'role_update', 'system', 'mentorship_offer'],
        default: 'system'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    link: {
        type: String
    }
}, {
    timestamps: true
});

notificationSystemSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('NotificationSystem', notificationSystemSchema);