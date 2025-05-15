const cron = require('node-cron');
const heatService = require('../services/heatService');
const Token = require('../models/Token');


/**
 * Update heat scores for all tokens
 */
async function updateAllHeatScores() {
  try {
    console.log('Starting heat score update...');
    
    // Get all tokens
    const tokens = await Token.find({});
    let updatedCount = 0;
    
    for (const token of tokens) {
      try {
        // Update heat from engagement
        await heatService.updateHeatFromEngagement(token.handle, true);
        
        updatedCount++;
      } catch (error) {
        console.error(`Error updating heat for ${token.handle}:`, error);
        // Continue with next token even if one fails
        continue;
      }
    }
    
    console.log(`Heat score update completed. Updated ${updatedCount} tokens.`);
    console.log(`Now sleeping for 3 minutes...`);
  } catch (error) {
    console.error('Error in heat score update:', error);
  }
}

/**
 * Start the heat scheduler
 */
function start() {
  // Run every 3 minutes
  cron.schedule('*/3 * * * *', async () => {
    console.log('Running heat score update scheduler...');
    await updateAllHeatScores();
  });
  
  console.log('Heat scheduler started');
}

module.exports = {
  start,
  updateAllHeatScores
}; 