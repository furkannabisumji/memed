const mongoose = require('mongoose');

const AirdropSchema = new mongoose.Schema({
  tokenAddress: {
    type: String,
    required: true,
    index: true
  },
  index: {
    type: Number,
    required: true
  },
  merkleRoot: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique airdrop rounds per token
AirdropSchema.index({ tokenAddress: 1, index: 1 }, { unique: true });

module.exports = mongoose.model('Airdrop', AirdropSchema); 