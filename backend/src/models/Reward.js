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
    required: false,
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
  airdropIndex: {
    type: Number,
    required: true,
    default: 0
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

// Compound index to ensure unique claims per user per airdrop round
RewardSchema.index({ tokenAddress: 1, userAddress: 1, airdropIndex: 1 }, { unique: true });

module.exports = mongoose.model('Reward', RewardSchema); 