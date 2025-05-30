/**
 * This file combines all the routes into one
 * It provides a single entry point for the app's routes
 */

// Import express and create a router object
const express = require('express');
const router = express.Router();

// Root welcome route
router.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PayFlow API</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; }
          h1 { color: #4CAF50; }
        </style>
      </head>
      <body>
        <h1>Welcome to PayFlow API</h1>
        <p>This is the backend API service. For documentation or usage, please contact the developer.</p>
      </body>
    </html>
  `);
});

// Mount all the routes
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/wallets', require('./walletRoutes'));

module.exports = router;
