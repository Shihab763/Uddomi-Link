const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Get all seller's products
        const sellerProducts = await Product.find({ seller: sellerId });
        const productIds = sellerProducts.map(p => p._id.toString());

        // Get all orders containing seller's products
        const allOrders = await Order.find({}).populate('items.product');

        // Filter orders that contain seller's products
        let sellerRevenue = 0;
        let sellerOrderCount = 0;
        let totalProductsSold = 0;
        const productSales = {};
        const orderSet = new Set();

        allOrders.forEach(order => {
            let hasSellerProduct = false;

            order.items.forEach(item => {
                const productId = item.product?._id?.toString();

                if (productIds.includes(productId)) {
                    hasSellerProduct = true;

                    // Track revenue for this seller
                    sellerRevenue += item.price * item.quantity;
                    totalProductsSold += item.quantity;

                    // Track product sales
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

            if (hasSellerProduct) {
                orderSet.add(order._id.toString());
            }
        });

        sellerOrderCount = orderSet.size;

        // Get top 5 products
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5)
            .map(p => ({
                name: p.product?.name || 'Unknown',
                quantity: p.totalQuantity,
                revenue: p.totalRevenue,
                stock: p.product?.stock || 0
            }));

        // Get recent orders
        const recentOrders = allOrders
            .filter(order => {
                return order.items.some(item =>
                    productIds.includes(item.product?._id?.toString())
                );
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(o => ({
                _id: o._id,
                buyer: o.buyer?.name || 'Unknown',
                totalAmount: o.totalAmount,
                status: o.status,
                createdAt: o.createdAt,
                items: o.items.filter(item =>
                    productIds.includes(item.product?._id?.toString())
                ).map(item => ({
                    name: item.product?.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            }));

        // Get pending products count
        const pendingProducts = sellerProducts.filter(p => !p.isApproved).length;
        const approvedProducts = sellerProducts.filter(p => p.isApproved).length;

        // Low stock products (stock < 5)
        const lowStock = sellerProducts.filter(p => p.stock < 5 && p.stock > 0);

        res.json({
            overview: {
                totalRevenue: sellerRevenue,
                totalOrders: sellerOrderCount,
                totalProductsSold,
                totalProducts: sellerProducts.length,
                approvedProducts,
                pendingProducts
            },
            topProducts,
            recentOrders,
            lowStockProducts: lowStock.map(p => ({
                name: p.name,
                stock: p.stock,
                _id: p._id
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getSellerAnalytics
};
