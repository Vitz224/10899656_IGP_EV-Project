import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../Frontend/Filter.css";

const Filter = () => {
  const [search, setSearch] = useState("");
  const [chargerType, setChargerType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  
  // Mock data for frontend display
  const [stations, setStations] = useState([
    {
      id: 1,
      name: "Premium Charging Hub",
      description: "Fast charging station with 24/7 availability",
      location: "Downtown",
      available: 4,
      total: 6,
      price_per_kwh: 15,
      image_url: "Logo\Maps.png"
    },
    {
      id: 2,
      name: "Eco Power Station",
      description: "Solar-powered charging point",
      location: "Green Valley",
      available: 2,
      total: 4,
      price_per_kwh: 12,
      image_url: "Logo\Maps.png"
    }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Frontend-only filtering
    const filtered = stations.filter(station => {
      return (
        station.name.toLowerCase().includes(search.toLowerCase()) &&
        (chargerType === "" || station.description.includes(chargerType)) &&
        (location === "" || station.location.includes(location))
      );
    });
    setStations(filtered);
  };

  return (
    <div className="filter-page dark">
      <Navbar />
      <div className="filter-container">
        <h2>Find a charging station and check availability</h2>
        <p>Select a station and view details</p>

        <form className="station-search" onSubmit={handleSearch}>
          <select 
            value={chargerType} 
            onChange={(e) => setChargerType(e.target.value)}
          >
            <option value="">Charger type</option>
            <option value="Fast">Fast</option>
            <option value="Rapid">Rapid</option>
            <option value="Solar">Solar</option>
            <option value="Public">Public</option>
            <option value="Eco">Eco</option>
            <option value="Tesla">Tesla</option>
          </select>
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-section">
          <div className="filter-sidebar">
            <input
              type="text"
              placeholder="Search location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-options">
              <label><input type="checkbox" /> Fast charging station</label>
              <label><input type="checkbox" /> Charging network</label>
              <label><input type="checkbox" /> Charging infrastructure</label>
              <label><input type="checkbox" /> Charging status</label>
              <label><input type="checkbox" /> Charging availability</label>
              <label><input type="checkbox" /> Charging speed</label>
              <label><input type="checkbox" /> Charging cost</label>
            </div>
          </div>

          <div className="station-results">
            <p>Displaying {stations.length} results</p>
            <div className="station-grid">
              {stations.map((station) => (
                <div key={station.id} className="station-card">
                  {station.image_url && (
                    <img 
                      src={station.image_url} 
                      alt={station.name} 
                      className="station-image"
                    />
                  )}
                  <h4>{station.name}</h4>
                  <p>{station.description}</p>
                  <p>Location: {station.location}</p>
                  <p>Availability: {station.available}/{station.total}</p>
                  <p>Price: Rs.{station.price_per_kwh}/kWh</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Filter;