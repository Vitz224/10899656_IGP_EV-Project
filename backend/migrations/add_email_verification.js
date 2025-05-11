const sequelize = require('../config/database');

async function up() {
  try {
    // First check if columns exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Users' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    const columns = results.map(r => r.COLUMN_NAME);

    // Add columns if they don't exist
    if (!columns.includes('emailVerificationToken')) {
      await sequelize.query(`
        ALTER TABLE Users
        ADD COLUMN emailVerificationToken VARCHAR(255) NULL
      `);
      console.log('Added emailVerificationToken column');
    }

    if (!columns.includes('emailVerified')) {
      await sequelize.query(`
        ALTER TABLE Users
        ADD COLUMN emailVerified BOOLEAN DEFAULT FALSE
      `);
      console.log('Added emailVerified column');
    }

    console.log('Email verification columns check completed');
  } catch (error) {
    console.error('Error adding email verification columns:', error);
    throw error;
  }
}

async function down() {
  try {
    // First check if columns exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Users' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    const columns = results.map(r => r.COLUMN_NAME);

    // Remove columns if they exist
    if (columns.includes('emailVerificationToken')) {
      await sequelize.query(`
        ALTER TABLE Users
        DROP COLUMN emailVerificationToken
      `);
      console.log('Removed emailVerificationToken column');
    }

    if (columns.includes('emailVerified')) {
      await sequelize.query(`
        ALTER TABLE Users
        DROP COLUMN emailVerified
      `);
      console.log('Removed emailVerified column');
    }

    console.log('Email verification columns removal completed');
  } catch (error) {
    console.error('Error removing email verification columns:', error);
    throw error;
  }
}

module.exports = { up, down }; 