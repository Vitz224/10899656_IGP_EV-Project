import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MapView from "./MapView";
import "../Frontend/Station.css";

const DiscoverStations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    cost: true,
    availability: true,
    charging: true,
    ev: false,
  });
  const [rating, setRating] = useState(0);
  const [distance, setDistance] = useState({
    basic: true,
    advanced: false,
    premium: true,
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const navigate = useNavigate();

  const searchStations = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('location', searchTerm);
      if (filters.availability) queryParams.append('available', 'true');
      if (filters.charging) queryParams.append('chargerType', 'Type 2');

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

  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleDistanceChange = (type) => {
    setDistance((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStations();
  };

  const handleBookNow = (stationId) => {
    navigate(`/booking/${stationId}`);
  };

  return (
    <div className="discover-page dark">
      <Navbar />
      <div className="content">
        <h1>Discover nearby charging stations</h1>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search stations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="view-tabs">
          <button
            className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            className={`tab-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
        </div>

        {viewMode === 'list' ? (
          <>
            <div className="popular-searches">
              <span className="section-title">Popular searches</span>
              <div className="tags">
                {["Costs", "Availability", "Charging Speeds", "EV Models", "Charging Network", "Charging Tips", "Station Reviews"].map((item) => (
                  <button key={item} className="tag-btn">{item}</button>
                ))}
              </div>
            </div>

            <div className="filters-section">
              <span className="section-title">Filters</span>
              <div className="checkboxes">
                {Object.keys(filters).map((key) => (
                  <label key={key} className="filter-label">
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={() => handleFilterChange(key)}
                      className="filter-checkbox"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>

              <div className="rating-section">
                <span className="section-title">Rating</span>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${rating >= star ? "filled" : ""}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="distance-filters">
                <span className="section-title">Distance</span>
                {Object.keys(distance).map((type) => (
                  <label key={type} className="distance-label">
                    <input
                      type="checkbox"
                      checked={distance[type]}
                      onChange={() => handleDistanceChange(type)}
                      className="distance-checkbox"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="recommendations">
              <span className="section-title">Recommended stations for you</span>
              <div className="station-cards">
                {stations.length > 0 ? (
                  stations.map((station) => (
                    <div className="station-card" key={station.id}>
                      <div className="card-image">
                        <img
                          src="/assets/images/Logo/Maps.png"
                          alt={station.name}
                        />
                      </div>
                      <div className="card-content">
                        <h4>{station.name}</h4>
                        <p>{station.location}</p>
                        <div className="station-details">
                          <p>Available Chargers: {station.availableChargers}/{station.totalChargers}</p>
                          <p>Price: ${station.pricing}/kWh</p>
                          <p>Charger Types: {station.chargerTypes.join(', ')}</p>
                        </div>
                        <button 
                          className="view-btn"
                          onClick={() => handleBookNow(station.id)}
                          disabled={station.availableChargers === 0}
                        >
                          {station.availableChargers > 0 ? 'Book Now' : 'No Chargers Available'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    No stations found. Try adjusting your search criteria.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <MapView stations={stations} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DiscoverStations;