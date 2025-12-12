const mongoose = require('mongoose');

const roleRequestSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedRole: {
        type: String,
        required: true,
        enum: ['business-owner', 'investor']
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for this request']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RoleRequest', roleRequestSchema);
