
import airdropAbi from '@/config/airdropABI.json'; // your claim contract ABI
import { createWalletClient, custom } from 'viem';
import { writeContract } from 'viem/actions';
import { mainnet } from 'viem/chains';

type ClaimParams = {
    userAddress: `0x${string}`;           // The address of the user (signer)
    contractAddress: `0x${string}`;       // Address of the airdrop contract
    tokenAddress: `0x${string}`;          // ERC20 token being claimed
    amount: string | number | bigint;     // Amount to claim
    index: number;                        // Merkle index
    proof: string[];
}


export const claimReward = async ({ userAddress, contractAddress, tokenAddress, amount, index, proof }: ClaimParams) => {
    try {
        // Fallback to using the window.ethereum provider
        const ethereum = (window as any).ethereum;

        if (!ethereum) {
            throw new Error("No ethereum provider found. Please install a wallet extension.");
        }

        const walletClient = createWalletClient({
            chain: mainnet,
            transport: custom(ethereum)
        });

        if (!walletClient) throw new Error('Wallet client not found');

        console.log("Claiming Reward.....")
        const txHash = await writeContract(walletClient, {
            account: userAddress, // REQUIRED
            address: contractAddress,
            abi: airdropAbi,
            functionName: 'claim',
            args: [
                tokenAddress as `0x${string}`,   // address
                BigInt(amount),                  // uint256
                index,                           // uint256
                proof as `0x${string}`[]
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