import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../components/Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const checkLoginStatus = () => {
    const userData = localStorage.getItem('user');
    console.log('Navbar - Checking login status:', userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Navbar - User data found:', user);
        setIsLoggedIn(true);
        setUserEmail(user.email);
      } catch (error) {
        console.error('Navbar - Error parsing user data:', error);
        setIsLoggedIn(false);
        setUserEmail('');
      }
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
    }
  };

  useEffect(() => {
    // Initial check
    checkLoginStatus();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkLoginStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for login/logout
    const handleLoginChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('loginChange', handleLoginChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginChange', handleLoginChange);
    };
  }, []);

  const handleLogout = () => {
    console.log('Navbar - Logging out user');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserEmail('');
    setShowDropdown(false);
    // Dispatch custom event
    window.dispatchEvent(new Event('loginChange'));
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar minimal-navbar">
      <div className="navbar-left">
        <Link to="/" className="back-arrow" aria-label="Back to Home">
          <span style={{ fontSize: '2rem', color: '#fff', marginRight: '10px' }}>&larr;</span>
        </Link>
        <img src={process.env.PUBLIC_URL + "/MainLogo.png"} alt="Logo" className="main-logo" />
      </div>
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="user-menu">
            <button onClick={toggleDropdown} className="user-button">
              {userEmail}
              <span className="dropdown-arrow">▼</span>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
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
