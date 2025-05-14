const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

// Get all tokens with pagination
router.get('/tokens', tokenController.getAllTokens);

// Get token by lens username
router.get('/tokens/:handle', tokenController.getTokenByHandle);

module.exports = router; 