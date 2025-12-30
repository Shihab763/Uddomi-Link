const express = require('express');
const router = express.Router();
const {
    createPortfolio,
    getPortfolioItems,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    getMyPortfolios,
    incrementFavoriteCount
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPortfolioItems);
router.get('/:id', getPortfolioById);
router.post('/', protect, createPortfolio);
router.put('/:id', protect, updatePortfolio);
router.delete('/:id', protect, deletePortfolio);
router.get('/creator/my-portfolios', protect, getMyPortfolios);
router.post('/:id/favorite', protect, incrementFavoriteCount);

module.exports = router;
