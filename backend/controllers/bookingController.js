const Booking = require('../models/Booking');
const Station = require('../models/Station');
const { Op } = require('sequelize');
const { createPaymentIntent, confirmPayment } = require('../utils/paymentService');
const { sendBookingConfirmation } = require('../utils/emailService');
const moment = require('moment-timezone');
const User = require('../models/User');
const crypto = require('crypto');

// Create new booking
const createBooking = async (req, res) => {
  let { stationId, startTime, endTime, chargerType, vehicleNumber } = req.body;

  // Find the user with the highest ID
  const user = await User.findOne({ order: [['id', 'DESC']] });
  if (!user) {
    return res.status(400).json({ msg: 'No users found in the database.' });
  }
  const userId = user.id;

  // Generate unique charging code
  const chargingCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  // Convert to Asia/Colombo time if not already
  if (!startTime) {
    startTime = moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
  } else {
    startTime = moment(startTime).tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
  }
  if (!endTime) {
    endTime = moment().tz('Asia/Colombo').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
  } else {
    endTime = moment(endTime).tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
  }

  try {
    // Check station availability
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(404).json({ msg: 'Station not found' });
    }

    if (station.availableChargers <= 0) {
      return res.status(400).json({ msg: 'No chargers available at this station' });
    }

    // Check if station is available during the requested time
    const conflictingBooking = await Booking.findOne({
      where: {
        stationId,
        status: 'active',
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime]
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ msg: 'Station is not available during the selected time' });
    }

    // Calculate total amount
    const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60); // in hours
    const totalAmount = duration * station.pricing;

    // Create booking
    const booking = await Booking.create({
      userId,
      stationId,
      startTime,
      endTime,
      chargerType,
      vehicleNumber,
      totalAmount,
      status: 'pending',
      chargingCode
    });

    // Update station's available chargers
    await station.update({
      availableChargers: station.availableChargers - 1
    });

    // Fetch the saved booking from the DB (to get all values as stored)
    const savedBooking = await Booking.findByPk(booking.id);

    // Send confirmation email using the saved booking
    if (user && user.email) {
      const bookingForEmail = {
        ...savedBooking.toJSON(),
        stationName: station.name
      };
      await sendBookingConfirmation(user.email, bookingForEmail);
    }

    res.status(201).json({
      booking,
      message: 'Charging session started successfully'
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Confirm booking after payment
const confirmBooking = async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;

  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Verify payment
    const isPaymentSuccessful = await confirmPayment(paymentIntentId);
    if (!isPaymentSuccessful) {
      return res.status(400).json({ msg: 'Payment verification failed' });
    }

    // Update booking status
    await booking.update({
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    // Send confirmation email
    await sendBookingConfirmation(req.user.email, booking);

    res.json({ msg: 'Booking confirmed successfully', booking });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    // Find the user with the highest ID
    const user = await User.findOne({ order: [['id', 'DESC']] });
    if (!user) {
      return res.status(400).json({ msg: 'No users found in the database.' });
    }
    const userId = user.id;

    console.log('Fetching bookings for user:', userId);

    const bookings = await Booking.findAll({
      where: { userId },
      include: [{
        model: Station,
        attributes: ['id', 'name', 'location', 'chargerTypes', 'pricing']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found bookings:', bookings.length);

    // Format the response to ensure station data is properly structured
    const formattedBookings = bookings.map(booking => ({
      ...booking.toJSON(),
      station: booking.Station ? {
        id: booking.Station.id,
        name: booking.Station.name,
        location: booking.Station.location,
        chargerTypes: booking.Station.chargerTypes,
        pricing: booking.Station.pricing
      } : null
    }));

    res.json(formattedBookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId || 1; // Default to user 1 if not provided

  try {
    const booking = await Booking.findOne({
      where: { id, userId }
    });

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking is already cancelled' });
    }

    // Update station's available chargers
    const station = await Station.findByPk(booking.stationId);
    if (station) {
      await station.update({
        availableChargers: station.availableChargers + 1
      });
    }

    await booking.update({ status: 'cancelled' });
    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    await booking.update({ status });
    res.json({ msg: 'Booking status updated successfully' });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  getUserBookings,
  cancelBooking,
  updateBookingStatus
}; 