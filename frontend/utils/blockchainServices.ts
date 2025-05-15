
import EngageToEarn from '@/config/memedEngageToEarnABI.json'; // your claim contract ABI
import MemedBattleABI from '@/config/memedBattleABI.json'; // your claim contract ABI
import { chains } from '@lens-chain/sdk/viem';
import { WalletClient } from 'viem';
import { writeContract } from 'viem/actions';


type ClaimParams = {
    walletClient: WalletClient;
    userAddress: string;           // The address of the user (signer)
    contractAddress: string;       // Address of the airdrop contract
    tokenAddress: string;               // ERC20 token being claimed
    amount: string | number | bigint;     // Amount to claim
    index: number;                        // Merkle index
    proof: string[];
}

type StartBattleParams = {
    walletClient: WalletClient;
    userAddress: `0x${string}`;             // Address of the caller (msg.sender)
    contractAddress: string;         // Address of MemedBattle contract
    memeBAddress: string;            // Address of opponent meme (creator)
};

export const claimReward = async ({ walletClient, userAddress, contractAddress, tokenAddress, amount, index, proof }: ClaimParams) => {
    try {

        if (!walletClient) throw new Error('Wallet client not found');
        const chain = await walletClient.getChainId()
        const currentChain = chains.mainnet.id === chain ? chains.mainnet : chains.testnet;

        console.log("Claiming Reward.....")

        const txHash = await writeContract(walletClient, {
            account: userAddress as `0x${string}`, // REQUIRED
            address: contractAddress as `0x${string}`,
            chain: currentChain,
            abi: EngageToEarn,
            functionName: 'claim',
            args: [
                tokenAddress as `0x${string}`,   // address
                BigInt(amount),                  // uint256
                index,                           // uint256
                proof as `0x${string}`[]         // `0x${string}[]   
            ],
        });

        console.log('✅ Transaction sent:', txHash);
        return txHash;
    } catch (err) {
        console.error('❌ Error sending transaction:', err);
        console.log(err)
        throw err;
    }
};

export const startBattle = async ({
    walletClient,
    userAddress,
    contractAddress,
    memeBAddress,
}: StartBattleParams) => {
    try {
        if (!walletClient) throw new Error('Wallet client not found');

        const chainId = await walletClient.getChainId();
        const currentChain = chains.mainnet.id === chainId ? chains.mainnet : chains.testnet;

        console.log("🚀 Starting battle...");

        const txHash = await writeContract(walletClient, {
            account: userAddress as `0x${string}`,
            address: contractAddress as `0x${string}`,
            chain: currentChain,
            abi: MemedBattleABI,
            functionName: 'startBattle',
            args: [memeBAddress as `0x${string}`],
        });

        console.log("✅ Battle transaction sent:", txHash);
        return txHash;
    } catch (err: any) {
        const message =
            err?.shortMessage ||
            err?.message ||
            "Something went wrong while starting the battle";

        throw new Error(message);
    }
};