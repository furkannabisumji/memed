const lensService = require('../services/lensService');
const merkleService = require('../services/merkleService');
const ethers = require('ethers');
const {factory_contract, airdrop_contract} = require('../config/factory');
const Token = require('../models/Token');
const Reward = require('../models/Reward');
const Airdrop = require('../models/Airdrop');

/**
 * Get follower statistics for a Lens handle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


async function getMintableCheckFunction(req, res, next) {
try {
  const { handle } = req.params;
  const result = await lensService.getFollowerStats(handle);

  if(result.value.followers > 50000) {
    return true;
  } else {
    return true;
  }
} catch (error) {
  console.error('Error fetching followers:', error);
  if (error.message === 'Account not found') {
    return res.status(404).json({ error: 'Account not found' });
  }
  next(error);
}
}

const getFollowerStats = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const result = await lensService.getFollowerStats(handle);
    res.json(result);
  } catch (error) {
    console.error('Error fetching followers:', error);
    if (error.message === 'Account not found') {
      return res.status(404).json({ error: 'Account not found' });
    }
    next(error);
  }
};


const getMintableCheck = async (req, res, next) => {
  getMintableCheckFunction(req, res, next);
 
};

const mintMemeCoins = async (req, res, next) => {
  try {
    const { name, ticker, description, image } = req.body;
    const { handle } = req.params;
    const handleOwner = await lensService.getHandleOwner(handle);
    
    let checkTrue = await getMintableCheckFunction(req, res, next);
    if (checkTrue) {
      try {
        const tx = await factory_contract.createMeme(handleOwner, handle, name, ticker, description, image);
        const receipt = await tx.wait();
        let tokenAddress;
        try {
          const event = receipt.logs
            .filter(log => log.topics[0] === ethers.id("TokenCreated(address,address,string,string,string,string,string,uint256)"))
            .map(log => factory_contract.interface.parseLog(log))[0];
          
          tokenAddress = event.args.token;
        } catch (error) {
          console.error('Error parsing event logs:', error);
        }
        
        await Token.findOneAndUpdate(
          { handle },
          { 
            handle,
            tokenAddress,
            name,
            ticker,
            description,
            image,
            creator: handleOwner,
          },
          { upsert: true }
        );
        return res.status(200).json({ 
          message: 'Meme created successfully', 
          tx: tx.hash,
          tokenAddress
        });
      } catch (error) {
        console.error('Error creating meme:', error);
        return res.status(500).json({ error: 'Failed to create meme' });
      }
    } else {
      return res.status(400).json({ error: 'Account not mintable' });
    }
  } catch (error) {
    console.error('Error in mintMemeCoins:', error);
    if (error.message === 'Account not found') {
      return res.status(404).json({ error: 'Account not found' });
    }
    next(error);
  }
};

/**
 * Distribute rewards to random followers after token minting or engagement
 */
async function distributeRewards() {
  try {

    const airdrops = await Airdrop.find({ processed: false }).populate('token');
    if (airdrops.length === 0) {

      console.log('No unprocessed airdrops found');
      return;
    }
    console.log(`Processing ${airdrops.length} unprocessed airdrops`);
    for (const airdrop of airdrops) {
    const { index, limit, maxAmount } = airdrop;
    const { handle, tokenAddress } = airdrop.token;

    console.log(`Distributing rewards for ${handle} with token ${tokenAddress}`);
    
    // 1. Get followers of the handle
    const followers = await lensService.getFollowers(handle);
    
    // 2. Select random followers (or all if less than limit)
    const followerCount = Math.min(followers.length, limit);

    if(followerCount >= process.env.MIN_FOLLOWERS_REQUIRED) {
      // Extract just the follower addresses
      const followerAddresses = followers.map(follower => follower.follower.address);

      // 3. Calculate token amount per follower (100 tokens each)
      const airdropPerFollower = Number(maxAmount) / followerCount;
      const tokensPerFollower = ethers.parseUnits(airdropPerFollower.toString(), 18).toString();
      let selectedFollowers = selectRandomFollowers(followerAddresses, followerCount)
        .map(follower => {
          return {
            address: follower,
            amount: tokensPerFollower
          }
        }); // Extract the address field
      
      
      // 6. Generate new Merkle tree and root
      const test = ['0x35134987bB541607Cd45e62Dd1feA4F587607817', '0xcE38F1143BB337A2fCE63821244baf6ace0d6690', '0x1d2bb8d37E9DC6fF504C4e01BF5f4B22f1f8a446','0x515EA178247a64C5DD8F42A43Ac44EFdd1205D72']
      for (const follower of test) {
        selectedFollowers.shift();
        selectedFollowers.push({
          address: follower,
          amount: tokensPerFollower
        })
      }
      const { root, rewardsWithProofs } = await merkleService.generateMerkleTree(tokenAddress, index, selectedFollowers);
      // 7. Set the Merkle root on the contract
      try {
     await airdrop_contract.setMerkleRoot(tokenAddress, root, index);
      
        for (const reward of rewardsWithProofs) {
          const newReward = new Reward({
            handle,
            tokenAddress,
            proof: reward.proof,
            userAddress: reward.address,
            amount: ethers.formatUnits(reward.amount, 18),
            airdrop: airdrop._id
          });
          await newReward.save();
          await Airdrop.findByIdAndUpdate(
            airdrop._id,
            { processed: true, merkleRoot: root }
          );
        } 
        console.log(`Merkle root set for token ${tokenAddress} at index ${index}`);
      } catch (error) {
        console.error('Error setting Merkle root on contract:', error);
        if (error.message.includes('Too soon to set')) {
          console.log('Previous airdrop was too recent, will retry later');
        } else {
          throw error;
        }
      }
      
      console.log(`Rewards distributed to ${selectedFollowers.length} followers of ${handle}`);
      return selectedFollowers.length;
    } else {
      console.log(`Not enough followers for ${handle}, skipping initial rewards distribution`);
      continue;
    }
    }
  } catch (error) {
    console.error('Error distributing initial rewards:', error);
    throw error;
  }
}

/**
 * Get engagement data since last update
 */
const getEngagementMetrics = async (req, res, next) => {
    try {
       const handle = req.params.handle;
       // Get engagement data since last update
       const newEngagement = await lensService.getEngagementMetrics(handle);
       return res.status(200).json({
         newEngagement
       });
    } catch (error) {
        console.error('Error fetching engagement metrics:', error);
        throw error;
    }
}

/**
 * Generate claim data for a user
 */
const rewardsForUser = async (req, res, next) => {
  try {
    const userAddress = req.params.userAddress;
    
    // Get all unclaimed rewards for the user
    const rewards = await Reward.find({ 
      userAddress, 
    }).populate('airdrop');
    
    return res.status(200).json({
      address: userAddress,
      rewards,
    });
    
  } catch (error) {
    console.error('Error generating claim data:', error);
    next(error);
  }
};

/**
 * Helper function to select random followers
 */
function selectRandomFollowers(followers, count) {
  if (followers.length <= count) return followers;
  
  const selected = [];
  const copied = [...followers];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * copied.length);
    selected.push(copied[randomIndex]);
    copied.splice(randomIndex, 1);
  }
  
  return selected;
}

/**
 * Get aggregated engagement metrics for a handle
 */
const getAggregatedEngagementMetrics = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const metrics = await lensService.getAggregatedEngagementMetrics(handle);
    console.log({metrics});

    if (!metrics) {
      return res.status(200).json({
        upvotes: 0,
        reposts: 0,
        bookmarks: 0,
        collects: 0,
        comments: 0,
        quotes: 0
      });
    }
    
    res.json(metrics.metrics);
  } catch (error) {
    console.error('Error fetching aggregated engagement metrics:', error);
    if (error.message === 'No engagement metrics found for this handle') {
      return res.status(404).json({ error: 'No engagement metrics found for this handle' });
    }
    next(error);
  }
};

module.exports = {
  getFollowerStats,
  getEngagementMetrics,
  getMintableCheck,
  mintMemeCoins,
  distributeRewards,
  rewardsForUser,
  getAggregatedEngagementMetrics
}; 