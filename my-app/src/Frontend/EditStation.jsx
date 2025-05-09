import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Admin.css';

const EditStation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    totalChargers: 0,
    availableChargers: 0,
    pricing: 0.0,
    chargerTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStation();
  }, [id]);

  const fetchStation = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch station');
      }
      const data = await response.json();
      setStation(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(station)
      });

      if (!response.ok) {
        throw new Error('Failed to update station');
      }

      alert('Station updated successfully');
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading station data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/admin')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="edit-form-container">
        <h1>Edit Station</h1>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Station Name</label>
            <input
              type="text"
              value={station.name}
              onChange={(e) => setStation({ ...station, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={station.location}
              onChange={(e) => setStation({ ...station, location: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              value={station.latitude}
              onChange={(e) => setStation({ ...station, latitude: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              value={station.longitude}
              onChange={(e) => setStation({ ...station, longitude: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Chargers</label>
            <input
              type="number"
              min="0"
              value={station.totalChargers}
              onChange={(e) => setStation({ ...station, totalChargers: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Available Chargers</label>
            <input
              type="number"
              min="0"
              max={station.totalChargers}
              value={station.availableChargers}
              onChange={(e) => setStation({ ...station, availableChargers: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Price per Hour ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={station.pricing}
              onChange={(e) => setStation({ ...station, pricing: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Charger Types</label>
            <select
              multiple
              value={station.chargerTypes}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setStation({ ...station, chargerTypes: options });
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
          <div className="form-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/admin')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStation; 