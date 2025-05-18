const cron = require('node-cron');
const heatService = require('../services/heatService');
const Token = require('../models/Token');




/**
 * Update heat scores for all tokens
 */
async function updateAllHeatScores() {
  try {
    console.log('Starting heat score and engagement metrics update...');
    
    const tokens = await Token.find({});
        // Update heat from engagement
        await heatService.updateHeatFromEngagement(tokens, true);
  } catch (error) {
    console.error('Error in heat score and metrics update:', error);
  }
}

/**
 * Start the heat scheduler
 */
function start() {
  // Run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    console.log('Running heat score update scheduler...');
    await updateAllHeatScores();
  });
  
  console.log('Heat scheduler started');
}

module.exports = {
  start,
  updateAllHeatScores
}; 


