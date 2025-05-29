/**
 * This file combines all the routes into one
 * It provides a single entry point for the app's routes
 */


// Import express and create a router object
const express = require('express');
const router = express.Router();

// Mount all the routes
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/wallets', require('./walletRoutes'));

module.exports = router;
