import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './BookingHistory.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      console.log('User data from localStorage:', userData);

      if (!userData) {
        setError('Please login to view your bookings');
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/user`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to view your bookings');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Fetched bookings:', data);
      setBookings(data);
    } catch (err) {
      setError('Error loading bookings. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/booking/details/${bookingId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#00e676';
      case 'pending':
        return '#ffd600';
      case 'cancelled':
        return '#ff1744';
      case 'completed':
        return '#00b0ff';
      default:
        return '#bdbdbd';
    }
  };

  if (loading) {
    return (
      <div className="booking-history-page dark">
        <div className="loading">Loading bookings...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-history-page dark">
      <div className="booking-history-container">
        <h1>My Bookings</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You haven't made any bookings yet.</p>
            <button 
              className="find-stations-btn"
              onClick={() => navigate('/map')}
            >
              Find Charging Stations
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.station?.name || 'Unknown Station'}</h3>
                  
                </div>
                
                <div className="booking-details">
                  <p>
                    <strong>Date:</strong> {new Date(booking.startTime).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60))} minutes
                  </p>
                  <p>
                    <strong>Total Amount:</strong> Rs.{booking.totalAmount}
                  </p>
                  {booking.station?.location && (
                    <p>
                      <strong>Location:</strong> {booking.station.location}
                    </p>
                  )}
                </div>
                
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BookingHistory; 