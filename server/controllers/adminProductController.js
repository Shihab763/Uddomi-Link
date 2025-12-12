const Product = require('../models/productModel');

const getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ isApproved: false }).populate('seller', 'name email').sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const approveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isApproved = true;
        await product.save();

        res.json({ message: 'Product approved successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const rejectProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product rejected and deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find({}).populate('seller', 'name email').sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getPendingProducts,
    approveProduct,
    rejectProduct,
    getAllProductsAdmin
};
