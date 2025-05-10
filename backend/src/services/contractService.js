const ethers = require('ethers');
const Token = require('../models/Token');
const Airdrop = require('../models/Airdrop');

// Contract ABIs
const factoryABI = require('../config/factoryABI.json');
const airdropABI = require('../config/airdropABI.json');

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.ADMIN_PVT_KEY, provider);

// Initialize contracts
const factoryContract = new ethers.Contract(
  process.env.FACTORY_CONTRACT_ADDRESS,
  factoryABI,
  wallet
);

const airdropContract = new ethers.Contract(
  process.env.AIRDROP_CONTRACT_ADDRESS,
  airdropABI,
  wallet
);

/**
 * Create a new meme token
 */
async function createMeme(creator, lensUsername, name, ticker, description, image) {
  try {
    const tx = await factoryContract.createMeme(
      creator,
      lensUsername,
      name,
      ticker,
      description,
      image
    );
    
    const receipt = await tx.wait();
    
    // Find the TokenCreated event
    const event = receipt.logs
      .filter(log => log.topics[0] === ethers.id("TokenCreated(address,address,string,string,string,string,string,uint256)"))
      .map(log => factoryContract.interface.parseLog(log))[0];
    
    const tokenAddress = event.args.token;
    
    // Store token info in database
    await Token.create({
      handle: lensUsername,
      tokenAddress,
      name,
      ticker,
      description,
      image,
      creator,
      followers: [],
      createdAt: Date.now()
    });
    
    return { tokenAddress, txHash: tx.hash };
  } catch (error) {
    console.error('Error creating meme token:', error);
    throw error;
  }
}

/**
 * Set Merkle root for a new airdrop round
 */
async function setMerkleRoot(tokenAddress, index, root) {
  try {
    const tx = await airdropContract.setMerkleRoot(tokenAddress, index, root);
    await tx.wait();
    
    // Update airdrop record
    await Airdrop.findOneAndUpdate(
      { tokenAddress, index },
      { deployed: true },
      { new: true }
    );
    
    return tx.hash;
  } catch (error) {
    console.error('Error setting Merkle root:', error);
    throw error;
  }
}

/**
 * Get token data from contract
 */
async function getTokenData(lensUsername) {
  try {
    const tokenData = await factoryContract.tokenData(lensUsername);
    return {
      token: tokenData.token,
      creator: tokenData.creator,
      name: tokenData.name,
      ticker: tokenData.ticker,
      description: tokenData.description,
      image: tokenData.image,
      lensUsername: tokenData.lensUsername,
      followers: tokenData.followers,
      createdAt: tokenData.createdAt
    };
  } catch (error) {
    console.error('Error getting token data:', error);
    throw error;
  }
}

module.exports = {
  createMeme,
  setMerkleRoot,
  getTokenData
}; 