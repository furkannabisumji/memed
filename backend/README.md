# Memed Backend API

Backend API for the MemedLens application, handling Lens protocol integration and meme token management.

## Reward Distribution System

The reward distribution system implements the following features:

1. **Initial Reward Distribution**: After minting a new meme token, 100 tokens are distributed to up to 5000 random followers.

2. **Engagement-Based Rewards**: Every 100,000 engagements (likes, comments, mirrors), 100 tokens are distributed to 5000 random followers.

3. **Merkle Tree Verification**: Uses a Merkle tree for secure reward claiming.

4. **Claim Process**: Users can claim their rewards by getting a proof from the API and using it to call the `claim` function on the MemedAirdrop contract.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/memed
   
   # Lens Protocol
   RPC_URL_LENS=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
   
   # Contracts
   ADMIN_PVT_KEY=your_admin_private_key
   CONTRACT_ADDRESS=0xYourFactoryContractAddress
   AIRDROP_CONTRACT_ADDRESS=0xF077fd1bAC70e6D58b1aF77284FBFC5B75Ce168B
   ```
4. Start MongoDB
5. Run the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Lens Profile
- `GET /followers/:handle` - Get follower statistics for a Lens handle
- `GET /getMintableCheck/:handle` - Check if a handle is eligible for minting
- `POST /mintMemeCoins/:handle` - Mint a new meme token for a handle

### Rewards and Claims
- `GET /claims/:userAddress` - Get claim data for a user
- `POST /claims/record` - Record a successful claim
- `POST /admin/distribute-rewards` - Manually trigger engagement reward distribution

## Notes on Contract Integration

The current implementation uses a mock approach for updating the Merkle root, as the MemedAirdrop contract doesn't have a function to update the root after deployment. When the contract is updated to include this functionality, replace the `mockUpdateMerkleRoot` function with a real contract call.

## Development

For local development, you can use:

```
npm run dev
```

This will start the server with nodemon for automatic reloads on code changes. 