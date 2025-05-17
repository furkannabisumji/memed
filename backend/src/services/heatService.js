const { factory_contract } = require('../config/factory');
const Token = require('../models/Token');
const lensService = require('./lensService');
const factoryAddress = require('../config/config.json').factory;

const HEAT_PER_ENGAGEMENT = 1;

/**
 * Update heat score for multiple memes based on engagement
 * @param {Token[]} tokens - The tokens to update
 * @param {boolean} update - Whether to update the database
 * @returns {Promise<HeatUpdate[]>} - Array of heat updates that were applied
 */
async function updateHeatFromEngagement(tokens, update = false) {
  try {
    if (!tokens || tokens.length === 0) {
      return [];
    }

    const heatUpdates = [];
    
    // Process all tokens in parallel for better performance
    const engagementPromises = tokens.map(async (token) => {
      const { handle, tokenAddress } = token;
      
      // Get new engagement metrics
      const newEngagement = await lensService.getEngagementMetrics(handle, update);
      
      // Calculate heat from engagement
      const heat = newEngagement * HEAT_PER_ENGAGEMENT;
      
      // Only add to updates if there's actual heat to add
      if (heat > 0) {
        heatUpdates.push({
          token: tokenAddress,
          heat,
          minusHeat: false
        });
      }
    });

    // Wait for all engagement calculations to complete
    await Promise.all(engagementPromises);

    // Only make contract call if there are updates to apply
    if (heatUpdates.length > 0) {
      await factory_contract.updateHeat(heatUpdates);
      
      console.log('Heat updated for', heatUpdates.length, 'tokens', 'in factory contract : ', factoryAddress  );
    }

    return heatUpdates;
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