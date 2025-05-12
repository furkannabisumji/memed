const { PublicClient, mainnet, testnet} = require('@lens-protocol/client');

// Initialize Lens client
const client = PublicClient.create({
  environment: mainnet
});

module.exports = client; 
