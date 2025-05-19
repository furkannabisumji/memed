const ethers = require('ethers');
const Token = require('../models/Token');
const Airdrop = require('../models/Airdrop');
const Reward = require('../models/Reward');



/**
 * Handle POST requests for webhook
 * Processes Ethereum logs from alerts
 */
const webhook = async (req, res) => {
    res.json({ success: true });
    try {
        if (req.body.type === 'Reward') {
            const {token, userAmount, index} = req.body.data;
            const tokenData = await Token.findOne({ tokenAddress: token });
            const tokenAirdrops = await Airdrop.find({ token: tokenData._id });
            const distributed = new Airdrop({
                token: tokenData._id,
                limit: 5000,
                type: tokenAirdrops.length > 0 ? 'engagement' : 'initial',
                maxAmount: userAmount,
                processed: false,
                index: index,
                timestamp: Date.now()
            });
            await distributed.save();
        }
        if (req.body.type === 'Claimed') {
            const {userAddress, amount, index} = req.body.data;

            const rewards = await Reward.find({ userAddress, amount: ethers.formatUnits(amount, 18), claimed: false }).populate('airdrop');
            const reward = (rewards.filter(reward => reward.airdrop.index === parseInt(index.toString())))[0];
            if (reward) {
                await Reward.findByIdAndUpdate(reward._id, { claimed: true });
            }
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        // We've already sent a response, so just log the error
    }
};

module.exports = {
    webhook,
};
