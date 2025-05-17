const cron = require('node-cron');
const { distributeRewards } = require('../controllers/lensController');


// Run every 3 minutes
const dailyJob = cron.schedule('* * * * *', async () => {

  console.log('Running engagement rewards distribution...');
  try {
    await distributeRewards();
    console.log('Engagement rewards distribution completed successfully');
  } catch (error) {
    console.error('Error in engagement rewards distribution:', error);
  }
}, {
  scheduled: false
});

module.exports = {
  start: () => {
    dailyJob.start();
    console.log('Reward schedulers started');
  },
  stop: () => {
    dailyJob.stop();
    console.log('Reward schedulers stopped');
  }
}; 