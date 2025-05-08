const lensService = require('../services/lensService');
const ethers = require('ethers');
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
    const {name, ticker, description, image } = req.body;
    console.log(req.params.handle);
    console.log(name, ticker, description, image);
    let checkTrue = await getMintableCheckFunction(req, res, next);
    if(checkTrue) {
      try{
      const tx = await contract.createMeme(req.params.handle, name, ticker, description, image);
      console.log({tx});
      return res.status(200).json({ message: 'Meme created successfully', tx: tx.hash});
      } catch (error) {
        console.error('Error creating meme:', error);
        return res.status(500).json({ error: 'Failed to create meme' });
      }
    } else {
      return res.status(400).json({ error: 'Account not mintable' });
    }
  } catch (error) {
    console.error('Error fetching followers:', error);
    if (error.message === 'Account not found') {
      return res.status(404).json({ error: 'Account not found' });
    }
    next(error);
  }
}

module.exports = {
  getFollowerStats,
  getMintableCheck,
  mintMemeCoins
}; 