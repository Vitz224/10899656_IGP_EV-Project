import React, { useState } from "react";
// import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import "../Frontend/About.css";
import "../Frontend/AboutUs.css";

const AboutUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "",
    feedback: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", formData);
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      rating: "",
      feedback: ""
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="about">
      {/* <Navbar /> */}
      <div className="about-hero">
        <div className="overlay">
          <h1>About Our EV Charging Finder</h1>
          <p>We aim to simplify EV charging by providing accurate station data.</p>
        </div>
        <div className="about-hero-art">
          <img src="Logo\EV1.png" alt="EV Art" />
        </div>
      </div>

      <div className="about-content">
        <div className="mission-section">
          <h2>Our Mission</h2>
          <p>
            EV Charge Finder was born out of the frustration of not being able to reliably find 
            available charging stations for electric vehicles. Our goal is to make EV ownership 
            more convenient by providing real-time data on charging station locations, availability, 
            and specifications.
          </p>
        </div>

        <div className="team-section">
          <h2>Our Team</h2>
          <p>
            We're a group of EV enthusiasts, developers, and sustainability advocates who believe 
            in making the transition to electric vehicles as smooth as possible for everyone.
          </p>
          <div className="team-art">
            <img src="Logo\EV2.png" alt="Team Art" />
          </div>
        </div>

        <div className="feedback-section">
          <h2>We'd Love Your Feedback</h2>
          {submitted ? (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>Thank you for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="rating">How would you rate our service?</label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select rating</option>
                  <option value="5">Excellent</option>
                  <option value="4">Very Good</option>
                  <option value="3">Good</option>
                  <option value="2">Fair</option>
                  <option value="1">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Your Feedback</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;