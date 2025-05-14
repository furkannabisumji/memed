const Token = require('../models/Token');

/**
 * Get all tokens with pagination
 * @route GET /tokens
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Number of items per page (default: 10)
 * @returns {Object} Paginated tokens data
 */
exports.getAllTokens = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count of tokens
    const totalTokens = await Token.countDocuments();
    
    // Get paginated tokens
    const tokens = await Token.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        tokens,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTokens / limit),
          totalTokens,
          hasNextPage: skip + tokens.length < totalTokens,
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 

/**
 * Get token by token address
 * @route GET /tokens/:tokenAddress
 * @param {string} tokenAddress - Token address
 * @returns {Object} Token data
 */
exports.getTokenByAddress = async (req, res, next) => {
  try {
    const { tokenAddress } = req.params;
    const token = await Token.findOne({ tokenAddress });
    if (!token) {
      return res.status(404).json({ success: false, error: 'Token not found' });
    }
    res.json({ success: true, data: token });
  } catch (error) {
    next(error);
  }
};


/**
 * Get all creators with their token information
 * @route GET /creators
 * @returns {Object} List of creators and their tokens
 */
exports.getAllCreators = async (req, res, next) => {
  try {
    // Get all tokens and group them by creator
    const tokens = await Token.find().sort({ createdAt: -1 });
    
    // Group tokens by creator address
    const creatorsMap = {};
    
    for (const token of tokens) {
      if (!creatorsMap[token.creator]) {
        creatorsMap[token.creator] = {
          address: token.creator,
          handle: token.handle,
          tokens: []
        };
      }
      
      creatorsMap[token.creator].tokens.push({
        tokenAddress: token.tokenAddress,
        name: token.name,
        ticker: token.ticker,
        description: token.description,
        image: token.image,
        createdAt: token.createdAt,
        totalDistributed: token.totalDistributed
      });
    }
    
    // Convert map to array
    const creators = Object.values(creatorsMap);
    
    res.json({
      success: true,
      data: {
        creators,
        totalCreators: creators.length
      }
    });
  } catch (error) {
    next(error);
  }
}; 
