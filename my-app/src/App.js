import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./Frontend/Home";
//import AboutUs from "./Frontend/AboutUs";
import Booking from "./Frontend/Booking";
import Login from "./Frontend/Login";
import ContactUs from "./Frontend/ContactUs";
import Admin from "./Frontend/Admin";
import Payments from "./Frontend/Payments";
import Profile from "./Frontend/Profile";
import Signup from "./Frontend/Signup";
import Maps from "./Frontend/Maps";
//import Filter from "./Frontend/Filter";
import Station from "./Frontend/Station";
import BookingHistory from './Frontend/BookingHistory';
import BookingDetails from './Frontend/BookingDetails';
import EditUser from './Frontend/EditUser';
import EditStation from './Frontend/EditStation';
import VerifyEmail from './Frontend/VerifyEmail';
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
           
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/:stationId" element={<Booking />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="/booking/details/:bookingId" element={<BookingDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/map" element={<Maps />} />
            <Route path="/station" element={<Station />} />
            <Route path="/edit-user/:id" element={<EditUser />} />
            <Route path="/edit-station/:id" element={<EditStation />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;