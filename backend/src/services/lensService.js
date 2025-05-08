const { fetchAccount, fetchAccountGraphStats } = require("@lens-protocol/client/actions");
const { evmAddress } = require('@lens-protocol/client');
const client = require('../config/lens');

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
  return account.address;
} 

module.exports = {
  getFollowerStats,
  getHandleOwner
}; 