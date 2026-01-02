const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/serviceBookingController');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;