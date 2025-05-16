const express = require('express');
const router = express.Router();

// Import controller functions
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');

// Route to register a new user
router.post('/register', registerUser, getUserProfile);

// Route to login an existing user
router.post('/login', loginUser, getUserProfile);

module.exports = router;
