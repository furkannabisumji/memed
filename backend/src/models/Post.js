const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        index: true
    },
    token: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token',
        required: true
    },
    engagement: {
        upvotes: {
            type: Number,
            default: 0
        },
        downvotes: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        },
        collects: {
            type: Number,
            default: 0
        },
        quotes: {
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
        tips: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);