import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Check for admin login
    if (email === 'admin@admin.com' && password === 'admin') {
      console.log('Admin login detected');
      // Store admin data in a single object
      const userData = {
        token: 'admin-token',
        email: email,
        isAdmin: true,
        id: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Admin data stored in localStorage:', userData);
      navigate('/admin');
      return;
    }

    // Regular user login
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Regular user login successful');
      // Store user data in a single object
      const userData = {
        token: data.token,
        email: email,
        isAdmin: false,
        id: data.user.id
      };
      localStorage.setItem('user', JSON.stringify(userData));
      // Dispatch custom event for login
      window.dispatchEvent(new Event('loginChange'));
      console.log('User data stored in localStorage:', userData);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <span role="img" aria-label="plug">🔌</span>
          </div>
          <h1>ChargeEV</h1>
        </div>
        <div className="login-content">
          <div className="login-art-top">
             <img src={process.env.PUBLIC_URL + "/MainLogo.png"} alt="Logo" className="main-logo" />
          </div>
          <div className="login-form-section">
            <h2>Log In</h2>
            <p className="subtitle">Start charging your EV now</p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleLogin} className="login-form">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                required
              />
              <label>Password</label>
              <div className="password-input">
                <input 
                  type="password" 
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  required
                />
                <span className="lock-icon" role="img" aria-label="lock">🔒</span>
              </div>
              <button type="submit" className="login-btn">Log in</button>
              <button type="button" className="signup-btn" onClick={() => navigate('/signup')}>Sign up</button>
            </form>
          </div>
          <div className="login-art-bottom">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;