const express = require('express');
const router = express.Router();

// Import middleware
const validateEmail = require('../middleware/validateEmail');
const authorize = require('../middleware/authorization');

// Import controller functions
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/userController');

// Route to register a new user
router.post('/register', validateEmail, registerUser);

// Route to login an existing user
router.post('/login', loginUser);

// Route to get the profile of the logged-in user
router.get('/profile/:id', authorize, getUserProfile);

module.exports = router;
