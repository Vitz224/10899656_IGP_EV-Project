import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../Frontend/Maps.css";

const EVChargerLocator = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Sample data for charging stations
  const chargingStations = [
    {
      id: 1,
      name: "Green Energy Station",
      availability: "2/6",
      price: "Rs.1200/kWh"
    },
    {
      id: 2,
      name: "ChargePoint",
      availability: "2/4",
      price: "Rs.1350/kWh"
    },
    {
      id: 3,
      name: "ElectroGo",
      availability: "5/5",
      price: "Rs.1450/kWh"
    }
  ];

  return (
    <div className="ev-charger-app dark">
      <Navbar />
      
      <div className="container">
        <h1 className="app-title">EV Charger Locator</h1>
        
        {activeTab === "home" && (
          <div className="home-content">
            <h2 className="section-title">Charging Stations Nearby</h2>
            
            <div className="stations-list">
              {chargingStations.map(station => (
                <div key={station.id} className="station-card">
                  <h3 className="station-name">{station.name}</h3>
                  <p className="station-info">
                    <span className="label">Availability:</span> {station.availability}
                  </p>
                  <p className="station-info">
                    <span className="label">Price:</span> {station.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "map" && (
          <div className="map-content">
            <h2 className="section-title">Map with Charging Stations</h2>
            <div className="map-placeholder">
              {/* Map integration would go here */}
              <p>Map view will be displayed here</p>
            </div>
          </div>
        )}
        
        {activeTab === "details" && (
          <div className="details-content">
            <h2 className="section-title">Charging Station Details</h2>
            <p>Detailed information about selected charging station would appear here.</p>
          </div>
        )}
        
        <div className="bottom-navigation">
          <button 
            className={`nav-button ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button 
            className={`nav-button ${activeTab === "map" ? "active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            Map with Charging Stations
          </button>
          <button 
            className={`nav-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Charging Station Details
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EVChargerLocator; 