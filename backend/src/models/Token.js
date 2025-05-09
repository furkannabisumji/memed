const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tokenAddress: {
    type: String,
    required: true
  },
  lastRewardDistribution: {
    type: Date,
    default: Date.now
  },
  totalDistributed: {
    type: String,
    default: "0"
  }
});

module.exports = mongoose.model('Token', TokenSchema); 