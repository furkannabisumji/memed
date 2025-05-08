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
    const { name, ticker, description, image, message, signature, timestamp } = req.body;
    const { handle } = req.params;

    // const account = await lensService.getHandleOwner(handle);

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
    const handleOwner = await lensService.getProfileAddress(handle);
    if (recoveredAddress.toLowerCase() !== handleOwner.toLowerCase()) {
      return res.status(403).json({ error: 'Signature does not match handle owner' });
    }

    // 5. Mintable check
    let checkTrue = await getMintableCheckFunction(req, res, next);
    if (checkTrue) {
      try {
        const tx = await contract.createMeme(handle, name, ticker, description, image);
        return res.status(200).json({ message: 'Meme created successfully', tx: tx.hash });
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

module.exports = {
  getFollowerStats,
  getMintableCheck,
  mintMemeCoins
}; 