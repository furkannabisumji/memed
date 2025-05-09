const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    index: true
  },
  tokenAddress: {
    type: String,
    required: true,
    index: true
  },
  userAddress: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: String, // Store as string to handle large numbers
    required: true
  },
  type: {
    type: String,
    enum: ['initial', 'engagement'],
    required: true
  },
  claimed: {
    type: Boolean,
    default: false
  },
  claimTransactionHash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reward', RewardSchema); 