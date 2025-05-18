const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');
const Reward = require('../models/Reward');
const Airdrop = require('../models/Airdrop');

/**
 * Generate a Merkle tree from all pending rewards for a specific token and airdrop round
 * @param {string} tokenAddress - The token address
 * @param {number} airdropIndex - The airdrop index
 * @param {Array} rewards - The rewards array
 * @returns {Object} Object containing tree, root
 */
async function generateMerkleTree(tokenAddress, airdropIndex, rewards) {
  // Get all rewards for this token and airdrop index

  if (!rewards || rewards.length === 0) {
    console.log('No rewards found for token and airdrop index');
    return { tree: null, root: null, rewards: [] };
  }

  // Create leaves from the rewards data
  const leaves = rewards.map(reward => {
    return keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'uint256', 'uint256'],
        [tokenAddress, reward.address, reward.amount.toString(), airdropIndex.toString()]
      )
    );
  });

  // Create the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  // Get the root
  const root = tree.getHexRoot();
  
  // Link proofs to rewards
  const rewardsWithProofs = rewards.map((reward, index) => {
    const leaf = leaves[index];
    const proof = tree.getHexProof(leaf);
    return {
      ...reward,
      proof,
      leaf: '0x' + leaf.toString('hex')
    };
  });


  return { tree, root, rewardsWithProofs }
}

/**
 * Generate a proof for a specific user claim
 * @param {string} tokenAddress - The token address
 * @param {string} userAddress - The user address
 * @param {number} airdropIndex - The airdrop index
 * @returns {Object} Object containing proof, leaf, amount, and isValid
 */
async function generateProof(tokenAddress, userAddress, airdropIndex) {
  console.log(`Generating proof for token: ${tokenAddress}, user: ${userAddress}, index: ${airdropIndex}`);
  
  // Find all unclaimed rewards for this user, token, and airdrop index
  const rewards = await Reward.find({
    tokenAddress: tokenAddress,
    userAddress: userAddress,
    airdropIndex: airdropIndex,
    claimed: false
  });

  console.log(`Found ${rewards.length} unclaimed rewards`);

  if (!rewards || rewards.length === 0) {
    console.log('No rewards found for user');
    return { proof: [], leaf: null, amount: "0", isValid: false };
  }

  // Calculate total amount
  const totalAmount = rewards.reduce((sum, reward) => {
    return sum + ethers.getBigInt(reward.amount);
  }, ethers.getBigInt(0));

  console.log('Calculated total amount:', totalAmount.toString());

  // Generate the tree
  const { tree, root } = await generateMerkleTree(tokenAddress, airdropIndex);
  
  if (!tree || !root) {
    console.log('Failed to generate Merkle tree');
    return { proof: [], leaf: null, amount: totalAmount.toString(), isValid: false };
  }

  // Create the leaf for this user exactly as in the smart contract
  // bytes32 leaf = keccak256(abi.encodePacked(_token, msg.sender, _amount, _index));
  const leaf = keccak256(
    ethers.solidityPacked(
      ['address', 'address', 'uint256', 'uint256'],
      [tokenAddress, userAddress, totalAmount.toString(), airdropIndex.toString()]
    )
  );

  console.log('Generated leaf:', '0x' + leaf.toString('hex'));
  console.log('Tree root:', root);

  // Get the proof
  const proof = tree.getHexProof(leaf);
  console.log('Generated proof:', proof);

  // Verify the proof
  const isValid = tree.verify(proof, leaf, root);
  console.log('Proof verification:', isValid);

  return { 
    proof, 
    leaf: '0x' + leaf.toString('hex'),
    amount: totalAmount.toString(),
    isValid: isValid
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