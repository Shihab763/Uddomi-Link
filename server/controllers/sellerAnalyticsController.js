const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const sellerProducts = await Product.find({ seller: sellerId });
        const productIds = sellerProducts.map(p => p._id.toString());


        const mostViewed = [...sellerProducts].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null;

     
        const allOrders = await Order.find({}).populate('items.product');

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

                    // Track Revenue
                    const itemRevenue = item.price * item.quantity;
                    sellerRevenue += itemRevenue;
                    totalProductsSold += item.quantity;

                    // Track Individual Product Sales
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            name: item.product?.name || 'Unknown',
                            totalQuantity: 0,
                            totalRevenue: 0,
                            imageUrl: item.product?.imageUrl,
                            stock: item.product?.stock || 0
                        };
                    }
                    productSales[productId].totalQuantity += item.quantity;
                    productSales[productId].totalRevenue += itemRevenue;
                }
            });

            if (hasSellerProduct) {
                orderSet.add(order._id.toString());
            }
        });

        sellerOrderCount = orderSet.size;


        const productSalesArray = Object.values(productSales);

    
        const topSellingProduct = productSalesArray.sort((a, b) => b.totalQuantity - a.totalQuantity)[0] || null;
        
       
        const highestRevenueProduct = [...productSalesArray].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null;

      
        const recentOrders = allOrders
            .filter(order => order.items.some(item => productIds.includes(item.product?._id?.toString())))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(o => ({
                _id: o._id,
                buyer: o.buyer?.name || 'Unknown',
                totalAmount: o.totalAmount,
                status: o.status,
                createdAt: o.createdAt
            }));

        const lowStock = sellerProducts.filter(p => p.stock < 5 && p.stock > 0);

  
        res.json({
            overview: {
                totalRevenue: sellerRevenue,
                totalOrders: sellerOrderCount,
                totalProductsSold,
                totalProducts: sellerProducts.length,
                totalViews: sellerProducts.reduce((acc, curr) => acc + (curr.views || 0), 0)
            },
            highlights: {
                mostViewed: mostViewed ? {
                    name: mostViewed.name,
                    views: mostViewed.views,
                    imageUrl: mostViewed.imageUrl
                } : null,
                bestSeller: topSellingProduct,
                topEarner: highestRevenueProduct
            },
          
            recentOrders,
            lowStockProducts: lowStock.map(p => ({ name: p.name, stock: p.stock, _id: p._id })),
            allProductsStats: productSalesArray 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getSellerAnalytics };
