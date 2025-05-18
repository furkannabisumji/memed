# Memed.Fun

Where memes meet money, and creators become legends. Memed.Fun is a platform that lets creators mint their own meme tokens, battle for supremacy, and reward their community through the power of Lens Protocol.

## 🌟 What's the Hype?

Imagine if your favorite meme creator could:
- Mint their own token
- Battle other creators' tokens
- Reward their community for engagement
- Build a staking ecosystem

That's Memed.Fun - a playground where social influence meets token economics.

## How It Works

### 1. Create Your Meme Token
- Connect your Lens handle
- Design your token (name, ticker, description)
- Mint and watch your community grow

### 2. Battle System
- Challenge other creators' tokens
- 24-hour battle periods
- Win based on community engagement and staking
- Earn "heat" and rewards

### 3. Staking & Rewards
- Stake tokens to support creators
- Earn rewards based on your stake
- Increase token "heat" through staking
- Claim rewards through Merkle proofs

### 4. Engagement Rewards
- Earn tokens for engaging with creators
- Automatic reward distribution
- Fair distribution through Merkle trees
- Creator and user rewards

## 💻 Tech Stack

- **Smart Contracts**: Solidity, OpenZeppelin
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Social Graph**: Lens Protocol
- **Web3**: ethers.js

## 🚀 Quick Start

1. Clone the repo
```bash
git clone https://github.com/yourusername/Memed.Fun.git
cd Memed.Fun
```

2. Install dependencies
```bash
npm install
```

3. Set up your environment
```bash
cp .env.example .env
# Fill in your environment variables
```

4. Start the server
```bash
npm start
```

## 📱 API Endpoints

### Creator Endpoints
```http
POST /mintMemeCoins/:handle
GET /getMintableCheck/:handle
```

### Community Endpoints
```http
GET /followers/:handle
GET /engagement/:handle
GET /claims/:userAddress
```

### Token Endpoints
```http
GET /tokens
GET /tokens/:tokenAddress
GET /creators
```

##  Key Features

- **Token Creation**: Mint your own meme token tied to your Lens handle
- **Battle System**: Challenge other creators' tokens
- **Staking**: Support creators and earn rewards
- **Engagement Rewards**: Earn tokens for being active
- **Merkle Airdrops**: Fair distribution of rewards


## 🙏 Acknowledgments

- Lens Protocol for the social graph
- OpenZeppelin for secure contracts
- The amazing Web3 community

---

Made with ❤️ by the Memed.Fun team
