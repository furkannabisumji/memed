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
  name: {
    type: String,
    required: true
  },
  ticker: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  followers: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastRewardDistribution: {
    type: Date,
    default: Date.now
  },
  totalDistributed: {
    type: String,
    default: "0"
  },
  likesCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Token', TokenSchema); 