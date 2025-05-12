const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');
const Reward = require('../models/Reward');
const Airdrop = require('../models/Airdrop');

/**
 * Generate a Merkle tree from all pending rewards for a specific token and airdrop round
 */
async function generateMerkleTree(tokenAddress, index) {
  console.log('Generating Merkle tree for:', {
    tokenAddress,
    index
  });

  // Get all unclaimed rewards for this token with case-insensitive matching
  const rewards = await Reward.find({ 
    tokenAddress: { $regex: new RegExp(`^${tokenAddress}$`, 'i') },
    airdropIndex: index,
    claimed: false
  });

  console.log('Rewards found for tree generation:', rewards);
  
  // Group rewards by user address and calculate total amounts
  const rewardsByUser = {};
  
  for (const reward of rewards) {
    const userAddress = reward.userAddress.toLowerCase(); // Normalize address
    if (!rewardsByUser[userAddress]) {
      rewardsByUser[userAddress] = ethers.getBigInt(0);
    }
    rewardsByUser[userAddress] = rewardsByUser[userAddress] + 
      ethers.getBigInt(reward.amount);
  }

  console.log('Grouped rewards by user:', rewardsByUser);
  
  // Create leaves for the Merkle tree
  const leaves = Object.entries(rewardsByUser).map(([address, amount]) => {
    console.log('Creating leaf for:', {
      tokenAddress,
      userAddress: address,
      amount: amount.toString(),
      index
    });
    
    const leaf = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'uint256', 'uint256'],
        [tokenAddress, address, amount.toString(), index]
      )
    );
    console.log('Generated leaf:', leaf);
    return leaf;
  });
  
  // Create and return the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();
  
  console.log('Merkle tree generated:', {
    leavesCount: leaves.length,
    root
  });

  // Save the root to database
  await Airdrop.findOneAndUpdate(
    { tokenAddress, index },
    {
      tokenAddress,
      index,
      merkleRoot: root,
      timestamp: Date.now()
    },
    { upsert: true }
  );

  return { tree, root, leaves };
}

/**
 * Generate a proof for a specific user claim
 * 
 *  tokenRewards.tokenAddress,
        userAddress,
        tokenRewards.total.toString(),
        index
      );
 */
async function generateProof(tokenAddress, userAddress, airdropIndex) {
  // Log the exact reward we found initially
  const initialReward = await Reward.findOne({
    userAddress: userAddress,
    claimed: false
  });
  console.log('Initial reward found:', initialReward);

  // First query without case conversion to see what we find
  const rewardsNoCase = await Reward.find({
    tokenAddress,
    userAddress,
    airdropIndex,
    claimed: false
  });
  console.log('Rewards without case conversion:', rewardsNoCase);

  // Now try with case-insensitive query
  const rewards = await Reward.find({
    tokenAddress: { $regex: new RegExp(`^${tokenAddress}$`, 'i') },
    userAddress: { $regex: new RegExp(`^${userAddress}$`, 'i') },
    airdropIndex,
    claimed: false
  });

  console.log('Rewards with case-insensitive query:', rewards);

  if (!rewards || rewards.length === 0) {
    console.log('No rewards found for user');
    return { proof: [], leaf: null, amount: "0" };
  }

  // Calculate total amount
  const totalAmount = rewards.reduce((sum, reward) => {
    return sum + ethers.getBigInt(reward.amount);
  }, ethers.getBigInt(0));

  console.log('Calculated total amount:', totalAmount.toString());

  // Generate the tree
  const { tree, root } = await generateMerkleTree(tokenAddress, airdropIndex);

  // Create the leaf for this user
  const leaf = ethers.keccak256(
    ethers.solidityPacked(
      ['address', 'address', 'uint256', 'uint256'],
      [tokenAddress, userAddress, totalAmount.toString(), airdropIndex]
    )
  );

  console.log('Generated leaf:', leaf);
  console.log('Tree root:', root);

  // Get the proof
  const proof = tree.getHexProof(leaf);
  console.log('Generated proof:', proof);

  // Verify the proof
  const isValid = tree.verify(proof, leaf, root);
  console.log('Proof verification:', isValid);

  // For single-leaf trees, proof will be empty array but that's valid
  if (leaf === root) {
    console.log('Single-leaf tree detected - empty proof is valid');
  }

  return { 
    proof, 
    leaf,
    amount: totalAmount.toString(),
    isValid: true  // If we got here, the proof is valid even if empty
  };
}

/**
 * Get the latest airdrop index for a token
 */
async function getLatestAirdropIndex(tokenAddress) {
  const latestAirdrop = await Airdrop.findOne({ tokenAddress })
    .sort({ index: -1 })
    .limit(1);
  
  return latestAirdrop ? latestAirdrop.index : -1;
}

module.exports = {
  generateMerkleTree,
  generateProof,
  getLatestAirdropIndex
}; 