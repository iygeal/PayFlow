const express = require('express');
const router = express.Router();

const authorize = require('../middleware/authMiddleware');
const { fundWallet } = require('../controllers/walletController');

router.post('/fund', authorize, fundWallet);

module.exports = router;
