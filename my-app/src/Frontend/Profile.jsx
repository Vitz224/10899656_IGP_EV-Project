import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Navbar from "../components/Navbar";
//import Footer from "../components/Footer";
import "../Frontend/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.email) {
        setError('Please login to view your profile');
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/email/${storedUser.email}`, {
        headers: {
          'Authorization': `Bearer ${storedUser.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log('Fetched user data:', data);
      setUserData(data);

    } catch (err) {
      setError('Error loading profile data. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page dark">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page dark">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-card">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-details">
              <div className="detail-item">
                <label>Email</label>
                <span>{userData.email}</span>
              </div>
              <div className="detail-item">
                <label>Role</label>
                <span>{userData.role || 'Not set'}</span>
              </div>
              
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Profile;