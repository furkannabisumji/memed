const lensService = require('../services/lensService');
const merkleService = require('../services/merkleService');
const ethers = require('ethers');
const Token = require('../models/Token');
const Reward = require('../models/Reward');
/**
 * Get follower statistics for a Lens handle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const createMemeABI = require('../config/abi.json');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_LENS);
const wallet = new ethers.Wallet(process.env.ADMIN_PVT_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, createMemeABI, wallet);  


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
    if (!timestamp || Math.abs(now - Number(timestamp)) > FIVE_MINUTES) {
      return res.status(400).json({ error: 'Timestamp is too old or invalid' });
    }

    // 2. Verify the signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // 3. Check that the message is in the expected format
    const expectedMessage = `Mint meme for handle: ${handle} at ${timestamp}`;
    if (message !== expectedMessage) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // 4. Check that the recovered address matches the Lens handle owner
    const handleOwner = await lensService.getHandleOwner(handle);
    if (recoveredAddress.toLowerCase() !== handleOwner.toLowerCase()) {
      return res.status(403).json({ error: 'Signature does not match handle owner' });
    }

    // 5. Mintable check
    let checkTrue = await getMintableCheckFunction(req, res, next);
    if (checkTrue) {
      try {
        // Create the meme token
        const tx = await contract.createMeme(handle, name, ticker, description, image);
        
        // Wait for transaction receipt to get the token address
        const receipt = await tx.wait();
        
        // In a production scenario, we would extract the token address from the event
        // For now, simulate it
        let tokenAddress;
        try {
          // Try to find the TokenCreated event to get the token address
          const event = receipt.logs
            .filter(log => log.topics[0] === ethers.id("TokenCreated(address,address,string,string,string,string,string,uint256)"))
            .map(log => contract.interface.parseLog(log))[0];
          
          tokenAddress = event.args.token;
        } catch (error) {
          console.error('Error parsing event logs:', error);
          // Fallback to a mock address for development
          tokenAddress = ethers.hexlify(ethers.randomBytes(20));
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
        await distributeInitialRewards(handle, tokenAddress);
        
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
    
    // 2. Select 5000 random followers (or all if less than 5000)
    const followerCount = Math.min(followers.length, 5000);
    const selectedFollowers = selectRandomFollowers(followers, followerCount);
    
    // 3. Calculate token amount per follower (100 tokens each)
    const tokensPerFollower = ethers.parseUnits("100", 18).toString();
    
    // 4. Create reward records in database
    const rewardPromises = selectedFollowers.map(follower => 
      Reward.create({
        handle,
        tokenAddress,
        userAddress: follower,
        amount: tokensPerFollower,
        type: 'initial',
        claimed: false
      })
    );
    
    await Promise.all(rewardPromises);
    
    // 5. Update the Merkle tree root with new rewards
    await merkleService.mockUpdateMerkleRoot();
    
    // 6. Update total distributed
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
    const tokens = await Token.find();
    let totalRewardedUsers = 0;
    
    for (const token of tokens) {
      const { handle, tokenAddress, lastRewardDistribution } = token;
      
      // Get engagement data since last distribution
      const engagementData = await lensService.getEngagementMetrics(handle, lastRewardDistribution);
      
      // If 100,000+ engagements, distribute rewards to 5000 followers
      if (engagementData.totalEngagements >= 100000) {
        console.log(`${handle} has ${engagementData.totalEngagements} engagements - distributing rewards`);
        
        // Get followers
        const followers = await lensService.getFollowers(handle);
        
        // Select up to 5000 followers
        const followerCount = Math.min(followers.length, 5000);
        const selectedFollowers = selectRandomFollowers(followers, followerCount);
        
        // Calculate tokens per follower (100 tokens each)
        const tokensPerFollower = ethers.parseUnits("100", 18).toString();
        
        // Create reward records
        const rewardPromises = selectedFollowers.map(follower => 
          Reward.create({
            handle,
            tokenAddress,
            userAddress: follower,
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
        console.log(`${handle} has only ${engagementData.totalEngagements} engagements - no rewards`);
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

/**
 * Generate claim data for a user
 */
const generateClaimData = async (req, res, next) => {
  try {
    const { userAddress } = req.params;
    
    // Get all unclaimed rewards for the user
    const rewards = await Reward.find({ 
      userAddress, 
      claimed: false 
    });
    
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
          total: ethers.getBigInt(0),
          rewards: []
        };
      }
      
      rewardsByToken[reward.tokenAddress].total = rewardsByToken[reward.tokenAddress].total + 
        ethers.getBigInt(reward.amount);
      
      rewardsByToken[reward.tokenAddress].rewards.push(reward);
    }
    
    // Generate Merkle proofs for each token
    const claims = [];
    for (const tokenRewards of Object.values(rewardsByToken)) {
      const { proof, leaf } = await merkleService.generateProof(
        tokenRewards.tokenAddress,
        userAddress,
        tokenRewards.total.toString()
      );
      
      claims.push({
        token: tokenRewards.tokenAddress,
        handle: tokenRewards.handle,
        amount: tokenRewards.total.toString(),
        proof,
        leaf
      });
    }
    
    return res.status(200).json({
      address: userAddress,
      claims,
      airdropContract: process.env.AIRDROP_CONTRACT_ADDRESS || "0xF077fd1bAC70e6D58b1aF77284FBFC5B75Ce168B"
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

module.exports = {
  getFollowerStats,
  getMintableCheck,
  mintMemeCoins,
  distributeEngagementRewards,
  generateClaimData,
  recordClaim
}; 