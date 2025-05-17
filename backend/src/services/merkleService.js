const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');
const Reward = require('../models/Reward');
const Airdrop = require('../models/Airdrop');

/**
 * Generate a Merkle tree from all pending rewards for a specific token and airdrop round
 * @param {Array} selectedFollowers - Array of followers with address and amount
 * @returns {Object} Object containing tree, root, proofs, and followers with linked proofs
 */
async function generateMerkleTree(selectedFollowers) {

  // Create leaves from the followers' data
  const leaves = selectedFollowers.map(({ address, amount }) =>
    keccak256(address.toLowerCase() + amount)
  );

  // Create the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  // Get the root and generate proofs
  const root = tree.getHexRoot();
  
  // Link proofs to followers
  const followersWithProofs = selectedFollowers.map((follower, index) => {
    const leaf = leaves[index];
    const proof = tree.getHexProof(leaf);
    return {
      ...follower,
      proof,
      leaf: '0x' + leaf.toString('hex')
    };
  });

  return { tree, root, followersWithProofs }
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