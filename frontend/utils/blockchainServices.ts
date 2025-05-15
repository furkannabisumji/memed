
import EngageToEarn from '@/config/memedEngageToEarnABI.json'; // your claim contract ABI
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