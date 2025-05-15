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
  airdrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Airdrop',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique claims per user per airdrop round
RewardSchema.index({ tokenAddress: 1, userAddress: 1, airdrop3e: 1 }, { unique: true });

module.exports = mongoose.model('Reward', RewardSchema); 