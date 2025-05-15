const express = require('express');
const router = express.Router();
const heatController = require('../controllers/heatController');

// Get heat score for a meme
router.get('/:handle', heatController.getHeatScore);

module.exports = router; 