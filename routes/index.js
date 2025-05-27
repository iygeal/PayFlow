/**
 * This file combines all the routes into one
 * It provides a single entry point for the app's routes
 */


// Import express and create a router object
const express = require('express');
const router = express.Router();

// Mount all the routes
router.use('/auth', require('./userRoutes'));
router.use('/transaction', require('./transactionRoutes'));
router.use('/wallet', require('./walletRoutes'));
router.use('/password', require('./passwordRoutes'));

module.exports = router;
