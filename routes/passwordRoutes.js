const express = require('express');
const router = express.Router();
const {
  forgotPassword,
  resetPassword,

 } = require('../controllers/passwordResetController');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
