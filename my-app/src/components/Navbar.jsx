import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../components/Navbar.css';

const Navbar = () => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem('userEmail');
    console.log('Email from localStorage:', email);
    if (email) {
      setUserEmail(email);
      console.log('Setting userEmail state to:', email);
    }
  }, []);

  // Add a listener for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const email = localStorage.getItem('userEmail');
      console.log('Storage changed, new email:', email);
      setUserEmail(email);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    setUserEmail(null);
    navigate('/login');
  };

  console.log('Current userEmail state:', userEmail);

  return (
    <nav className="navbar minimal-navbar">
      <div className="navbar-left">
        <Link to="/" className="back-arrow" aria-label="Back to Home">
          <span style={{ fontSize: '2rem', color: '#fff', marginRight: '10px' }}>&larr;</span>
        </Link>
        <img src={process.env.PUBLIC_URL + "/MainLogo.png"} alt="Logo" className="main-logo" />
      </div>
      <div className="navbar-right">
        {userEmail ? (
          <div className="user-info">
            <span className="user-email">{userEmail}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="login-link" aria-label="Login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 