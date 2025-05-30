const express = require('express');
const router = express.Router();

// Import middleware
const authorize = require('../middleware/authMiddleware');

// Import controller functions
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require('../controllers/userController');

// Route to get the profile of the logged-in user
router.get('/profile/:id', authorize, getUserProfile);

// Route to update the profile of the logged-in user
router.put('/profile/:id', authorize, updateUserProfile);

// Route to delete the logged-in user's account
router.delete('/profile/:id', authorize, deleteUserProfile);

module.exports = router;
