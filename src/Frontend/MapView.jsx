import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import '../Frontend/MapView.css';

const MapView = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 64px)'
  };

  const center = {
    lat: 51.5074, // Default to London
    lng: -0.1278
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations/search`);
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setStations(data);
    } catch (err) {
      setError('Error loading stations. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  const handleBookNow = (stationId) => {
    navigate(`/booking/${stationId}`);
  };

  return (
    <div className="map-view">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading stations...</div>}
      
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        >
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={{
                lat: parseFloat(station.latitude),
                lng: parseFloat(station.longitude)
              }}
              onClick={() => handleMarkerClick(station)}
              icon={{
                url: station.availableChargers > 0 ? '/assets/images/Logo/available-marker.png' : '/assets/images/Logo/unavailable-marker.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          ))}

          {selectedStation && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedStation.latitude),
                lng: parseFloat(selectedStation.longitude)
              }}
              onCloseClick={() => setSelectedStation(null)}
            >
              <div className="info-window">
                <h3>{selectedStation.name}</h3>
                <p>{selectedStation.location}</p>
                <div className="station-details">
                  <p>Available Chargers: {selectedStation.availableChargers}/{selectedStation.totalChargers}</p>
                  <p>Price: ${selectedStation.pricing}/kWh</p>
                  <p>Charger Types: {selectedStation.chargerTypes.join(', ')}</p>
                </div>
                <button
                  className="book-btn"
                  onClick={() => handleBookNow(selectedStation.id)}
                  disabled={selectedStation.availableChargers === 0}
                >
                  {selectedStation.availableChargers > 0 ? 'Book Now' : 'No Chargers Available'}
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapView; 