const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createPortfolio,
  getMyPortfolios,
  getPortfolioById,
} = require('../controllers/portfolioController');

router.post('/', protect, upload.single('media'), createPortfolio);
router.get('/my', protect, getMyPortfolios);
router.get('/:id', getPortfolioById);

module.exports = router;
