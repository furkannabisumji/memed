const { factory_contract } = require('../config/factory');
const Token = require('../models/Token');
const Post = require('../models/Post');
const lensService = require('./lensService');

const HEAT_PER_ENGAGEMENT = 1;
const HEAT_PER_BATTLE_WIN = 20000;
const HEAT_PER_TOKEN = 1e16; // From MemedStaking contract

/**
 * Update heat score for a meme based on engagement
 * @param {string} handle - The Lens handle
 * @param {boolean} update - Whether to update the database
 * @returns {Promise<number>} - The new heat score
 */
async function updateHeatFromEngagement(handle, update = false) {
  try {
    const token = await Token.findOne({ handle });
    if (!token) {
      throw new Error('Token not found');
    }

    // Get new engagement metrics
    const newEngagement = await lensService.getEngagementMetrics(handle, update);
    
    // Calculate heat from engagement
    const heatFromEngagement = newEngagement * HEAT_PER_ENGAGEMENT;
    
    // Update heat on contract
    await factory_contract.updateHeat(token.tokenAddress, heatFromEngagement, false);
    
    return heatFromEngagement;
  } catch (error) {
    console.error('Error updating heat from engagement:', error);
    throw error;
  }
}

/**
 * Update heat score for a meme based on battle win
 * @param {string} handle - The Lens handle
 * @returns {Promise<number>} - The new heat score
 */
async function updateHeatFromBattleWin(handle) {
  try {
    const token = await Token.findOne({ handle });
    if (!token) {
      throw new Error('Token not found');
    }

    // Update heat on contract
    await factory_contract.updateHeat(token.tokenAddress, HEAT_PER_BATTLE_WIN, false);
    
    return HEAT_PER_BATTLE_WIN;
  } catch (error) {
    console.error('Error updating heat from battle win:', error);
    throw error;
  }
}

/**
 * Update heat score for a meme based on staking
 * @param {string} handle - The Lens handle
 * @param {number} amount - The amount of tokens staked
 * @returns {Promise<number>} - The new heat score
 */
async function updateHeatFromStaking(handle, amount) {
  try {
    const token = await Token.findOne({ handle });
    if (!token) {
      throw new Error('Token not found');
    }

    // Calculate heat from staking
    const heatFromStaking = amount * HEAT_PER_TOKEN;
    
    // Update heat on contract
    await factory_contract.updateHeat(token.tokenAddress, heatFromStaking, false);
    
    return heatFromStaking;
  } catch (error) {
    console.error('Error updating heat from staking:', error);
    throw error;
  }
}

/**
 * Get current heat score for a meme
 * @param {string} handle - The Lens handle
 * @returns {Promise<number>} - The current heat score
 */
async function getHeatScore(handle) {
  try {
    const token = await Token.findOne({ handle });
    if (!token) {
      throw new Error('Token not found');
    }

    // Get token data from contract
    const tokenData = await factory_contract.getTokens(token.tokenAddress);
    return tokenData[0].heat;
  } catch (error) {
    console.error('Error getting heat score:', error);
    throw error;
  }
}

module.exports = {
  updateHeatFromEngagement,
  updateHeatFromBattleWin,
  updateHeatFromStaking,
  getHeatScore
}; 