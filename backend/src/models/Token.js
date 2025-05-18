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
  createdAt: {
    type: Date,
    default: Date.now
  },
  likesCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Token', TokenSchema); 