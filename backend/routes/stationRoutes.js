const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

// Get all stations
router.get('/', stationController.getAllStations);

// Get station by ID
router.get('/:id', stationController.getStationById);

// Add new station
router.post('/', stationController.addStation);

// Update station
router.put('/:id', stationController.updateStation);

// Delete station
router.delete('/:id', stationController.deleteStation);

module.exports = router; 