const cron = require('node-cron');
const heatService = require('../services/heatService');
const Token = require('../models/Token');
const EngagementMetrics = require('../models/EngagementMetrics');
const { client } = require('../config/factory');




/**
 * Update heat scores for all tokens
 */
async function updateAllHeatScores() {
  try {
    console.log('Starting heat score and engagement metrics update...');
    
    const tokens = await Token.find({});
    let updatedCount = 0;
    
    for (const token of tokens) {
      try {
        // Update heat from engagement
        await heatService.updateHeatFromEngagement(token.handle, true);
        
        // // Update engagement metrics
        // const { value: account } = await fetchAccount(client, {
        //   username: {
        //     localName: token.handle,
        //   }
        // });
        
        // if (account) {
        //   const engagementMetrics = await fetchPosts(client, {
        //     filter: {
        //       authors: [evmAddress(account.address)]
        //     }
        //   });

        // }
        
        updatedCount++;
      } catch (error) {
        console.error(`Error updating heat and metrics for ${token.handle}:`, error);
        continue;
      }
    }
    
    console.log(`Heat score and engagement metrics update completed. Updated ${updatedCount} tokens.`);
  } catch (error) {
    console.error('Error in heat score and metrics update:', error);
  }
}

/**
 * Start the heat scheduler
 */
function start() {
  // Run every 3 minutes
  cron.schedule('* * * * *', async () => {
    console.log('Running heat score update scheduler...');
    await updateAllHeatScores();
  });
  
  console.log('Heat scheduler started');
}

module.exports = {
  start,
  updateAllHeatScores
}; 


