const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// User routes
router.post('/', bookingController.createBooking);
router.post('/confirm', bookingController.confirmBooking);
router.get('/user', bookingController.getUserBookings);
router.put('/:id/cancel', bookingController.cancelBooking);

// Admin routes
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router; 