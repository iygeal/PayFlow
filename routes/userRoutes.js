const express = require('express');
const router = express.Router();

// Import middleware
const authorize = require('../middleware/authorization');

// Import controller functions
const { getUserProfile } = require('../controllers/userController');

// Route to get the profile of the logged-in user
router.get('/profile/:id', authorize, getUserProfile);

module.exports = router;
