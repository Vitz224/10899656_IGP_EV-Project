const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailService');
const crypto = require('crypto');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token:', emailVerificationToken);

    // Create new user
    const user = await User.create({
      email,
      password,
      emailVerificationToken,
      emailVerified: false,
      isActive: false
    });

    console.log('Created user:', {
      id: user.id,
      email: user.email,
      token: user.emailVerificationToken
    });

    // Send welcome email with verification link
    await sendWelcomeEmail(email, null, emailVerificationToken);

    res.status(201).json({
      msg: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        msg: 'Validation error', 
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    console.log('Verification attempt with token:', token);

    // Find user by token
    const user = await User.findOne({ 
      where: { 
        emailVerificationToken: token
      }
    });

    console.log('User found:', user ? {
      id: user.id,
      email: user.email,
      verified: user.emailVerified
    } : 'No user found');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid verification token' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ msg: 'Email already verified. You can now login.' });
    }

    // Update user verification status but keep the token
    await user.update({
      emailVerified: true,
      isActive: true
    });

    console.log('Email verification successful for:', user.email);
    res.status(200).json({ msg: 'Email verified successfully. You can now login.' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({ msg: 'Please verify your email before logging in' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.status(200).json({
      msg: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user fields
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      msg: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'name', 'isAdmin', 'createdAt']
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'name', 'phone', 'role', 'isAdmin', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 