const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCustomOrder,
  getMyCustomOrders,
  getCreatorCustomOrders,
  updateCustomOrderStatus,
} = require('../controllers/customOrderController');

router.post('/', protect, createCustomOrder);
router.get('/my', protect, getMyCustomOrders);
router.get('/creator', protect, getCreatorCustomOrders);
router.patch('/:id', protect, updateCustomOrderStatus);

module.exports = router;
