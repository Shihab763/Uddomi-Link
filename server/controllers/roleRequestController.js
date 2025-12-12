const RoleRequest = require('../models/roleRequestModel');
const User = require('../models/userModel');

const createRoleRequest = async (req, res) => {
    try {
        const { requestedRole, reason } = req.body;

        if (!['business-owner', 'investor'].includes(requestedRole)) {
            return res.status(400).json({ message: 'Invalid role requested' });
        }

        if (req.user.roles && req.user.roles.includes(requestedRole)) {
            return res.status(400).json({ message: 'You already have this role' });
        }

        const existingRequest = await RoleRequest.findOne({
            user: req.user._id,
            requestedRole,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this role' });
        }

        const roleRequest = await RoleRequest.create({
            user: req.user._id,
            requestedRole,
            reason
        });

        res.status(201).json(roleRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const requests = await RoleRequest.find({ status: 'pending' })
            .populate('user', 'name email roles')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const approveRequest = async (req, res) => {
    try {
        const request = await RoleRequest.findById(req.params.id).populate('user');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        const user = await User.findById(request.user._id);

        if (!user.roles.includes(request.requestedRole)) {
            user.roles.push(request.requestedRole);
            await user.save();
        }

        request.status = 'approved';
        await request.save();

        res.json({ message: 'Role request approved', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const request = await RoleRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Role request rejected', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createRoleRequest,
    getPendingRequests,
    approveRequest,
    rejectRequest
};
