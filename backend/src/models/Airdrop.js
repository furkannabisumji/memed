const mongoose = require('mongoose');

const AirdropSchema = new mongoose.Schema({
  token: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true,
    index: true
  },
  index: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['initial', 'engagement'],
    required: true
  },
  merkleRoot: {
    type: String,
  },
  limit: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique airdrop rounds per token
AirdropSchema.index({ token: 1, index: 1 }, { unique: true });

module.exports = mongoose.model('Airdrop', AirdropSchema); 