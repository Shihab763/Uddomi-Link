const ServiceBooking = require('../models/serviceBookingModel');
const Notification = require('../models/notificationSystemModel'); 


const createBooking = async (req, res) => {
    try {
        const { sellerId, serviceType, description, amount } = req.body;

        if (!sellerId || !amount) {
            return res.status(400).json({ message: 'Seller ID and Amount are required' });
        }

        // 1. Create the Booking
        const booking = await ServiceBooking.create({
            buyer: req.user._id,
            seller: sellerId,
            serviceType,
            description,
            amount
        });

        // 2. Notify the Seller
        await Notification.create({
            user: sellerId,
            sender: req.user._id,
            title: 'New Job Request',
            type: 'booking_request',
            message: `${req.user.name} wants to hire you for ${serviceType} (৳${amount})`,
            link: '/dashboard', // Redirects to Transaction Dashboard
            isRead: false
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMyBookings = async (req, res) => {
    try {
        const bookings = await ServiceBooking.find({
            $or: [
                { buyer: req.user._id },
                { seller: req.user._id }
            ]
        })
        .populate('buyer', 'name email')
        .populate('seller', 'name email businessInfo')
        .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await ServiceBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.status = status;
        await booking.save();

        // Notify Buyer about update
        if (status === 'Accepted' || status === 'Completed') {
            await Notification.create({
                user: booking.buyer,
                sender: req.user._id,
                title: 'Booking Update',
                type: 'booking_update',
                message: `Your request for '${booking.serviceType}' is now ${status}`,
                link: '/dashboard',
                isRead: false
            });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };