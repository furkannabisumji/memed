const { fetchAccount, fetchAccountGraphStats, fetchPosts, fetchFollowers } = require("@lens-protocol/client/actions");
const { evmAddress } = require('@lens-protocol/client');
const ethers = require('ethers');
const client = require('../config/lens');
const { factory_contract } = require("../config/factory");

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
    console.log(followers.value.items[0]);
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

async function getFollowerWithTokenHoldings(tokenAddress) {
const holder = (await factory_contract.getTokens(tokenAddress))[0][7];
let holderWithLens = [];
for (const address of holder) {
    const { value: account } = await fetchAccount(client, {
        address: evmAddress(address)
    });
    if (account) {
        holderWithLens.push({
            address: account.address,
            handle: account.username
        });
    }
}
return holderWithLens;
}
/**
 * Get engagement metrics for a handle
 */
async function getEngagementMetrics(handle) {
  try {
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
    let engagement = [];
    for (const post of engagementMetrics.value.items) {
      if(post.stats){
        engagement.push({
            postId: post.id,
            engagement: post.stats
        })
      }
    }
    return engagement;
  } catch (error) {
    console.error(`Error fetching engagement metrics for ${handle}:`, error);
    throw error;
  }
}

module.exports = {
  getFollowerStats,
  getHandleOwner,
  getFollowers,
  getEngagementMetrics,
  getFollowerWithTokenHoldings
}; 