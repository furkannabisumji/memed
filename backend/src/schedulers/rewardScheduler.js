const cron = require('node-cron');
const { distributeEngagementRewards } = require('../controllers/lensController');

// Run every day at midnight
const dailyJob = cron.schedule('0 0 * * *', async () => {
  console.log('Running engagement rewards distribution...');
  try {
    await distributeEngagementRewards();
    console.log('Engagement rewards distribution completed successfully');
  } catch (error) {
    console.error('Error in engagement rewards distribution:', error);
  }
}, {
  scheduled: false
});

// Optional: Also check every hour during development
let devJob;
if (process.env.NODE_ENV === 'development') {
  devJob = cron.schedule('0 * * * *', async () => {
    console.log('Running development engagement rewards check...');
    try {
      await distributeEngagementRewards();
      console.log('Development engagement rewards check completed');
    } catch (error) {
      console.error('Error in development engagement rewards check:', error);
    }
  }, {
    scheduled: false
  });
}

module.exports = {
  start: () => {
    dailyJob.start();
    if (devJob) devJob.start();
    console.log('Reward schedulers started');
  },
  stop: () => {
    dailyJob.stop();
    if (devJob) devJob.stop();
    console.log('Reward schedulers stopped');
  }
}; 