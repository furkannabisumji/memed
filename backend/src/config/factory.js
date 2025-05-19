const ethers = require('ethers');
const createMemeABI = require('./abi.json');
const airdropABI = require('./airdropABI.json');
const config = require('./config.json');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_LENS);
const providerWS = new ethers.WebSocketProvider(process.env.RPC_URL_LENS_WS);
const wallet = new ethers.Wallet(process.env.ADMIN_PVT_KEY, provider);
const factory_contract = new ethers.Contract(config.factory, createMemeABI, wallet);  
const airdrop_contract = new ethers.Contract(config.memedEngageToEarn, airdropABI, wallet);
const airdrop_contractWS = new ethers.Contract(config.memedEngageToEarn, airdropABI, providerWS);


module.exports = {
  factory_contract,
  airdrop_contract,
  airdrop_contractWS,
  wallet
};
