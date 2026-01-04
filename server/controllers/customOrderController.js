const CustomOrder = require('../models/customOrderModel');
const Notification = require('../models/notificationSystemModel'); // Using your friend's model

// 1. Create Order & Notify Seller
const createCustomOrder = async (req, res) => {
    try {
        const { sellerId, title, description, budget, deadline } = req.body;

        // Create the order
        const order = await CustomOrder.create({
            buyerId: req.user._id,
            sellerId,
            title,
            description,
            budget,
            deadline
        });

        // TRIGGER NOTIFICATION FOR SELLER
        await Notification.create({
            user: sellerId, // Sent TO the seller
            sender: req.user._id, // Sent BY the buyer
            title: 'New Custom Order Request',
            message: `${req.user.name} wants to hire you for a custom project: ${title}`,
            type: 'custom_order_request',
            link: '/custom-orders', // Clicking this takes seller to their dashboard tab
            isRead: false
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get Orders (For Creator/Seller Dashboard)
const getReceivedOrders = async (req, res) => {
    try {
        const orders = await CustomOrder.find({ sellerId: req.user._id })
            .populate('buyerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get Orders (For Customer Dashboard)
const getSentOrders = async (req, res) => {
    try {
        const orders = await CustomOrder.find({ buyerId: req.user._id })
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Update Status & Notify Buyer
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const orderId = req.params.id;

        const order = await CustomOrder.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Security check: only the seller can update
        if (order.sellerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        order.status = status;
        await order.save();

        // TRIGGER NOTIFICATION FOR BUYER
        await Notification.create({
            user: order.buyerId, // Sent TO the buyer
            sender: req.user._id, // Sent BY the seller
            title: `Custom Order ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
            message: `Your request "${order.title}" was ${status} by the creator.`,
            type: 'custom_order_update',
            link: '/custom-orders',
            isRead: false
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCustomOrder,
    getReceivedOrders,
    getSentOrders,
    updateOrderStatus
};
