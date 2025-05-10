const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');
const Reward = require('../models/Reward');
const Airdrop = require('../models/Airdrop');

/**
 * Generate a Merkle tree from all pending rewards for a specific token and airdrop round
 */
async function generateMerkleTree(tokenAddress, index) {
  // Get all unclaimed rewards for this token
  const rewards = await Reward.find({ 
    tokenAddress,
    claimed: false,
    airdropIndex: index
  });
  
  // Group rewards by user address
  const rewardsByUser = {};
  
  for (const reward of rewards) {
    if (!rewardsByUser[reward.userAddress]) {
      rewardsByUser[reward.userAddress] = {
        user: reward.userAddress,
        amount: ethers.getBigInt(0)
      };
    }
    
    rewardsByUser[reward.userAddress].amount = rewardsByUser[reward.userAddress].amount + 
      ethers.getBigInt(reward.amount);
  }
  
  // Create leaves for the Merkle tree
  const leaves = Object.values(rewardsByUser).map(entry => {
    // Format: keccak256(abi.encodePacked(token, user, amount, index))
    return ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'uint256', 'uint256'],
        [tokenAddress, entry.user, entry.amount.toString(), index]
      )
    );
  });
  
  // Create the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
  // Get the root
  const root = tree.getHexRoot();
  
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
  
  return { tree, root };
}

/**
 * Generate a proof for a specific user claim
 */
async function generateProof(tokenAddress, userAddress, amount, index) {
  // Get the existing tree from the database instead of regenerating it
  const airdrop = await Airdrop.findOne({ tokenAddress, index });
  if (!airdrop) {
    throw new Error(`No airdrop found for token ${tokenAddress} with index ${index}`);
  }
  
  // Regenerate the tree to get the same structure
  const { tree } = await generateMerkleTree(tokenAddress, index);
  console.log({tree});
  console.log({tokenAddress, userAddress, amount, index});
  
  // Ensure amount is properly formatted as a string
  const formattedAmount = ethers.getBigInt(amount).toString();
  
  // Create the leaf in the exact same way as in the tree generation
  const leaf = ethers.keccak256(
    ethers.solidityPacked(
      ['address', 'address', 'uint256', 'uint256'],
      [tokenAddress, userAddress, formattedAmount, index]
    )
  );
  console.log({leaf});
  
  // Check if the leaf exists in the tree before getting proof
  const leafIndex = tree.getLeafIndex(leaf);
  if (leafIndex === -1) {
    console.error('Leaf not found in the tree. User may not be eligible for this airdrop.');
    return { proof: [], leaf };
  }
  
  const proof = tree.getHexProof(leaf);
  console.log({proof});
  
  return { proof, leaf };
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