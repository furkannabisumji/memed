const { airdrop_contractWS } = require('../config/factory');
const axios = require('axios');
const ethers = require('ethers');
console.log("Contract service started");
const sendWebhook = async (type, data) => {
    await axios.post(`${process.env.BASE_URL}/api/webhook`, {
        type,
        data
    },{headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET
    }});
}
airdrop_contractWS.on('Reward', async (token, userAmount, _, index) => {
    sendWebhook('Reward', { token, userAmount: ethers.formatUnits(userAmount, 18), index: index.toString() });
});
airdrop_contractWS.on('Claimed', async (userAddress, amount, index) => {
    sendWebhook('Claimed', { userAddress, amount: ethers.formatUnits(amount, 18), index: index.toString() });
});