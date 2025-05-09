const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');
const Reward = require('../models/Reward');
const MerkleRoot = require('../models/MerkleRoot');

/**
 * Generate a Merkle tree from all pending rewards
 */
async function generateMerkleTree() {
  // Get all unclaimed rewards
  const rewards = await Reward.find({ claimed: false });
  
  // Group rewards by token and user address
  const rewardsByTokenAndUser = {};
  
  for (const reward of rewards) {
    const key = `${reward.tokenAddress}-${reward.userAddress}`;
    
    if (!rewardsByTokenAndUser[key]) {
      rewardsByTokenAndUser[key] = {
        token: reward.tokenAddress,
        user: reward.userAddress,
        amount: ethers.getBigInt(0)
      };
    }
    
    rewardsByTokenAndUser[key].amount = rewardsByTokenAndUser[key].amount + 
      ethers.getBigInt(reward.amount);
  }
  
  // Create leaves for the Merkle tree
  const leaves = Object.values(rewardsByTokenAndUser).map(entry => {
    // Format: keccak256(abi.encodePacked(token, user, amount))
    return ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'uint256'],
        [entry.token, entry.user, entry.amount.toString()]
      )
    );
  });
  
  // Create the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
  // Get the root
  const root = tree.getHexRoot();
  
  // Save the root to database
  await MerkleRoot.create({
    root,
    updatedAt: Date.now(),
    deployed: false
  });
  
  return { tree, root };
}

/**
 * Generate a proof for a specific user claim
 */
async function generateProof(tokenAddress, userAddress, amount) {
  const { tree } = await generateMerkleTree();
  
  const leaf = ethers.keccak256(
    ethers.solidityPacked(
      ['address', 'address', 'uint256'],
      [tokenAddress, userAddress, amount]
    )
  );
  
  const proof = tree.getHexProof(leaf);
  
  return { proof, leaf };
}

/**
 * Get the latest Merkle root
 */
async function getLatestRoot() {
  const latestRoot = await MerkleRoot.findOne({}).sort({ updatedAt: -1 });
  return latestRoot ? latestRoot.root : null;
}

/**
 * Mock update Merkle root - to replace with contract call when upgraded
 */
async function mockUpdateMerkleRoot() {
  const { root } = await generateMerkleTree();
  console.log(`Mock Merkle root update: ${root}`);
  return root;
}

module.exports = {
  generateMerkleTree,
  generateProof,
  getLatestRoot,
  mockUpdateMerkleRoot
}; 