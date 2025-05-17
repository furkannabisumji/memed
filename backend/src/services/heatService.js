const { factory_contract } = require('../config/factory');
const Token = require('../models/Token');
const lensService = require('./lensService');

const HEAT_PER_ENGAGEMENT = 1;

/**
 * Update heat score for a meme based on engagement
 * @param {Token[]} tokens - The tokens to update
 * @param {boolean} update - Whether to update the database
 * @returns {Promise<number>} - The new heat score
 */
async function updateHeatFromEngagement(tokens, update = false) {
  try {
    const heatUpdates = [];
    
    for (const token of tokens) {
      const {handle, tokenAddress} = token;

    // Get new engagement metrics
    const newEngagement = await lensService.getEngagementMetrics(handle, update);
    
    // Calculate heat from engagement
    const heat = newEngagement * HEAT_PER_ENGAGEMENT;
    
    // Update heat on contract
    if(heat > 0){
      heatUpdates.push({
        token: tokenAddress,
        heat,
        minusHeat: false
      });
    }
  }
  if(heatUpdates.length > 0){ 
    await factory_contract.updateHeat(heatUpdates);
    return heatUpdates;
  }
  } catch (error) {
    console.error('Error updating heat from engagement:', error);
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
  getHeatScore
}; 