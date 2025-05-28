const express = require('express');
const router = express.Router();

// Import middleware
const validateEmail = require('../middleware/validateEmail');

// Import controller functions
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require('../controllers/authController');

// Route to register a new user
router.post('/register', validateEmail, registerUser);

// Route to verify email
router.get('/verify-email/:token', verifyEmail);

// Route to login an existing user
router.post('/login', loginUser);

// Route to initiate password reset
router.post('/forgot-password', forgotPassword);

// Route to reset password
router.post('/reset-password/:token', resetPassword);

module.exports = router;
