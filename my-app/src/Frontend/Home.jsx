import React, { useState, useEffect, useCallback, useMemo } from "react";
// import Navbar from "../components/Navbar";
//import Footer from "../components/Footer";
import "../Frontend/Home.css";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Booking from './Booking';
import GeminiAssistant from "../components/GeminiAssistant";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Nearby");
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedMapStation, setSelectedMapStation] = useState(null);
  const [stations, setStations] = useState([]);
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
  const [bookingData, setBookingData] = useState({
    chargerType: "Type 2"
  });
  const [bookingError, setBookingError] = useState("");
  const [chargingCode, setChargingCode] = useState("");
  const [showChargingCode, setShowChargingCode] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showUserLocationInfo, setShowUserLocationInfo] = useState(false);
  const navigate = useNavigate();
  const [nearbyStations, setNearbyStations] = useState([]);
  const [otherStations, setOtherStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userAddress, setUserAddress] = useState('Fetching address...');

  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '500px'
  }), []);

  const center = useMemo(() => ({
    lat: 6.821329,
    lng: 80.041942
  }), []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geocoding'],
  });

  const notifications = [
    "You have 6 new charging spots",
    "New charging station opened",
    "Station under maintenance",
    "New user registered"
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setLocationError('Unable to retrieve your location.');
          setUserLocation(center);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setUserLocation(center);
    }
  }, [center]);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (userLocation && isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: userLocation }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            setUserAddress(results[0].formatted_address);
          } else {
            setUserAddress('No address found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
          setUserAddress('Could not retrieve address');
        }
      });
    } else {
      setUserAddress('Fetching address...');
    }
  }, [userLocation, isLoaded]);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations`);
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const stationsData = await response.json();
      console.log('Fetched stations:', stationsData);
      setStations(stationsData);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to calculate distance between two coordinates using Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  useEffect(() => {
    fetchStations();
  }, [userLocation, fetchStations]);

  // Effect to categorize stations when stations data or userLocation changes
  useEffect(() => {
    if (stations.length > 0 && userLocation) {
      const nearby = [];
      const others = [];
      const nearbyRadius = 5; // Define nearby radius in km

      stations.forEach(station => {
        const lat1 = userLocation.lat;
        const lon1 = userLocation.lng;
        const lat2 = parseFloat(station.latitude);
        const lon2 = parseFloat(station.longitude);

        // Check for valid station coordinates
        if (!isNaN(lat2) && !isNaN(lon2) && lat2 >= -90 && lat2 <= 90 && lon2 >= -180 && lon2 <= 180) {
          const dist = getDistance(lat1, lon1, lat2, lon2);
          if (dist <= nearbyRadius) {
            nearby.push({...station, distance: dist}); // Add distance to nearby stations
          } else {
            others.push({...station, distance: dist}); // Add distance to other stations
          }
        } else {
           console.log('Skipping station with invalid coordinates:', station);
        }
      });
      // Sort nearby stations by distance
      nearby.sort((a, b) => a.distance - b.distance);
      setNearbyStations(nearby);
      setOtherStations(others);
    } else {
      setNearbyStations([]);
      setOtherStations(stations); // If no user location, all stations are 'other'
    }
  }, [stations, userLocation]); // Re-categorize when stations or userLocation changes

  const handleMapClick = (event) => {
    if (activeTab === "Upload") {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      console.log('Map clicked - Setting coordinates:', { lat, lng });
      setNewStation(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setNewStation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStationUpload = async (e) => {
    e.preventDefault();
    try {
      const lat = parseFloat(newStation.latitude);
      const lng = parseFloat(newStation.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Please enter valid latitude and longitude coordinates');
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

      console.log('Sending station data:', stationData);

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
      setStations(prev => [...prev, data]);
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
      alert('Station uploaded successfully!');
    } catch (error) {
      console.error('Error uploading station:', error);
      alert(`Error uploading station: ${error.message}`);
    }
  };

  const handleStartCharging = async (station) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setChargingCode(code);
      setShowChargingCode(true);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: station.id,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
          chargerType: bookingData.chargerType,
          chargingCode: code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to start charging');
      }

      await response.json();
      alert('Charging session started successfully!');
    } catch (err) {
      setBookingError(err.message);
      setShowChargingCode(false);
    }
  };

  const handleBookingComplete = () => {
    fetchStations();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Charging":
        return (
          <div className="charging-tab">
            {selectedStation ? (
              <div className="booking-container">
                <h2>Start Charging at {selectedStation.name}</h2>
                <div className="station-details">
                  <p>Location: {selectedStation.location}</p>
                  <p>Available Chargers: {selectedStation.availableChargers}/{selectedStation.totalChargers}</p>
                  <p>Price: Rs.{selectedStation.pricing}/kWh</p>
                  <p>Charger Types: {selectedStation.chargerTypes.join(', ')}</p>
                </div>

                {showChargingCode ? (
                  <div className="charging-code-display">
                    <h3>Your EV Charging Code</h3>
                    <div className="code-box">{chargingCode}</div>
                    <p>Please use this <b>code</b> at the charging station to start your session.</p>
                    <button 
                      className="start-charging-btn"
                      onClick={() => {
                        setShowChargingCode(false);
                        setSelectedStation(null);
                        setBookingData({ chargerType: "Type 2" });
                        setBookingError("");
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleStartCharging(selectedStation);
                  }} className="booking-form">
                    <div className="form-group">
                      <label htmlFor="chargerType">Charger Type</label>
                      <select
                        id="chargerType"
                        name="chargerType"
                        value={bookingData.chargerType}
                        onChange={(e) => setBookingData({ ...bookingData, chargerType: e.target.value })}
                        required
                      >
                        {selectedStation.chargerTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {bookingError && <div className="error-message">{bookingError}</div>}

                    <button 
                      type="submit" 
                      className="start-charging-btn"
                      disabled={selectedStation.availableChargers === 0}
                    >
                      {selectedStation.availableChargers > 0 ? 'Start Charging' : 'No Chargers Available'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="no-station-selected">
                <h2>No Station Selected</h2>
                <p>Please select a station from the Map View or Nearby tab to start charging.</p>
              </div>
            )}
          </div>
        );
      case "Map View":
        console.log('Rendering Map View with stations:', stations);
        return (
          <div className="map-view-tab">
            {loadError && <div>Error loading maps</div>}
            {!isLoaded && <div>Loading Maps...</div>}
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation || center}
                zoom={13}
                onClick={handleMapClick}
              >
                {stations && stations.length > 0 ? (
                  stations.map(station => {
                    const lat = parseFloat(station.latitude);
                    const lng = parseFloat(station.longitude);
                    
                    if (!isNaN(lat) && !isNaN(lng) && 
                        lat >= -90 && lat <= 90 && 
                        lng >= -180 && lng <= 180) {
                      console.log('Rendering station:', station);
                      return (
                        <Marker
                          key={station.id}
                          position={{ lat, lng }}
                          onClick={() => setSelectedMapStation(station)}
                        />
                      );
                    } else {
                      console.log('Skipping invalid coordinates for station:', station);
                      return null;
                    }
                  })
                ) : (
                  console.log('No stations to display')
                )}
                {selectedMapStation && (
                  <InfoWindow
                    position={{ 
                      lat: parseFloat(selectedMapStation.latitude), 
                      lng: parseFloat(selectedMapStation.longitude) 
                    }}
                    onCloseClick={() => setSelectedMapStation(null)}
                  >
                    <div className="info-window">
                      <h3>{selectedMapStation.name}</h3>
                      <p>Location: {selectedMapStation.location}</p>
                      <p>Available Chargers: {selectedMapStation.availableChargers}/{selectedStation.totalChargers}</p>
                      <p>Price: Rs.{selectedMapStation.pricing}/hour</p>
                      <p>Charger Types: {selectedMapStation.chargerTypes.join(', ')}</p>
                      <button 
                        className="book-btn"
                        onClick={() => {
                          setSelectedStation(selectedMapStation);
                          setActiveTab("Charging");
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </InfoWindow>
                )}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{ // Optional: Customize icon for user location
                      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                    onClick={() => { // Toggle info window visibility on marker click
                      setShowUserLocationInfo(prev => !prev);
                    }}
                  />
                )}
                {showUserLocationInfo && userLocation && (
                  <InfoWindow
                    position={userLocation}
                    onCloseClick={() => setShowUserLocationInfo(false)}
                  >
                    <div className="info-window">
                      <h3>Your Location</h3>
                      <p>{userAddress}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        );
      case "Stations":
        return (
          <div className="nearby-tab">
            <h2>Stations</h2>
            {locationError && <p className="location-error">{locationError} Showing all stations.</p>}
            {!userLocation && !locationError && <p>Fetching your location to show nearby stations...</p>}

            {userLocation && nearbyStations.length > 0 && (
              <div className="nearby-stations-section">
                <h3>Nearby Stations ({nearbyStations.length})</h3>
                <div className="stations-list">
                  {nearbyStations.map(station => (
                    <div 
                      key={station.id} 
                      className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                      onClick={() => setSelectedStation(station)}
                    >
                      <h3>{station.name}</h3>
                      <div className="station-details">
                        <span>Location: {station.location}</span>
                        <span>Distance: {station.distance.toFixed(2)} km</span>
                        <span>Price: Rs.{station.pricing}/hour</span>
                        <span>Available: {station.availableChargers}/{station.totalChargers} chargers</span>
                        <span>Charger Types: {station.chargerTypes.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherStations.length > 0 && (
              <div className="other-stations-section">
                <h3>Other Stations ({otherStations.length})</h3>
                <div className="stations-list">
                  {otherStations.map(station => (
                    <div 
                      key={station.id} 
                      className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                      onClick={() => setSelectedStation(station)}
                    >
                      <h3>{station.name}</h3>
                       <div className="station-details">
                        <span>Location: {station.location}</span>
                         {userLocation && station.latitude && station.longitude && !isNaN(parseFloat(station.latitude)) && !isNaN(parseFloat(station.longitude)) && (
                            <span>Distance: {getDistance(userLocation.lat, userLocation.lng, parseFloat(station.latitude), parseFloat(station.longitude)).toFixed(2)} km</span>
                         )}
                        <span>Price: Rs.{station.pricing}/hour</span>
                        <span>Available: {station.availableChargers}/{station.totalChargers} chargers</span>
                        <span>Charger Types: {station.chargerTypes.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nearbyStations.length === 0 && otherStations.length === 0 && userLocation && !loading && (
               <p>No stations found.</p>
            )}
             {nearbyStations.length === 0 && otherStations.length === 0 && !userLocation && !loading && !locationError && (
               <p>Fetching stations...</p>
            )}
          </div>
        );
      case "Recent":
        navigate('/bookings');
        return null;
      case "Upload":
        return (
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
                <GoogleMap
                  mapContainerStyle={{
                    width: '100%',
                    height: '400px'
                  }}
                  center={userLocation || center}
                  zoom={13}
                  onClick={handleMapClick}
                >
                  {newStation.latitude && newStation.longitude && 
                   !isNaN(parseFloat(newStation.latitude)) && 
                   !isNaN(parseFloat(newStation.longitude)) && (
                    <Marker
                      position={{ 
                        lat: parseFloat(newStation.latitude), 
                        lng: parseFloat(newStation.longitude) 
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard dark">
      {/* <Navbar /> */}
      <div className="dashboard-container">
        <div className="sidebar">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setShowAssistant((prev) => !prev)}
              aria-label="Open EV Assistant"
            >
              <img
                src={"AI.png"}
                alt="Assistant"
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            </button>
            <p style={{ color: '#00e676', fontSize: '0.9rem', marginLeft: '10px' }}>Chat with our AI Assistant</p>
          </div>
          <h1>ChargeEV</h1>
          <ul className="nav-tabs">
            {["Charging", "Map View", "Stations", "Recent", "Upload"].map(tab => (
              <li 
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => {
                  if (tab === "Recent") {
                    navigate('/bookings');
                  } else {
                    setActiveTab(tab);
                  }
                }}
              >
                {tab}
              </li>
            ))}
          </ul>

          <div className="calendar">
            <h3>May 2025</h3>
            <div className="calendar-grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div key={`${day}-${index}`} className="day-header">{day}</div>
              ))}
              {(() => {
                const dates = [29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 27, 28, 29, 30, 1];
                const today = new Date();
                const isMay2025 = today.getFullYear() === 2025 && today.getMonth() === 4;
                return dates.map((date, index) => {
                  let highlight = false;
                  if (isMay2025 && date === today.getDate()) highlight = true;
                  if (!isMay2025 && date === 19) highlight = true;
                  return (
                    <div
                      key={`date-${index}`}
                      className={`date${highlight ? ' date-today' : ''}`}
                      onClick={() => setActiveTab('Stations')}
                    >
                      {date}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="notifications">
              <h3>Notifications</h3>
              <ul>
                {notifications.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="main-content">
          {userEmail && (
            <p style={{ color: '#00e676', fontSize: '1.1rem', marginBottom: '20px' }}>
              Welcome, {userEmail}, to the ChargeEV station finder application. We hope you have an amazing experience with us.
            </p>
          )}
          {selectedStation ? (
            <div className="station-details-view">
              <button className="back-btn" onClick={() => setSelectedStation(null)}>
                ← Back to list
              </button>
              <h2>Station Details</h2>
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Name</h4>
                  <p>{selectedStation.name}</p>
                </div>
                <div className="detail-section">
                  <h4>Location</h4>
                  <p>{selectedStation.location}</p>
                </div>
                <div className="detail-section">
                  <h4>Coordinates</h4>
                  <p>Latitude: {selectedStation.latitude}</p>
                  <p>Longitude: {selectedStation.longitude}</p>
                </div>
                <div className="detail-section">
                  <h4>Charging Status</h4>
                  <p>Available: {selectedStation.availableChargers}/{selectedStation.totalChargers} chargers</p>
                </div>
                <div className="detail-section">
                  <h4>Pricing</h4>
                  <p>Rs.{selectedStation.pricing}/hour</p>
                </div>
                <div className="detail-section">
                  <h4>Charger Types</h4>
                  <p>{selectedStation.chargerTypes.join(', ')}</p>
                </div>
                <div className="detail-section">
                  <h4>Station ID</h4>
                  <p>{selectedStation.id}</p>
                </div>
                <div className="detail-section">
                  <h4>Last Updated</h4>
                  <p>{new Date(selectedStation.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="action-buttons">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowBooking(true)}
                >
                  Start Charging
                </button>
              </div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {showBooking && selectedStation && (
          <Booking
            station={selectedStation}
            onClose={() => setShowBooking(false)}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </div>
      {showAssistant && <GeminiAssistant onClose={() => setShowAssistant(false)} />}
    </div>
  );
};

export default Dashboard;