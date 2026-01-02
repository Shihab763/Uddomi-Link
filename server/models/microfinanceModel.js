const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerName: {
        type: String, // e.g., 'BRAC Bank', 'Grameen Bank'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    interestRate: {
        type: Number,
        default: 5.0 // 5% flat rate for simulation
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MicrofinanceLoan', loanSchema);