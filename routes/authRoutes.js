const express = require('express');
const router = express.Router();

// Import middleware
const validateEmail = require('../middleware/validateEmail');

// Import controller functions
const { registerUser, loginUser } = require('../controllers/authController');

// Route to register a new user
router.post('/register', validateEmail, registerUser);

// Route to login an existing user
router.post('/login', loginUser);

module.exports = router;
