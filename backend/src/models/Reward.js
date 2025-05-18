const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
  },
  tokenAddress: {
    type: String,
    required: true,
  },
  userAddress: {
    type: String,
    required: true,
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
  proof: {
    type: [String],
    required: true
  },
  claimed: {
    type: Boolean,
    default: false
  },
  transactionHash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique claims per user per airdrop round

module.exports = mongoose.model('Reward', RewardSchema); 