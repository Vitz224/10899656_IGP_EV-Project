const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, updateUser, deleteUser, getUserById, verifyEmail, getUserByEmail } = require('../controllers/userController');

// All routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/email/:email', getUserByEmail);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/verify-email/:token', verifyEmail);

module.exports = router; 