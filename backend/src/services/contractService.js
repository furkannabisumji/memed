const { airdrop_contractWS, airdrop_contract } = require('../config/factory');
const axios = require('axios');
const ethers = require('ethers');
const Reward = require('../models/Reward');
console.log("Contract service started");
/*Reward.findById('682af890bc85a076e28e3936').populate('airdrop').then(async (reward) => {
    console.log(reward);
    await airdrop_contract.claim(reward.tokenAddress, ethers.parseUnits(reward.amount, 18), reward.airdrop.index, reward.proof);
});*/
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
airdrop_contractWS.on('Claimed', async (userAddress, amount, index, event) => {
    console.log(event);
    sendWebhook('Claimed', { userAddress, amount: ethers.formatUnits(BigInt(amount.toString()), 18), index: index.toString(), transactionHash: event.log.transactionHash });
});