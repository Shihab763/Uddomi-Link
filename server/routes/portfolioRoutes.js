const express = require('express');
const router = express.Router();
const {
    getAllPortfolios,
    getPortfolioById,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    getMyPortfolios,
    toggleLike
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllPortfolios);
router.get('/:id', getPortfolioById);

// Protected routes
router.post('/', protect, createPortfolio);
router.put('/:id', protect, updatePortfolio);
router.delete('/:id', protect, deletePortfolio);
router.get('/my/portfolios', protect, getMyPortfolios);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
