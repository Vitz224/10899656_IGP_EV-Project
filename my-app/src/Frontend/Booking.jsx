import React, { useState } from 'react';
import './Booking.css';

const Booking = ({ station, onClose, onBookingComplete }) => {
  const [bookingData, setBookingData] = useState({
    vehicleNumber: "",
    chargerType: "Type 2",
    duration: "1" // Default 1 hour
  });
  const [chargingCode, setChargingCode] = useState("");
  const [showChargingCode, setShowChargingCode] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const handleStartCharging = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time, and convert to Asia/Colombo time
      const startDateTime = new Date(`${preferredDate}T${preferredTime}:00`);
      const startTimeColombo = new Date(startDateTime.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
      const endTimeColombo = new Date(startTimeColombo.getTime() + (parseInt(bookingData.duration) * 3600000));

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: station.id,
          startTime: startTimeColombo.toISOString(),
          endTime: endTimeColombo.toISOString(),
          chargerType: bookingData.chargerType,
          vehicleNumber: bookingData.vehicleNumber,
          status: 'pending'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to start charging');
      }

      const data = await response.json();
      setChargingCode(data.booking.chargingCode); // Use backend-generated code
      setShowChargingCode(true);
    } catch (err) {
      setBookingError(err.message);
      setShowChargingCode(false);
    }
  };

  const handleDone = () => {
    setShowChargingCode(false);
    onBookingComplete();
    onClose();
  };

  return (
    <div className="booking-overlay">
      <div className="booking-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>Book Charging Session</h2>
        <div className="station-details">
          <h3>{station.name}</h3>
          <p>Location: {station.location}</p>
          <p>Available Chargers: {station.availableChargers}/{station.totalChargers}</p>
          <p>Price: Rs.{station.pricing}/kWh</p>
        </div>

        {showChargingCode ? (
          <div className="charging-code-display">
            <h3>Your EV Charging Code</h3>
            <div className="code-box">{chargingCode}</div>
            <p>Please use this <b>code</b> at the charging station to start your session.</p>
            {/* Show start and end time for the session */}
            {(() => {
              if (!preferredDate || !preferredTime) return null;
              const startDateTime = new Date(`${preferredDate}T${preferredTime}:00`);
              const startTimeColombo = new Date(startDateTime.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
              const endTimeColombo = new Date(startTimeColombo.getTime() + (parseInt(bookingData.duration) * 3600000));
              const options = { timeZone: 'Asia/Colombo', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
              return (
                <div className="session-times" style={{ margin: '16px 0', color: '#00ff99', fontWeight: 500 }}>
                  <div>Start Time: {startTimeColombo.toLocaleString('en-US', options)}</div>
                  <div>End Time: {endTimeColombo.toLocaleString('en-US', options)}</div>
                </div>
              );
            })()}
            <div className="policy-contact">
              <strong>EV Code Policy:</strong><br />
              <p>Make sure that you <b>safely</b> store your <b>charging code</b>.</p>
             As it is essential for activating the charging session. This <b>Unique Code</b> must be presented at the station to <b>Begin</b> charging your vehicle. For your convenience and security, we recommend you to keep a <b>Digital or a Physical Copy of the Code</b> until your charging session is completed.
            </div>
            <button className="done-btn" onClick={handleDone}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleStartCharging} className="booking-form">
            <div className="form-group">
              <label htmlFor="vehicleNumber">Vehicle Number <b>(Number Plate)</b> </label>
              <input
                type="text"
                id="vehicleNumber"
                value={bookingData.vehicleNumber}
                onChange={e => setBookingData({ ...bookingData, vehicleNumber: e.target.value })}
                required
                placeholder="Enter your vehicle number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="chargerType">Charger Type</label>
              <select
                id="chargerType"
                value={bookingData.chargerType}
                onChange={(e) => setBookingData({ ...bookingData, chargerType: e.target.value })}
                required
              >
                {station.chargerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <select
                id="duration"
                value={bookingData.duration}
                onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                required
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredDate">Preferred Date</label>
              <input
                type="date"
                id="preferredDate"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">Preferred Time</label>
              <input
                type="time"
                id="preferredTime"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                required
              />
            </div>

            <div className="cancellation-policy">
              <strong>Cancellation Policy:</strong><br />
              If you wish to <b>cancel</b> your booking, please do so at least <b>24 hours</b> in advance.<br />
              To cancel, kindly send us an <a href="mailto:support@evcharge.com" target="_blank" rel="noopener noreferrer" className="green-link">Email</a> or submit a <a href="/contact" className="green-link">Feedback</a> request at least <b>24 hours</b> before your scheduled time.
            </div>

            {bookingError && <div className="error-message">{bookingError}</div>}

            <button 
              type="submit" 
              className="start-charging-btn"
              disabled={station.availableChargers === 0}
            >
              {station.availableChargers > 0 ? 'Start Charging' : 'No Chargers Available'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Booking;