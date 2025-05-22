const express = require('express');
const router = express.Router();
const { transferMoney } = require('../controllers/transactionController');
const { authorize } = require('../middleware/authorization');

router.post('/transfer', authorize, transferMoney);

module.exports = router;
