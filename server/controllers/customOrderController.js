const CustomOrder = require('../models/customOrderModel');
const Portfolio = require('../models/portfolioModel');
const User = require('../models/userModel');
const { AnalyticsEvent, UserAnalytics } = require('../models/analyticsModel');

const createCustomOrder = async (req, res) => {
    try {
        const { title, description, requirements, budgetRange, deadline, portfolioItemId, creatorId } = req.body;

        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ message: 'Creator not found' });
        }

        if (!creator.roles || (!creator.roles.includes('business-owner') && !creator.roles.includes('artist'))) {
            return res.status(400).json({ message: 'User does not accept custom orders' });
        }

        const customOrder = await CustomOrder.create({
            title,
            description,
            requirements,
            budgetRange: {
                min: parseFloat(budgetRange.min),
                max: parseFloat(budgetRange.max)
            },
            deadline: new Date(deadline),
            customer: req.user._id,
            creator: creatorId,
            portfolioItem: portfolioItemId,
            status: 'pending'
        });

        if (portfolioItemId) {
            await Portfolio.findByIdAndUpdate(portfolioItemId, {
                $inc: { viewCount: 1 }
            });

            await AnalyticsEvent.create({
                user: req.user._id,
                eventType: 'portfolio_custom_request',
                targetId: portfolioItemId,
                targetType: 'portfolio',
                metadata: { orderId: customOrder._id }
            });
        }

        await AnalyticsEvent.create({
            user: req.user._id,
            eventType: 'custom_order_request',
            targetId: customOrder._id,
            targetType: 'custom_order',
            metadata: { creatorId: creatorId, portfolioItemId }
        });

        await UserAnalytics.findOneAndUpdate(
            { user: creatorId },
            { $inc: { totalCustomOrders: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json(customOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyCustomOrders = async (req, res) => {
    try {
        let filter = {};

        if (req.user.roles && req.user.roles.includes('business-owner')) {
            filter.creator = req.user._id;
        } else {
            filter.customer = req.user._id;
        }

        const { status } = req.query;
        if (status) {
            filter.status = status;
        }

        const customOrders = await CustomOrder.find(filter)
            .populate('customer', 'name email profileImage')
            .populate('creator', 'name email profileImage')
            .populate('portfolioItem', 'title thumbnailUrl')
            .sort({ createdAt: -1 });

        res.json(customOrders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCustomOrderById = async (req, res) => {
    try {
        const customOrder = await CustomOrder.findById(req.params.id)
            .populate('customer', 'name email profileImage phone')
            .populate('creator', 'name email profileImage phone')
            .populate('portfolioItem', 'title thumbnailUrl mediaUrl');

        if (!customOrder) {
            return res.status(404).json({ message: 'Custom order not found' });
        }

        const isAuthorized = customOrder.customer._id.toString() === req.user._id.toString() ||
            customOrder.creator._id.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(customOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateCustomOrderStatus = async (req, res) => {
    try {
        const { status, finalPrice, deliveryDate, cancellationReason } = req.body;

        const customOrder = await CustomOrder.findById(req.params.id);

        if (!customOrder) {
            return res.status(404).json({ message: 'Custom order not found' });
        }

        if (customOrder.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        customOrder.status = status || customOrder.status;
        if (finalPrice) customOrder.finalPrice = finalPrice;
        if (deliveryDate) customOrder.deliveryDate = new Date(deliveryDate);
        if (cancellationReason) customOrder.cancellationReason = cancellationReason;

        await customOrder.save();

        if (status === 'completed') {
            await AnalyticsEvent.create({
                user: req.user._id,
                eventType: 'custom_order_completion',
                targetId: customOrder._id,
                targetType: 'custom_order',
                metadata: { customerId: customOrder.customer, finalPrice }
            });
        }

        res.json(customOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addMessageToOrder = async (req, res) => {
    try {
        const { message, attachments } = req.body;

        const customOrder = await CustomOrder.findById(req.params.id);

        if (!customOrder) {
            return res.status(404).json({ message: 'Custom order not found' });
        }

        const isAuthorized = customOrder.customer.toString() === req.user._id.toString() ||
            customOrder.creator.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to message on this order' });
        }

        customOrder.messages.push({
            sender: req.user._id,
            message,
            attachments: attachments || []
        });

        await customOrder.save();

        res.json(customOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const rateCustomOrder = async (req, res) => {
    try {
        const { rating, review } = req.body;

        const customOrder = await CustomOrder.findById(req.params.id);

        if (!customOrder) {
            return res.status(404).json({ message: 'Custom order not found' });
        }

        if (customOrder.status !== 'completed') {
            return res.status(400).json({ message: 'Can only rate completed orders' });
        }

        if (customOrder.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only customer can rate this order' });
        }

        customOrder.rating = rating;
        customOrder.review = review;
        await customOrder.save();

        res.json(customOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createCustomOrder,
    getMyCustomOrders,
    getCustomOrderById,
    updateCustomOrderStatus,
    addMessageToOrder,
    rateCustomOrder
};
