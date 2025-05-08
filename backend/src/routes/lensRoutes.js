const express = require('express');
const lensController = require('../controllers/lensController');

const router = express.Router();

// GET follower statistics for a Lens handle
router.get('/followers/:handle', lensController.getFollowerStats);

router.get('/getMintableCheck/:handle', lensController.getMintableCheck);

router.get('/mintMemeCoins/:handle', lensController.mintMemeCoins);



module.exports = router; 