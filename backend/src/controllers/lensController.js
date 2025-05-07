const lensService = require('../services/lensService');

/**
 * Get follower statistics for a Lens handle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFollowerStats = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const result = await lensService.getFollowerStats(handle);
    res.json(result);
  } catch (error) {
    console.error('Error fetching followers:', error);
    if (error.message === 'Account not found') {
      return res.status(404).json({ error: 'Account not found' });
    }
    next(error);
  }
};

module.exports = {
  getFollowerStats
}; 