import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './BookingDetails.css';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data = await response.json();
      setBooking(data);
    } catch (err) {
      setError('Error loading booking details. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to cancel booking');
        }

        // Refresh booking details
        fetchBookingDetails();
      } catch (err) {
        setError('Error cancelling booking. Please try again.');
        console.error('Error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="booking-details-page dark">
        <Navbar />
        <div className="loading">Loading booking details...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-details-page dark">
        <Navbar />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-details-page dark">
        <Navbar />
        <div className="not-found">Booking not found</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-details-page dark">
      <Navbar />
      <div className="booking-details-container">
        <h1>Booking Details</h1>
        
        <div className="booking-details-card">
          <div className="booking-header">
            <h2>{booking.station.name}</h2>
            <span className={`status-badge ${booking.status}`}>
              {booking.status}
            </span>
          </div>

          <div className="details-section">
            <h3>Booking Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Booking ID</label>
                <span>{booking.id}</span>
              </div>
              <div className="detail-item">
                <label>Vehicle Number</label>
                <span>{booking.vehicleNumber}</span>
              </div>
              <div className="detail-item">
                <label>Date</label>
                <span>{new Date(booking.startTime).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Start Time</label>
                <span>{new Date(booking.startTime).toLocaleTimeString()}</span>
              </div>
              <div className="detail-item">
                <label>End Time</label>
                <span>{new Date(booking.endTime).toLocaleTimeString()}</span>
              </div>
              <div className="detail-item">
                <label>Duration</label>
                <span>{Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60))} minutes</span>
              </div>
              <div className="detail-item">
                <label>Total Amount</label>
                <span>Rs.{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Station Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Location</label>
                <span>{booking.station.location}</span>
              </div>
              <div className="detail-item">
                <label>Charger Types</label>
                <span>{booking.station.chargerTypes.join(', ')}</span>
              </div>
              <div className="detail-item">
                <label>Price per kWh</label>
                <span>Rs.{booking.station.pricing}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {booking.status === 'pending' && (
              <button 
                className="cancel-btn"
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </button>
            )}
            <button 
              className="back-btn"
              onClick={() => navigate('/bookings')}
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingDetails; 