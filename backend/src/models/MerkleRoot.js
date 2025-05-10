const mongoose = require('mongoose');

const MerkleRootSchema = new mongoose.Schema({
  root: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deployed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('MerkleRoot', MerkleRootSchema); 