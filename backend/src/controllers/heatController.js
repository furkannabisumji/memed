const heatService = require('../services/heatService');

/**
 * Get heat score for a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getHeatScore = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const heatScore = await heatService.getHeatScore(handle);
    res.json({ heatScore });
  } catch (error) {
    console.error('Error getting heat score:', error);
    next(error);
  }
};

module.exports = {
  getHeatScore,
}; 