import React, { useState } from "react";
// import Navbar from "../components/Navbar";
//import Footer from "../components/Footer";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          message: ""
        });
        setTimeout(() => setIsSubmitted(false), 3000);
      } else {
        setError(data.message || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="contact-page dark">
      {/* <Navbar /> */}
      
      <div className="contact-container">
        <h1 className="page-title">Contact Us</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch With Our EV Team</h2>
            <p>Have questions or feedback? We'd love to hear from you!</p>
            <p>EV Charge Finder was born out of the frustration of not being able to reliably find 
            available charging stations for electric vehicles. Our goal is to make EV ownership 
            more convenient by providing real-time data on charging station locations, availability, 
            and specifications.</p>
            <p>I am RAVL Perera, the Developer of the "ChargeEV" Finder website. If you have any inquiries, feel free to get in touch!</p>
            <div className="contact-logo-row">
              <img src="EV.jpg" alt="EV Logo" className="contact-logo-round" />
              <img src="Pic.jpg" alt="EV Logo 2" className="contact-logo-round" />
            </div>
            
            <div className="contact-details contact-details-green contact-details-centered">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <a href="mailto:support@evcharge.com" className="contact-email-link">support@evcharge.com</a>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+94 773594567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>124/5A EV Street, Moratuwa, Sri Lanka</span>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Feedback</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name / Charging Code</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">
                Send Message
              </button>
              {isSubmitted && (
                <div className="success-message">
                  Thank you! Your Message Has Been Received.
                </div>
              )}
            </form>

            <div className="cancellation-policy-contact">
              <strong>Cancellation Policy:</strong><br />
              If you wish to cancel your booking, please do so at least 24 hours in advance.<br />
              To cancel, kindly send us an <a href="mailto:support@evcharge.com" target="_blank" rel="noopener noreferrer">Email</a> or submit a <b>Feedback</b> through here along with your <b>Charging Code</b> at least <b></b>24 hours before your scheduled time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;