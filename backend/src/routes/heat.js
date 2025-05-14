const express = require('express');
const router = express.Router();
const heatController = require('../controllers/heatController');

// Get heat score for a meme
router.get('/:handle', heatController.getHeatScore);

// Update heat score from battle win
router.post('/:handle/battle-win', heatController.updateHeatFromBattleWin);

// Update heat score from staking
router.post('/:handle/staking', heatController.updateHeatFromStaking);

module.exports = router; 