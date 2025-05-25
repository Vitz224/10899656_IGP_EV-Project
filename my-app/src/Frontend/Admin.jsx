import React, { useState, useEffect, useCallback, useMemo } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
import "../Frontend/Admin.css";
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // Add state for user location
  const [locationError, setLocationError] = useState(null); // Add state for location errors
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    totalChargers: 0,
    availableChargers: 0,
    pricing: 0.0,
    chargerTypes: []
  });
  const navigate = useNavigate();

  const center = useMemo(() => ({
    lat: 6.821329,
    lng: 80.041942
  }), []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geocoding'], // Specify libraries needed
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'users') {
        const usersResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`);
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);
        setStations([]); // Clear stations data when viewing users
        setBookings([]);
        console.log('Fetched users:', usersData);
      } else if (activeTab === 'stations') {
        const stationsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations`);
        if (!stationsResponse.ok) throw new Error('Failed to fetch stations');
        const stationsData = await stationsResponse.json();
        setStations(stationsData);
        setUsers([]); // Clear users data when viewing stations
        setBookings([]);
      } else if (activeTab === 'uploadStation') {
        // No data fetching needed for the upload form tab
        setUsers([]);
        setStations([]);
        setBookings([]);
        // Pre-fill coordinates if userLocation is available
        if (userLocation) {
          setNewStation(prev => ({
            ...prev,
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          }));
        }
      } else if (activeTab === 'bookings') {
        const bookingsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`);
        if (!bookingsResponse.ok) throw new Error('Failed To Fetch Bookings');
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        setUsers([]); // Clear users data
        setStations([]); // Clear stations data
      }

    } catch (err) {
      console.error('Fetch error:', err);
      // Attempt to get more specific error details if possible
      if (err.response) {
        console.error('Response status:', err.response.status);
        err.response.text().then(text => console.error('Response body:', text)).catch(console.error);
      } else if (err.message.includes('Failed to fetch')) {
         console.error('Network error or CORS issue. Check backend server status and network configuration.');
      }
      setError(`Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, userLocation]);

  // Effect to get user's current location
  useEffect(() => {
    if (navigator.geolocation && isLoaded) { // Only run if geolocation is available and script is loaded
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null); // Clear any previous errors
        },
        (error) => {
          console.error('Error getting admin location:', error);
          setLocationError('Unable to retrieve your location for station upload.');
          // Optionally set a default location if getting user location fails
          setUserLocation(center);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      // Optionally set a default location if geolocation is not supported
      setUserLocation(center);
    }
  }, [center, isLoaded]); // Add center and isLoaded as dependencies

  useEffect(() => {
    if (activeTab !== 'uploadStation') { // Only fetch data if not on the upload tab
      fetchData();
    }
  }, [activeTab, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations/${stationId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete station');
        }

        setStations(stations.filter(station => station.id !== stationId));
        alert('Station deleted successfully');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete booking');
        }

        setBookings(bookings.filter(booking => booking.id !== bookingId));
        alert('Booking deleted successfully');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleStationUpload = async (e) => {
    e.preventDefault();
    try {
      const lat = parseFloat(newStation.latitude);
      const lng = parseFloat(newStation.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Latitude and Longitude are required.');
      }

      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees');
      }

      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees');
      }

      const stationData = {
        name: newStation.name,
        location: newStation.location,
        latitude: lat,
        longitude: lng,
        totalChargers: parseInt(newStation.totalChargers) || 0,
        availableChargers: parseInt(newStation.totalChargers) || 0,
        pricing: parseFloat(newStation.pricing) || 0.0,
        chargerTypes: Array.isArray(newStation.chargerTypes) ? newStation.chargerTypes : []
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload station');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      alert('Station uploaded successfully!');
      // Reset form and switch back to stations tab
      setNewStation({
        name: '',
        location: '',
        latitude: userLocation ? userLocation.lat : '',
        longitude: userLocation ? userLocation.lng : '',
        totalChargers: 0,
        availableChargers: 0,
        pricing: 0.0,
        chargerTypes: []
      });
      setActiveTab('stations');
      fetchData(); // Refresh station list

    } catch (error) {
      console.error('Error uploading station:', error);
      alert(`Error uploading station: ${error.message}`);
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setNewStation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="logout-btn logout-btn-absolute" onClick={handleLogout}>
        Logout
      </button>
      <div className="admin-dashboard">
        <div className="admin-header-row">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-header">
          <div className="admin-tabs">
            <button 
              className={activeTab === 'users' ? 'active' : ''} 
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button 
              className={activeTab === 'stations' ? 'active' : ''} 
              onClick={() => setActiveTab('stations')}
            >
              Stations ({stations.length})
            </button>
            <button
              className={activeTab === 'uploadStation' ? 'active' : ''}
              onClick={() => setActiveTab('uploadStation')}
            >
              Upload Station
            </button>
            <button
              className={activeTab === 'bookings' ? 'active' : ''}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings ({bookings.length})
            </button>
          </div>
        </div>

        <div className="admin-content">
          {locationError && <div className="location-error">{locationError}</div>}

          {activeTab === 'users' && (
            <div className="table-container">
              <h2>User Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                          {(() => {
                            // Check for a 'role' property first, then fallback to isAdmin checks
                            const isAdmin = user.role === 'admin' || user.role === 'Admin' || user.isAdmin === true || user.isAdmin === 1 || user.isAdmin === '1' || user.isAdmin === 'true';
                            return (
                              <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                                {isAdmin ? 'Admin' : 'User'}
                              </span>
                            );
                          })()}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => navigate(`/edit-user/${user.id}`)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="table-container">
              <h2>Station Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Chargers</th>
                    <th>Price/Hour</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map(station => (
                    <tr key={station.id}>
                      <td>{station.id}</td>
                      <td>{station.name}</td>
                      <td>{station.location}</td>
                      <td>
                        <span className="charger-info">
                          {station.availableChargers}/{station.totalChargers}
                        </span>
                      </td>
                      <td>Rs.{station.pricing}/hr</td>
                      <td>
                        <span className={`status-badge ${station.availableChargers > 0 ? 'available' : 'full'}`}>
                          {station.availableChargers > 0 ? 'Available' : 'Full'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => navigate(`/edit-station/${station.id}`)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteStation(station.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'uploadStation' && (
            <div className="upload-tab">
              <h2>Upload New Station</h2>
              <div className="upload-container">
                <form onSubmit={handleStationUpload} className="upload-form">
                  <div className="form-group">
                    <label>Station Name</label>
                    <input
                      type="text"
                      value={newStation.name}
                      onChange={(e) => setNewStation(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location/Address</label>
                    <input
                      type="text"
                      value={newStation.location}
                      onChange={(e) => setNewStation(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={newStation.latitude}
                      onChange={handleCoordinateChange}
                      placeholder="Enter latitude (e.g., 6.9271)"
                      required
                      disabled={userLocation !== null} // Disable manual input if location is detected
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={newStation.longitude}
                      onChange={handleCoordinateChange}
                      placeholder="Enter longitude (e.g., 79.8612)"
                      required
                      disabled={userLocation !== null} // Disable manual input if location is detected
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Chargers</label>
                    <input
                      type="number"
                      min="0"
                      value={newStation.totalChargers}
                      onChange={(e) => setNewStation(prev => ({ ...prev, totalChargers: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price per Hour (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newStation.pricing}
                      onChange={(e) => setNewStation(prev => ({ ...prev, pricing: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Charger Types</label>
                    <select
                      multiple
                      value={newStation.chargerTypes}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setNewStation(prev => ({ ...prev, chargerTypes: options }));
                      }}
                      required
                    >
                      <option value="Type 1">Type 1</option>
                      <option value="Type 2">Type 2</option>
                      <option value="CCS">CCS</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                      <option value="Tesla">Tesla</option>
                    </select>
                  </div>
                  <button type="submit" className="upload-btn">Upload Station</button>
                </form>

                <div className="upload-map">
                  {loadError && <div>Error loading maps</div>}
                  {!isLoaded && <div>Loading Maps...</div>}
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{
                        width: '100%',
                        height: '400px'
                      }}
                      center={userLocation || center} // Use userLocation if available
                      zoom={13}
                      onClick={(e) => {
                        // Update coordinates when map is clicked in upload mode
                        if (activeTab === 'uploadStation') {
                          const lat = e.latLng.lat();
                          const lng = e.latLng.lng();
                          setNewStation(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                          }));
                        }
                      }}
                    >
                      {newStation.latitude && newStation.longitude && 
                       !isNaN(parseFloat(newStation.latitude)) && 
                       !isNaN(parseFloat(newStation.longitude)) && (
                        <Marker
                          position={{
                            lat: parseFloat(newStation.latitude),
                            lng: parseFloat(newStation.longitude),
                          }}
                        />
                      )}
                    </GoogleMap>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="table-container">
              <h2>Booking Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Station ID</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Charging Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.userId}</td>
                      <td>{booking.stationId}</td>
                      <td>{new Date(booking.startTime).toLocaleString()}</td>
                      <td>{new Date(booking.endTime).toLocaleString()}</td>
                      <td>{booking.chargingCode}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;