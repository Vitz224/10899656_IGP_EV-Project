const Station = require('../models/Station');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all stations
const getAllStations = async (req, res) => {
  try {
    const stations = await Station.findAll();
    // Ensure chargerTypes is an array
    const formattedStations = stations.map(station => ({
      ...station.toJSON(),
      chargerTypes: Array.isArray(station.chargerTypes) ? station.chargerTypes : JSON.parse(station.chargerTypes || '[]')
    }));
    res.status(200).json(formattedStations);
  } catch (err) {
    console.error('Error fetching stations:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Search stations
const searchStations = async (req, res) => {
  try {
    const { location, available, chargerType } = req.query;
    let whereClause = {};

    if (location) {
      whereClause.location = {
        [Op.like]: `%${location}%`
      };
    }

    if (available === 'true') {
      whereClause.availableChargers = {
        [Op.gt]: 0
      };
    }

    if (chargerType) {
      whereClause.chargerTypes = {
        [Op.like]: `%${chargerType}%`
      };
    }

    const stations = await Station.findAll({
      where: whereClause
    });

    res.json(stations);
  } catch (error) {
    console.error('Error searching stations:', error);
    res.status(500).json({ message: 'Error searching stations' });
  }
};

// Get station by ID
const getStationById = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ msg: 'Station not found' });
    }
    // Ensure chargerTypes is an array
    const formattedStation = {
      ...station.toJSON(),
      chargerTypes: Array.isArray(station.chargerTypes) ? station.chargerTypes : JSON.parse(station.chargerTypes || '[]')
    };
    res.status(200).json(formattedStation);
  } catch (err) {
    console.error('Error fetching station:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get nearby stations
const getNearbyStations = async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  try {
    const stations = await Station.findAll({
      where: sequelize.literal(`ST_Distance_Sphere(
        location,
        POINT(${longitude}, ${latitude})
      ) <= ${radius * 1000}`)
    });
    res.json(stations);
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    res.status(500).json({ message: 'Error fetching nearby stations' });
  }
};

// Add new station (admin only)
const addStation = async (req, res) => {
  const { 
    name, 
    location, 
    latitude, 
    longitude,
    totalChargers, 
    availableChargers,
    pricing,
    chargerTypes
  } = req.body;

  try {
    console.log('Received station data:', req.body);
    
    const station = await Station.create({
      name,
      location,
      latitude,
      longitude,
      totalChargers,
      availableChargers,
      pricing,
      chargerTypes
    });
    
    console.log('Created station:', station);
    res.status(201).json(station);
  } catch (error) {
    console.error('Error adding station:', error);
    res.status(500).json({ 
      message: 'Error adding station',
      error: error.message,
      details: error.errors 
    });
  }
};

// Update station (admin only)
const updateStation = async (req, res) => {
  const { id } = req.params;
  try {
    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    await station.update(req.body);
    res.json(station);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ message: 'Error updating station' });
  }
};

// Delete station (admin only)
const deleteStation = async (req, res) => {
  const { id } = req.params;
  try {
    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    await station.destroy();
    res.json({ message: 'Station deleted' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Error deleting station' });
  }
};

module.exports = {
  getAllStations,
  searchStations,
  getStationById,
  getNearbyStations,
  addStation,
  updateStation,
  deleteStation
}; 