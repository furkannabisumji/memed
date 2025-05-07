const { PublicClient, mainnet } = require('@lens-protocol/client');

// Initialize Lens client
const client = PublicClient.create({
  environment: mainnet
});

module.exports = client; 