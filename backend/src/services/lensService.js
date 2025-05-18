const { fetchAccount, fetchAccountGraphStats, fetchPosts, fetchFollowers } = require("@lens-protocol/client/actions");
const { evmAddress } = require('@lens-protocol/client');
const client = require('../config/lens');
const Token = require("../models/Token");
const Post = require("../models/Post");
const EngagementMetrics = require('../models/EngagementMetrics');

/**
 * Get account information and follower statistics for a Lens handle
 * @param {string} handle - The Lens handle
 * @returns {Promise<Object>} - Account graph statistics
 */
async function getFollowerStats(handle) {
  const { value: account } = await fetchAccount(client, {
    username: {
      localName: handle,
    }
  });
  
  if (!account) {
    throw new Error('Account not found');
  }
  
  const result = await fetchAccountGraphStats(client, {
    account: evmAddress(account.address),
  });
  
  return result;
}

async function getHandleOwner(handle) {  
  const { value: account } = await fetchAccount(client, {
    username: {
      localName: handle,
    }
  });
  console.log({account});
  return account.owner;
} 

/**
 * Get followers for a lens handle
 * This implementation will be improved to fetch actual followers
 */
async function getFollowers(handle) {
  try {
    const { value: account } = await fetchAccount(client, {
      username: {
        localName: handle,
      }
    });
    
    if (!account) {
      throw new Error('Account not found');
    }

    // In a production implementation, we would fetch actual followers
    const followers = await fetchFollowers(client, {
      account: evmAddress(account.address),
    });
    return followers.value.items;
    // For now, let's return 100 mock addresses for testing
    // return Array.from({ length: 100 }, () => {
    //   const randomWallet = ethers.Wallet.createRandom();
    //   return randomWallet.address;
    // });
  } catch (error) {
    console.error(`Error fetching followers for ${handle}:`, error);
    throw error;
  }
}

/**
 * mock stats
 */
function mockStats() {
  function randomInt() {
    return Math.floor(Math.random() * (100000 - 75000 + 1)) + 75000;
    
  }
    return {
        upvotes: randomInt(),
        reposts: randomInt(),
        bookmarks: randomInt(),
        collects: randomInt(),
        comments: randomInt(),
        quotes: randomInt()
      };
}
/**
 * Get engagement metrics for a handle
 */
async function getEngagementMetrics(handle, update) {
  try {
    const mock = false;
    const { value: account } = await fetchAccount(client, {
      username: {
        localName: handle,
      }
    });
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    const engagementMetrics = await fetchPosts(client, {
      filter: {
        authors: [evmAddress(account.address)]
      }
    });

    let engagements = [];
    for (const post of engagementMetrics.value.items) {
      if(post.stats){
        engagements.push({
            postId: post.id,
            stats: mock ? mockStats() : post.stats
        })
      }
    }

    const token = await Token.findOne({ handle });
    let newEngagement = 0;
    let hasNewEngagement = false;

    // Define which metrics to count
    const engagementMetricsToCount = [
      'upvotes',
      'reposts',
      'bookmarks',
      'collects',
      'comments',
      'quotes'
    ];

    // Initialize aggregated metrics
    const newMetrics = {
      upvotes: 0,
      reposts: 0,
      bookmarks: 0,
      collects: 0,
      comments: 0,
      quotes: 0
    };

    for (const engagement of engagements) {
      let post = await Post.findOne({ postId: engagement.postId });
      
      if (!post) {
        // For new posts, count the initial engagement
        let initialEngagement = 0;
        for (const metric of engagementMetricsToCount) {
          initialEngagement += engagement.stats[metric] || 0;
        }
        newEngagement += initialEngagement;
        hasNewEngagement = true;

        // Store the post
        post = new Post({
          token: token._id,
          postId: engagement.postId,
          engagement: engagement.stats
        });
        await post.save();
      } else {
        // Calculate engagement difference for existing posts
        for (const metric of engagementMetricsToCount) {
          const currentValue = engagement.stats[metric] || 0;
          const storedValue = post.engagement[metric] || 0;
          
          if (currentValue > storedValue) {
            newEngagement += currentValue - storedValue;
            hasNewEngagement = true;
          }
        }

        // Update stored engagement if requested
        if (update) {
          await Post.updateOne(
            { postId: engagement.postId },
            { $set: { engagement: engagement.stats } }
          );
        }
      }
    }

    // Only update metrics if there is new engagement
    if (hasNewEngagement) {
      // Get existing metrics
      const existingMetrics = await EngagementMetrics.findOne({ handle: handle });
      const currentMetrics = existingMetrics ? existingMetrics.metrics : newMetrics;

      // Update only the metrics that have changed
      for (const post of engagementMetrics.value.items) {
        if (post.stats) {
          for (const metric in newMetrics) {
            const newValue = post.stats[metric] || 0;
            const oldValue = currentMetrics[metric] || 0;
            if (newValue > oldValue) {
              currentMetrics[metric] = oldValue + (newValue - oldValue);
            }
          }
        }
      }

      await EngagementMetrics.findOneAndUpdate(
        { handle: handle },
        {
          $set: {
            metrics: currentMetrics,
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }

    return newEngagement;
  } catch (error) {
    console.error(`Error fetching engagement metrics for ${handle}:`, error);
    throw error;
  }
}

/**
 * Get aggregated engagement metrics for a handle
 */
async function getAggregatedEngagementMetrics(handle) {
  try {
    const metrics = await EngagementMetrics.findOne({ handle });
    return metrics;
  } catch (error) {
    console.error(`Error fetching aggregated engagement metrics for ${handle}:`, error);
    throw error;
  }
}

module.exports = {
  getFollowerStats,
  getHandleOwner,
  getFollowers,
  getEngagementMetrics,
  getAggregatedEngagementMetrics
}; 