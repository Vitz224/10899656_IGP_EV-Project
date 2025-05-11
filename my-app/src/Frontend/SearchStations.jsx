import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Frontend/SearchStations.css';

const SearchStations = () => {
  const [stations, setStations] = useState([]);
  const [searchParams, setSearchParams] = useState({
    location: '',
    chargerType: '',
    available: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const searchStations = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (searchParams.location) queryParams.append('location', searchParams.location);
      if (searchParams.chargerType) queryParams.append('chargerType', searchParams.chargerType);
      if (searchParams.available) queryParams.append('available', 'true');

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/stations/search?${queryParams}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }

      const data = await response.json();
      setStations(data);
    } catch (err) {
      setError('Error searching stations. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStations();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookNow = (stationId) => {
    navigate(`/booking/${stationId}`);
  };

  return (
    <div className="search-stations-container">
      <div className="search-form-container">
        <h2>Find Charging Stations</h2>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={searchParams.location}
              onChange={handleInputChange}
              placeholder="Enter location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="chargerType">Charger Type</label>
            <select
              id="chargerType"
              name="chargerType"
              value={searchParams.chargerType}
              onChange={handleInputChange}
            >
              <option value="">All Types</option>
              <option value="Type 2">Type 2</option>
              <option value="CCS">CCS</option>
              <option value="CHAdeMO">CHAdeMO</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="available"
                checked={searchParams.available}
                onChange={handleInputChange}
              />
              Show only available stations
            </label>
          </div>

          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search Stations'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stations-grid">
        {stations.map(station => (
          <div key={station.id} className="station-card">
            <h3>{station.name}</h3>
            <p className="location">{station.location}</p>
            <div className="station-details">
              <p>Available Chargers: {station.availableChargers}/{station.totalChargers}</p>
              <p>Price: ${station.pricing}/kWh</p>
              <p>Charger Types: {station.chargerTypes.join(', ')}</p>
            </div>
            <button
              className="book-button"
              onClick={() => handleBookNow(station.id)}
              disabled={station.availableChargers === 0}
            >
              {station.availableChargers > 0 ? 'Book Now' : 'No Chargers Available'}
            </button>
          </div>
        ))}
      </div>

      {stations.length === 0 && !loading && !error && (
        <div className="no-results">
          No stations found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
};

export default SearchStations; 