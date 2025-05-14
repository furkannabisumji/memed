const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

// Get all tokens with pagination
router.get('/tokens', tokenController.getAllTokens);

// Get token by token address
router.get('/tokens/:tokenAddress', tokenController.getTokenByAddress);

module.exports = router; 