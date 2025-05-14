const ethers = require('ethers');
const createMemeABI = require('./abi.json');
const airdropABI = require('./airdropABI.json');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_LENS);
const wallet = new ethers.Wallet(process.env.ADMIN_PVT_KEY, provider);
const factory_contract = new ethers.Contract(process.env.FACTORY_CONTRACT_ADDRESS, createMemeABI, wallet);  
const airdrop_contract = new ethers.Contract(process.env.AIRDROP_CONTRACT_ADDRESS, airdropABI, wallet);

module.exports = {
  factory_contract,
  airdrop_contract,
  wallet
};
