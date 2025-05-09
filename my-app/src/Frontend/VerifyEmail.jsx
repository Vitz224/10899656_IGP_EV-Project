import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Frontend/VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now login.');
        } else {
          setStatus('error');
          setMessage(data.msg || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <h1>Email Verification</h1>
        <div className={`status-message ${status}`}>
          {status === 'verifying' && (
            <div className="loading-spinner"></div>
          )}
          <p>{message}</p>
        </div>
        {status !== 'verifying' && (
          <button 
            className="action-button"
            onClick={() => navigate('/login')}
          >
            {status === 'success' ? 'Go to Login' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 