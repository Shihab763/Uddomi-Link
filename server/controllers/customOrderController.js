const CustomOrder = require('../models/customOrderModel');
const Notification = require('../models/notificationSystemModel'); 


const createCustomOrder = async (req, res) => {
    try {
        const { sellerId, title, description, budget, deadline } = req.body;

        
        const order = await CustomOrder.create({
            buyerId: req.user._id,
            sellerId,
            title,
            description,
            budget,
            deadline
        });

        
        await Notification.create({
            user: sellerId, 
            sender: req.user._id, 
            title: 'New Custom Order Request',
            message: `${req.user.name} wants to hire you for a custom project: ${title}`,
            type: 'custom_order_request',
            link: '/custom-orders', 
            isRead: false
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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


const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        const orderId = req.params.id;

        const order = await CustomOrder.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        
        if (order.sellerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        order.status = status;
        await order.save();

     
        await Notification.create({
            user: order.buyerId, 
            sender: req.user._id, 
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
