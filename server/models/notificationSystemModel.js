const mongoose = require('mongoose');

// Define the schema
const notificationSchema = mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String, 
        required: true 
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'booking_request', 'booking_update', 'loan_update', 'custom_order_request', 'custom_order_update'], 
        default: 'info'
    },
    link: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

if (mongoose.models.Notification) {
    delete mongoose.models.Notification;
}

module.exports = mongoose.model('Notification', notificationSchema);

