// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();

const { authorize } = require('../middleware/authorization');
const {
  transferMoney,
  getUserTransactions,
} = require('../controllers/transactionController');

// Routes for transaction-related operations, protected by middleware
router.post('/transfer', authorize, transferMoney);
router.get('/history', authorize, getUserTransactions);

module.exports = router;
