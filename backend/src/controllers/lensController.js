const lensService = require('../services/lensService');
const merkleService = require('../services/merkleService');
const ethers = require('ethers');
const {factory_contract, wallet, airdrop_contract} = require('../config/factory');
const Token = require('../models/Token');
const Post = require('../models/Post');
const Reward = require('../models/Reward');

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
    const { name, ticker, description, image, message, signature, timestamp } = req.body;
    const { handle } = req.params;

    // 1. Check timestamp is recent (e.g., within 5 minutes)
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    // if (!timestamp || Math.abs(now - Number(timestamp)) > FIVE_MINUTES) {
    //   return res.status(400).json({ error: 'Timestamp is too old or invalid' });
    // }

    // 2. Verify the signature
    let recoveredAddress;
    // try {
    //   recoveredAddress = ethers.verifyMessage(message, signature);
    //   console.log({recoveredAddress});
    // } catch (err) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    // 3. Check that the message is in the expected format
    const expectedMessage = `Mint meme for handle: ${handle} at ${timestamp}`;
    console.log({expectedMessage});
    console.log({message});
    // if (message !== expectedMessage) {
    //   return res.status(400).json({ error: 'Invalid message format' });
    // }

    // 4. Check that the recovered address matches the Lens handle owner
    const handleOwner = await lensService.getHandleOwner(handle);
    // console.log({handleOwner});
    // if (recoveredAddress.toLowerCase() !== handleOwner.toLowerCase()) {
    //   return res.status(403).json({ error: 'Signature does not match handle owner' });
    // }

    // 5. Mintable check
    let checkTrue = await getMintableCheckFunction(req, res, next);
    if (checkTrue) {
      try {
        // Create the meme token
        const tx = await factory_contract.createMeme(handleOwner, handle, name, ticker, description, image);
        console.log({tx});
        // Wait for transaction receipt to get the token address
        const receipt = await tx.wait();

        
        // In a production scenario, we would extract the token address from the event
        // For now, simulate it
        let tokenAddress;
        try {
          // Try to find the TokenCreated event to get the token address
          const event = receipt.logs
            .filter(log => log.topics[0] === ethers.id("TokenCreated(address,address,string,string,string,string,string,uint256)"))
            .map(log => factory_contract.interface.parseLog(log))[0];
          
          tokenAddress = event.args.token;
        } catch (error) {
          console.error('Error parsing event logs:', error);
        }
        
        // Store token info
        await Token.findOneAndUpdate(
          { handle },
          { 
            handle,
            tokenAddress,
            lastRewardDistribution: Date.now(),
            totalDistributed: "0"
          },
          { upsert: true }
        );
        
        // After successful minting, distribute initial rewards to random followers
        // await distributeInitialRewards(handle, tokenAddress);
        
        return res.status(200).json({ 
          message: 'Meme created successfully and initial rewards distributed', 
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
 * Distribute initial rewards to random followers after token minting
 * @param {string} handle - Lens handle
 * @param {string} tokenAddress - Address of the token
 */
async function distributeInitialRewards(handle, tokenAddress) {
  try {
    console.log(`Distributing initial rewards for ${handle} with token ${tokenAddress}`);
    
    // 1. Get followers of the handle
    const followers = await lensService.getFollowers(handle);
    console.log({followers});
    
    // 2. Select 5000 random followers (or all if less than 5000)
    const followerCount = Math.min(followers.length, 5000);
    console.log({followerCount});

    if(followerCount >= process.env.MIN_FOLLOWERS_REQUIRED) {
      // Extract just the follower addresses
      const selectedFollowers = selectRandomFollowers(followers, followerCount)
        .map(follower => follower.follower.address); // Extract the address field
      console.log({selectedFollowers});

      // 3. Calculate token amount per follower (100 tokens each)
      const tokensPerFollower = ethers.parseUnits("100", 18).toString();
      console.log({tokensPerFollower});

      // 4. Get the latest airdrop index
      const airdropIndex = await merkleService.getLatestAirdropIndex(tokenAddress) + 1;
      console.log({airdropIndex});

      // 5. Create reward records in database
      const rewardPromises = selectedFollowers.map(followerAddress => 
        Reward.create({
          handle,
          tokenAddress,
          userAddress: followerAddress, // Now using the extracted address
          amount: tokensPerFollower,
          type: 'initial',
          airdropIndex,
          claimed: false
        })
      );
      
      await Promise.all(rewardPromises);
      
      // 6. Generate new Merkle tree and root
      const { root } = await merkleService.generateMerkleTree(tokenAddress, airdropIndex);
      
      // 7. Set the Merkle root on the contract
      try {
        const tx = await airdrop_contract.setMerkleRoot(tokenAddress, airdropIndex, root);
        await tx.wait();
        console.log(`Merkle root set for token ${tokenAddress} at index ${airdropIndex}`);
      } catch (error) {
        console.error('Error setting Merkle root on contract:', error);
        if (error.message.includes('Too soon to set')) {
          console.log('Previous airdrop was too recent, will retry later');
        } else {
          throw error;
        }
      }
      
      // 8. Update total distributed
      const totalDistributed = ethers.parseUnits(
        (selectedFollowers.length * 100).toString(), 
        18
      ).toString();
      
      await Token.findOneAndUpdate(
        { handle },
        { $set: { totalDistributed } }
      );
      
      console.log(`Initial rewards distributed to ${selectedFollowers.length} followers of ${handle}`);
      return selectedFollowers.length;
    } else {
      console.log(`Not enough followers for ${handle}, skipping initial rewards distribution`);
      return 0;
    }
  } catch (error) {
    console.error('Error distributing initial rewards:', error);
    throw error;
  }
}
/**
 * Distribute tokens based on engagement metrics
 * Called by scheduler or admin
 */
async function distributeEngagementRewards() {
  try {
    console.log('Starting engagement rewards distribution');
    
    // Get all tokens
    const tokens = await Token.find({lastRewardDistribution: {$lt: Date.now() - 24 * 60 * 60 * 1000}});
    let totalRewardedUsers = 0;
    
    for (const token of tokens) {
      const { handle, tokenAddress } = token;
      const newEngagement = await getEngagementMetrics(handle,true);
      console.log({newEngagement});
      
      // If 100,000+ engagements, distribute rewards to 5000 followers
      if (newEngagement >= 100000) {
        console.log(`${handle} has ${newEngagement} engagements - distributing rewards`);
        
        // Get followers
        const followers = await lensService.getFollowerWithTokenHoldings(tokenAddress);
        
        // Select up to 5000 followers
        const followerCount = Math.min(followers.length, 5000);
        const selectedFollowers = selectRandomFollowers(followers, followerCount);
        
        // Calculate tokens per follower (100 tokens each)
        const tokensPerFollower = ethers.parseUnits("100", 18).toString();
        
        // Create reward records
        const rewardPromises = selectedFollowers.map(follower => 
          Reward.create({
            handle: follower.handle ?? 'null',
            tokenAddress,
            userAddress: follower.address,
            amount: tokensPerFollower,
            type: 'engagement',
            claimed: false
          })
        );
        
        await Promise.all(rewardPromises);
        
        // Update token distribution info
        const newDistributed = ethers.parseUnits(
          (selectedFollowers.length * 100).toString(), 
          18
        );
        
        const currentDistributed = ethers.parseUnits(token.totalDistributed || "0", 0);
        const totalDistributed = (currentDistributed + newDistributed).toString();
        
        await Token.findByIdAndUpdate(token._id, {
          lastRewardDistribution: Date.now(),
          totalDistributed
        });
        
        totalRewardedUsers += selectedFollowers.length;
        console.log(`Distributed engagement rewards for ${handle}: ${selectedFollowers.length} followers rewarded`);
      } else {
        console.log(`${handle} has only ${newEngagement == 0 ? "no" : newEngagement} new engagements - no rewards`);
      }
    }
    
    // Update Merkle root after all distributions
    if (totalRewardedUsers > 0) {
      await merkleService.mockUpdateMerkleRoot();
    }
    
    console.log(`Engagement rewards distribution completed: ${totalRewardedUsers} total users rewarded`);
    return totalRewardedUsers;
  } catch (error) {
    console.error('Error distributing engagement rewards:', error);
    throw error;
  }
}
distributeEngagementRewards();

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
const generateClaimData = async (req, res, next) => {
  try {
    const userAddress = req.params.userAddress;
    console.log({userAddress});
    
    // Get all unclaimed rewards for the user
    const rewards = await Reward.find({ 
      userAddress, 
      claimed: false 
    });
    console.log({rewards});
    
    if (!rewards || rewards.length === 0) {
      return res.status(404).json({ error: 'No unclaimed rewards found' });
    }
    
    // Group rewards by token
    const rewardsByToken = {};
    
    for (const reward of rewards) {
      if (!rewardsByToken[reward.tokenAddress]) {
        rewardsByToken[reward.tokenAddress] = {
          tokenAddress: reward.tokenAddress,
          handle: reward.handle,
          airdropIndex: reward.airdropIndex,
          rewards: []
        };
      }
      rewardsByToken[reward.tokenAddress].rewards.push(reward);
    }
    
    // Generate Merkle proofs for each token
    const claims = [];
    for (const tokenData of Object.values(rewardsByToken)) {
      const { proof, leaf, amount } = await merkleService.generateProof(
        tokenData.tokenAddress,
        userAddress,
        tokenData.airdropIndex
      );
      
      if (proof.length > 0) {
        // Get the type from the first reward for this token
        const rewardType = tokenData.rewards[0].type;
        console.log({tokenData});
        
        claims.push({
          token: tokenData.tokenAddress,
          handle: tokenData.handle,
          amount: amount,
          proof,
          leaf,
          index: tokenData.airdropIndex,
          type: rewardType
        });
      }
    }
    
    return res.status(200).json({
      address: userAddress,
      proofs: claims,
      airdropContract: process.env.AIRDROP_CONTRACT_ADDRESS
    });
    
  } catch (error) {
    console.error('Error generating claim data:', error);
    next(error);
  }
};

/**
 * Record a claim as successful
 */
const recordClaim = async (req, res, next) => {
  try {
    const { userAddress, tokenAddress, amount, transactionHash } = req.body;
    
    // Validate required fields
    if (!userAddress || !tokenAddress || !amount || !transactionHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find rewards for this user/token
    const rewards = await Reward.find({
      userAddress,
      tokenAddress,
      claimed: false
    });
    
    if (!rewards || rewards.length === 0) {
      return res.status(404).json({ error: 'No matching unclaimed rewards found' });
    }
    
    // Mark as claimed
    await Reward.updateMany(
      {
        userAddress,
        tokenAddress,
        claimed: false
      },
      {
        $set: {
          claimed: true,
          claimTransactionHash: transactionHash
        }
      }
    );
    
    return res.status(200).json({
      message: 'Claim recorded successfully',
      userAddress,
      tokenAddress,
      amount,
      transactionHash
    });
    
  } catch (error) {
    console.error('Error recording claim:', error);
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
 * Add rewards for a specific user
 * @param {Object} req - Express request object with tokenAddress, userAddress, and amount
 * @param {Object} res - Express response object
 */
const addRewardsForUser = async (req, res, next) => {
  try {
    const { tokenAddress, userAddress, amount } = req.body;

    // Validate inputs
    if (!tokenAddress || !userAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the latest airdrop index for this token
    const airdropIndex = await merkleService.getLatestAirdropIndex(tokenAddress) + 1;

    // Create the new reward record
    const reward = await Reward.create({
      tokenAddress,
      userAddress,
      amount: ethers.parseUnits(amount.toString(), 18).toString(), // Convert to wei
      type: 'manual',
      airdropIndex,
      claimed: false
    });

    console.log('Created new reward:', reward);

    // Generate new Merkle tree and root
    const { root } = await merkleService.generateMerkleTree(tokenAddress, airdropIndex);
    
    // Update the root on the contract
    try {
      const tx = await airdrop_contract.setMerkleRoot(tokenAddress, airdropIndex, root);
      await tx.wait();
      console.log('Updated Merkle root on chain');

      return res.status(200).json({
        message: 'Rewards added successfully',
        reward,
        merkleRoot: root,
        transactionHash: tx.hash
      });
    } catch (error) {
      console.error('Error setting merkle root:', error);
      // Even if contract update fails, reward is still created
      return res.status(200).json({
        message: 'Reward created but merkle root update failed',
        reward,
        error: error.message
      });
    }

  } catch (error) {
    console.error('Error adding rewards:', error);
    next(error);
  }
};

module.exports = {
  getFollowerStats,
  getEngagementMetrics,
  getMintableCheck,
  mintMemeCoins,
  distributeEngagementRewards,
  generateClaimData,
  recordClaim,
  addRewardsForUser
}; 