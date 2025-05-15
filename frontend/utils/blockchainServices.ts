
import EngageToEarn from '@/config/memedEngageToEarnABI.json'; // your claim contract ABI
import MemedBattleABI from '@/config/memedBattleABI.json'; // your claim contract ABI
import { chains } from '@lens-chain/sdk/viem';
import { parseAbi, WalletClient } from 'viem';
import { simulateContract, writeContract } from '@wagmi/core'
import { config } from '@/providers/Web3Provider';


type ClaimParams = {
    userAddress: `0x${string}`;
    contractAddress: `0x${string}`;
    tokenAddress: `0x${string}`;
    amount: number | string | bigint;
    index: number;
    proof: `0x${string}`[]; // Merkle proof
};

type StartBattleParams = {
    userAddress: `0x${string}`;             // Address of the caller (msg.sender)
    contractAddress: string;         // Address of MemedBattle contract
    memeBAddress: string;            // Address of opponent meme (creator)
};

export const claimReward = async ({
    userAddress,
    contractAddress,
    tokenAddress,
    amount,
    index,
    proof,
}: ClaimParams) => {
    try {
        console.log("🚀 Claiming reward...");

        const { request } = await simulateContract(config, {
            abi: EngageToEarn,
            address: contractAddress,
            functionName: 'claim',
            args: [
                tokenAddress,
                BigInt(amount),
                BigInt(index),
                proof,
            ],
            account: userAddress,
        });

        const txHash = await writeContract(config, request);
        console.log('✅ Claim transaction sent:', txHash);
        return txHash;

    } catch (err: any) {
        console.error('❌ Error sending claim transaction:', err);
        const message =
            err?.shortMessage ||
            err?.message ||
            "Something went wrong while claiming the reward";
        throw new Error(message);
    }
};

export const startBattle = async ({
    userAddress,
    contractAddress,
    memeBAddress,
}: StartBattleParams) => {
    try {
        console.log("🚀 Starting battle...");

        
        const { request } = await simulateContract(config, {
            abi: MemedBattleABI,
            address: contractAddress as `0x${string}`,
            functionName: 'startBattle',
            args: [
                memeBAddress as `0x${string}`
            ],
            account: userAddress
        })

        const txHash = await writeContract(config, request)
        console.log("✅ Battle transaction sent:", txHash);
        return txHash;
    } catch (err: any) {
        console.log(err)
        const message =
            err?.shortMessage ||
            err?.message ||
            "Something went wrong while starting the battle";

        throw new Error(message);
    }
};