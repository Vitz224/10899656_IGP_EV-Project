import React, { useState, useEffect } from "react";
// import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../Frontend/Admin.css";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, stationsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations`)
      ]);

      if (!usersResponse.ok || !stationsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const usersData = await usersResponse.json();
      const stationsData = await stationsResponse.json();

      setUsers(usersData);
      setStations(stationsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="admin-dashboard">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
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
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'users' ? (
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
                      <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
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
        ) : (
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
                    <td>${station.pricing}/hr</td>
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
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;