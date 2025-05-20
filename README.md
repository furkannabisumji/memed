# Memed.Fun

Where memes meet money, and creators become legends. Memed.Fun is a platform that lets creators mint their own meme tokens, battle for supremacy, and reward their community through the power of Lens Protocol.

![Meme Token Flow](https://github.com/user-attachments/assets/b9a58958-8647-4cb1-98fe-87af10c3aaeb)

---

## What's the Hype?

Imagine if your favorite meme creator could:

* Mint their own token
* Battle other creators' tokens
* Reward their community for engagement
* Build a staking ecosystem

That's Memed.Fun — a playground where social influence meets token economics.

![Social Token Battles](https://github.com/user-attachments/assets/b4c0ecd6-29cf-42d7-b7e9-4b626fb22e4e)

---

## Architecture

<img width="2088" alt="image" src="https://github.com/user-attachments/assets/b1375b00-c38b-444e-be45-78d8699ff30d" />


## How It Works

### 1. Create Your Meme Token

* Connect your Lens handle
* Design your token (name, ticker, description, meme image)
* Deploy ERC-20 contract
* Profile becomes the token's identity
* Start collecting followers and buyers

### 2. Battle System

* Challenge other creators via Lens thread
* 24-hour battle window
* Metrics: Follows, Likes, Mirrors, Comments, Stake Weight
* Winner determined via smart contract snapshot
* Winning meme gains heat score, token emission boost, visibility

### 3. Staking & Rewards

* Anyone can stake tokens behind a meme (showing belief)
* Boost meme heat score based on staked amount
* Stakers earn a share of:

  * Meme's battle wins
  * Engagement rewards
* Rewards claimed via smart contract

### 4. Engagement Rewards

* Lens engagement tracked using Lens API and The Graph
* Top engagers per meme get rewards
* Engagement metrics weighted:

  * Mirror > Comment > Like
* Battle wins
* Rewards claimed via merkle tree

![Reward Flow](https://github.com/user-attachments/assets/f3af0107-9e95-4049-9479-869de8f513df)

---

## Tech Stack

* **Smart Contracts**: Solidity, OpenZeppelin
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **Social Graph**: Lens Protocol SDK, Lens API
* **Indexing**: Node.js(cronjobs)
* **Web3**: Wagmi, Family ConnectKit
* **Storage**: IPFS
* **Reward Distribution**: Merkle trees (via scripts)

---

## Application Screenshots

![App Screenshot 1](https://github.com/user-attachments/assets/70e7f606-d4a3-4d11-bcc5-b4eb6b249278)
![App Screenshot 2](https://github.com/user-attachments/assets/f7c8e5c3-8bb6-4c47-971a-a0ecbf8c781e)

---

## Roadmap Ahead

<img width="2050" alt="image" src="https://github.com/user-attachments/assets/38f48580-a0b2-4104-a450-41cb6285ef2e" />


## API Endpoints

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

---

## Key Features

* **Token Creation**: Mint your own meme token tied to your Lens profile
* **Battle System**: Challenge and compete with other memes in social duels
* **Staking**: Let your community stake on you and share the rewards
* **Engagement Rewards**: Engage-to-earn with token incentives
* **Merkle Airdrops**: Gas-efficient, fair, claimable rewards for all participants

---

## Launch Strategy

* Onboard top Lens creators
* Weekly meme launch contests
* Frame-based voting on Farcaster
* Memed.Fun airdrop to Lens OGs
* On-chain leaderboard and “Hall of Fame”

---

## 📜 Deployed Contracts on Lens Chain

| Contract          | Address                                      | Explorer Link                                                                                    |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Factory           | `0x4237901909F88519a4d3a5a00bADD1c010578d39` | [View on Explorer](https://explorer.lens.xyz/address/0x4237901909F88519a4d3a5a00bADD1c010578d39) |
| MemedStaking      | `0x68a0ac1131a7B753b1476dcfe8E6bC36A65280B2` | [View on Explorer](https://explorer.lens.xyz/address/0x68a0ac1131a7B753b1476dcfe8E6bC36A65280B2) |
| MemedBattle       | `0x150F06c1BE790629e5e54117F459DECbCD5e3844` | [View on Explorer](https://explorer.lens.xyz/address/0x150F06c1BE790629e5e54117F459DECbCD5e3844) |
| MemedEngageToEarn | `0xa2C7ff62BFaBE5308cfDAE7c713347C73708AD45` | [View on Explorer](https://explorer.lens.xyz/address/0xa2C7ff62BFaBE5308cfDAE7c713347C73708AD45) |

---

## 🙏 Acknowledgments

* **Lens Protocol** for composable social graph
* **The Family App** for UX inspiration
* **The Web3 community** for vibing with memes + tokens

---

Made with ❤️ by the Memed.Fun team
