const ethers = require('ethers');
const Token = require('../models/Token');
const Airdrop = require('../models/Airdrop');
const Reward = require('../models/Reward');



/**
 * Handle POST requests for webhook
 * Processes Ethereum logs from alerts
 */
const webhook = async (req, res) => {
    console.log(JSON.stringify(req.body));
    res.json({ success: true });
    try {
        if (req.body.type === 'Reward') {
            const {token, userAmount, index} = req.body.data;
            let tokenData = await Token.findOne({ tokenAddress: token });
            if (!tokenData) {
                await new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        tokenData = await Token.findOne({ tokenAddress: token });
                        resolve(tokenData);
                    }, 4000);
                });
            }
            if (!tokenData) {
                console.log('Token not found');
                return;
            }
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
            const {userAddress, amount, index, transactionHash} = req.body.data;

            const rewards = await Reward.find({ userAddress, amount, claimed: false }).populate('airdrop');
            const reward = (rewards.filter(reward => reward.airdrop.index == index))[0];
            if (reward) {
                await Reward.findByIdAndUpdate(reward._id, { claimed: true, transactionHash });
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
