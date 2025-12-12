const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Create review
        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment
        });

        // Recalculate product rating
        await calculateProductRating(productId);

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name profile.profilePicture');

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name profile.profilePicture')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update own review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        // Recalculate product rating
        await calculateProductRating(review.product);

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name profile.profilePicture');

        res.json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete own review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(reviewId);

        // Recalculate product rating
        await calculateProductRating(productId);

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin delete review
const adminDeleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(reviewId);

        // Recalculate product rating
        await calculateProductRating(productId);

        res.json({ message: 'Review deleted by admin' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const calculateProductRating = async (productId) => {
    try {
        const reviews = await Review.find({ product: productId });

        if (reviews.length === 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: { average: 0, count: 0 }
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            rating: {
                average: Math.round(average * 10) / 10, // Round the value
                count: reviews.length
            }
        });
    } catch (error) {
        console.error('Error calculating rating:', error);
    }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    adminDeleteReview
};
