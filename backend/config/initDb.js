const sequelize = require('./database');
const User = require('../models/User');
const Station = require('../models/Station');
const Booking = require('../models/Booking');

// Function to initialize database
const initDatabase = async () => {
  try {
    // Define associations
    User.hasMany(Booking, { foreignKey: 'userId' });
    Booking.belongsTo(User, { foreignKey: 'userId' });

    Station.hasMany(Booking, { foreignKey: 'stationId' });
    Booking.belongsTo(Station, { foreignKey: 'stationId' });

    // Sync all models with database - force: false means no table modifications
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');

    // Check if admin user exists
    const adminExists = await User.findOne({ where: { email: 'admin@chargeev.com' } });
    if (!adminExists) {
      // Create admin user only if it doesn't exist
    await User.create({
      name: 'Admin User',
      email: 'admin@chargeev.com',
      password: 'admin123',
      isAdmin: true
    });
    console.log('Admin user created');
    }

    // Check if sample stations exist
    const stationCount = await Station.count();
    if (stationCount === 0) {
      // Create sample stations only if none exist
    await Station.bulkCreate([
      {
        name: 'Downtown Station',
        location: '123 Main St',
        latitude: 40.7128,
        longitude: -74.0060,
        totalChargers: 4,
        availableChargers: 4,
        pricePerHour: 5.00,
        chargerTypes: ['Type 2', 'CCS', 'CHAdeMO']
      },
      {
        name: 'Uptown Station',
        location: '456 Park Ave',
        latitude: 40.7589,
        longitude: -73.9851,
        totalChargers: 6,
        availableChargers: 6,
        pricePerHour: 6.00,
        chargerTypes: ['Type 2', 'CCS']
      }
    ]);
    console.log('Sample stations created');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Export the function instead of running it immediately
module.exports = initDatabase; 