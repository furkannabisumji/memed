const ethers = require('ethers');
const airdropABI = require('../config/airdropABI.json');
const Token = require('../models/Token');
const Airdrop = require('../models/Airdrop');

/**
 * Handle GET requests for Tenderly webhook
 */
const tenderlyWebhookGet = async (req, res) => {
    try {
        res.json({ status: 'Tenderly webhook endpoint is active' });
    } catch (error) {
        console.error('Error in Tenderly webhook GET:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Handle POST requests for Tenderly webhook
 * Processes Ethereum logs from Tenderly alerts
 */
const tenderlyWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        // Early response to Tenderly to acknowledge receipt
        res.status(200).json({ status: 'Processing webhook data' });

        // Check if the webhook contains transaction data
        if (webhookData && webhookData.transaction) {
            const { transaction } = webhookData;
            // Process logs if available
            if (transaction.logs && transaction.logs.length > 0) {
                const contractInterface = ethers.Interface.from(airdropABI);
                let airdrop;
                for (let i = 0; i < transaction.logs.length; i++) {
                    const decodedLog = contractInterface.parseLog(transaction.logs[i]);
                    if(decodedLog && decodedLog.name === 'Reward') {
                        airdrop = decodedLog.args;
                        break;
                    }
                }
                
                    const [token, userAmount, _, index] = airdrop;
                    const tokenData = await Token.findOne({ tokenAddress: token });

                const tokenAirdrops = await Airdrop.find({ token: tokenData._id });
                const distributed = new Airdrop({
                    token: tokenData._id,
                    limit: 5000,
                    type: tokenAirdrops.length > 0 ? 'engagement' : 'initial',
                    maxAmount: ethers.formatUnits(userAmount, 18),
                    processed: false,
                    index: index.toString(),
                    timestamp: Date.now()
                });
                await distributed.save();

            }
        }
    } catch (error) {
        console.error('Error processing Tenderly webhook:', error);
        // We've already sent a response, so just log the error
    }
};

module.exports = {
    tenderlyWebhookGet,
    tenderlyWebhook,
};
