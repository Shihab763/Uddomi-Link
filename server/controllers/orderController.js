const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            product.stock -= item.quantity;
            await product.save();
        }

        const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const order = await Order.create({
            buyer: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentStatus: 'completed',
            paymentIntentId
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('buyer', 'name email')
            .populate('items.product', 'name imageUrl');

        res.status(201).json({
            order: populatedOrder,
            message: 'Order placed successfully',
            mockPayment: {
                paymentIntentId,
                status: 'succeeded',
                amount: totalAmount,
                note: 'This is a mock Stripe payment. In production, integrate real Stripe API.'
            }
        });
    } catch (error) {
        console.error('❌ Order Error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('items.product', 'name imageUrl price')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer', 'name email')
            .populate('items.product', 'name imageUrl price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isSeller = order.items.some(item =>
            item.product.seller.toString() === req.user._id.toString()
        );

        if (!isSeller) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus
};
