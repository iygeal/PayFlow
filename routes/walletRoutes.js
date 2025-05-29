const express = require('express');
const router = express.Router();

const authorize = require('../middleware/authMiddleware');
const {
  fundWallet,
  getWalletBalance,
} = require('../controllers/walletController');

router.post('/fund', authorize, fundWallet);
router.get('/balance', authorize, getWalletBalance);

module.exports = router;
