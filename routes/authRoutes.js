const express = require('express');
const router = express.Router();

// Import controller functions (to be created)
const { registerUser, loginUser } = require('../controllers/authController');

// Route to register a new user
router.post('/register', registerUser);

// Route to login an existing user
router.post('/login', loginUser);

module.exports = router;
