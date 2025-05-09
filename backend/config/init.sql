-- Create the database
CREATE DATABASE IF NOT EXISTS ev_station;
USE ev_station;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Stations;
DROP TABLE IF EXISTS Users;

-- Create Users table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20) DEFAULT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Create Stations table
CREATE TABLE Stations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    totalChargers INT NOT NULL,
    availableChargers INT NOT NULL,
    chargerTypes JSON NOT NULL,
    pricing DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Create Bookings table
CREATE TABLE Bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    stationId INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    totalAmount DECIMAL(10, 2) NOT NULL,
    paymentStatus ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
    paymentIntentId VARCHAR(255) DEFAULT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (stationId) REFERENCES Stations(id)
);

-- Insert admin user (password is hashed version of 'admin123')
INSERT INTO Users (email, password, isAdmin, createdAt, updatedAt)
VALUES ('admin@chargeev.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX5Yx', true, NOW(), NOW());

-- Insert sample stations
INSERT INTO Stations (name, location, latitude, longitude, totalChargers, availableChargers, chargerTypes, pricing, status, createdAt, updatedAt)
VALUES 
('Downtown Charging Hub', '123 Main St, Downtown', 40.7128, -74.0060, 10, 8, '["Type 2", "CCS", "CHAdeMO"]', 0.45, 'active', NOW(), NOW()),
('Westside Station', '456 West Ave, Westside', 40.7589, -73.9851, 6, 4, '["Type 2", "CCS"]', 0.40, 'active', NOW(), NOW()); 