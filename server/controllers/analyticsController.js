const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAnalytics = async (req, res) => {
    try {
        // Get all orders
        const allOrders = await Order.find({}).populate('items.product');

        // Calculate total revenue
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Count orders by status
        const ordersByStatus = {
            pending: allOrders.filter(o => o.status === 'pending').length,
            processing: allOrders.filter(o => o.status === 'processing').length,
            shipped: allOrders.filter(o => o.status === 'shipped').length,
            delivered: allOrders.filter(o => o.status === 'delivered').length,
            cancelled: allOrders.filter(o => o.status === 'cancelled').length
        };

        // Get product sales
        const productSales = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.product?._id?.toString();
                if (productId) {
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            product: item.product,
                            totalQuantity: 0,
                            totalRevenue: 0
                        };
                    }
                    productSales[productId].totalQuantity += item.quantity;
                    productSales[productId].totalRevenue += item.price * item.quantity;
                }
            });
        });

        // Get top 5 products
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5)
            .map(p => ({
                name: p.product?.name || 'Unknown',
                quantity: p.totalQuantity,
                revenue: p.totalRevenue
            }));

        // Get seller stats
        const sellerStats = {};
        const products = await Product.find({}).populate('seller', 'name email');

        products.forEach(product => {
            const sellerId = product.seller?._id?.toString();
            if (sellerId) {
                if (!sellerStats[sellerId]) {
                    sellerStats[sellerId] = {
                        seller: product.seller,
                        productCount: 0,
                        totalSold: 0
                    };
                }
                sellerStats[sellerId].productCount += 1;
            }
        });

        // Add sales data to sellers
        Object.values(productSales).forEach(ps => {
            const sellerId = ps.product?.seller?.toString();
            if (sellerId && sellerStats[sellerId]) {
                sellerStats[sellerId].totalSold += ps.totalQuantity;
            }
        });

        const topSellers = Object.values(sellerStats)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5)
            .map(s => ({
                name: s.seller?.name || 'Unknown',
                email: s.seller?.email || 'N/A',
                productCount: s.productCount,
                totalSold: s.totalSold
            }));

        // Recent orders
        const recentOrders = await Order.find({})
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            overview: {
                totalOrders: allOrders.length,
                totalRevenue,
                avgOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
                totalProducts: products.length
            },
            ordersByStatus,
            topProducts,
            topSellers,
            recentOrders: recentOrders.map(o => ({
                _id: o._id,
                buyer: o.buyer?.name || 'Unknown',
                totalAmount: o.totalAmount,
                status: o.status,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAnalytics
};
