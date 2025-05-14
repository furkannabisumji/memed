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

/**
 * Update heat score from engagement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateHeatFromEngagement = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const { update } = req.query;
    const heatFromEngagement = await heatService.updateHeatFromEngagement(handle, update === 'true');
    res.json({ heatFromEngagement });
  } catch (error) {
    console.error('Error updating heat from engagement:', error);
    next(error);
  }
};

/**
 * Update heat score from battle win
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateHeatFromBattleWin = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const heatFromBattleWin = await heatService.updateHeatFromBattleWin(handle);
    res.json({ heatFromBattleWin });
  } catch (error) {
    console.error('Error updating heat from battle win:', error);
    next(error);
  }
};

/**
 * Update heat score from staking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateHeatFromStaking = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const { amount } = req.body;
    const heatFromStaking = await heatService.updateHeatFromStaking(handle, amount);
    res.json({ heatFromStaking });
  } catch (error) {
    console.error('Error updating heat from staking:', error);
    next(error);
  }
};

module.exports = {
  getHeatScore,
  updateHeatFromEngagement,
  updateHeatFromBattleWin,
  updateHeatFromStaking
}; 