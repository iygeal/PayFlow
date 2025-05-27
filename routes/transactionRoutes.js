// Import express and create a router
const express = require('express');
const router = express.Router();

// Import middleware and controller functions
const authorize = require('../middleware/authorization');
const {
  transferMoney,
  getUserTransactions,
} = require('../controllers/transactionController');

// Routes for transaction-related operations, protected by middleware
router.post('/transfer', authorize, transferMoney);
router.get('/history', authorize, getUserTransactions);

module.exports = router;
