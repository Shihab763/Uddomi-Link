const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { applyForLoan, getMyLoans } = require('../controllers/microfinanceController');

router.post('/apply', protect, applyForLoan);
router.get('/my-loans', protect, getMyLoans);

module.exports = router;