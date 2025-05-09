const express = require('express');
const lensController = require('../controllers/lensController');

const router = express.Router();

// GET follower statistics for a Lens handle
router.get('/followers/:handle', lensController.getFollowerStats);

router.get('/getMintableCheck/:handle', lensController.getMintableCheck);

router.post('/mintMemeCoins/:handle', lensController.mintMemeCoins);

// New routes for rewards and claiming
router.get('/claims/:userAddress', lensController.generateClaimData);
router.post('/claims/record', lensController.recordClaim);

// Admin route to manually trigger engagement rewards distribution
router.post('/admin/distribute-rewards', async (req, res, next) => {
  try {
    const totalRewarded = await lensController.distributeEngagementRewards();
    res.status(200).json({ 
      message: 'Rewards distribution triggered successfully', 
      totalUsersRewarded: totalRewarded 
    });
  } catch (error) {
    console.error('Error triggering rewards distribution:', error);
    res.status(500).json({ error: 'Failed to distribute rewards' });
  }
});

module.exports = router; 