const mongoose = require('mongoose');

const engagementMetricsSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  metrics: {
    upvotes: {
      type: Number,
      default: 0
    },
    reposts: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    },
    collects: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    quotes: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const EngagementMetrics = mongoose.model('EngagementMetrics', engagementMetricsSchema);

module.exports = EngagementMetrics; 