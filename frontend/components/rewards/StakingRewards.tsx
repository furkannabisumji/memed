import React, { useEffect, useState } from 'react'
import { Badge } from '../ui/badge';
import { useClaimData } from '@/hooks/rewards/useClaimData';
import { useAccount } from 'wagmi';
import { ClaimProof, MemeDetails } from '@/app/types';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { Button } from '../ui/button';
import { useAccountStore } from '@/store/accountStore';
import { Gift, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCustomToast } from '../ui/custom-toast';
import CONTRACTS from '@/config/contracts';

import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import EngageToEarn from '@/config/memedEngageToEarnABI.json'
import { config } from '@/providers/Web3Provider';
import { Abi } from 'viem';

// const stakingRewards = [
//     {
//         _id: "1",
//         ticker: "MEME",
//         tokenAddress: "0x123abc...def",
//         handle: "0xbruh",
//         amount: "2500",
//         proof: ["0xabc", "0xdef", "0xghi"],
//         leaf: "0xleaf1",
//         index: 0,
//         type: "Airdrop"
//     },
//     {
//         _id: "2",
//         ticker: "LOL",
//         tokenAddress: "0x456def...abc",
//         handle: "memeLord",
//         amount: "15000",
//         proof: ["0x123", "0x456", "0x789"],
//         leaf: "0xleaf2",
//         index: 1,
//         type: "Reward"
//     },
//     {
//         _id: "3",
//         ticker: "GIGGLE",
//         tokenAddress: "0x789ghi...xyz",
//         handle: "gagMaster",
//         amount: "320",
//         proof: ["0xaaa", "0xbbb"],
//         leaf: "0xleaf3",
//         index: 2,
//         type: "Engage-to-Earn"
//     }
// ];

const getMemeInfo = (tokenAddress: string): Promise<{ name: string; description: string; image: string; handle: string; }> => {
    return axiosInstance.get(`/tokens/${tokenAddress}`)
        .then((res) => res.data)
        .catch((error) => {
            const axiosErr = error as AxiosError<{ message?: string }>;
            const message =
                axiosErr.response?.data?.message || axiosErr.message || "Failed to fetch Claims";

            throw new Error(message);
        })
}
export default function StakingRewards({ ticker }: { ticker: string }) {
    const { address, isConnecting } = useAccount()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [rewards, setRewards] = useState<ClaimProof[]>([])
    const [claimingToken, setClaimingToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const { accounts, getFirstAccount } = useAccountStore()
    const ITEMS_PER_PAGE = 1;
    const toast = useCustomToast();
    // Get Rewards
    const {
        data: fetchedRewards,
        isLoading: REWARDS_LOADING,
    } = useClaimData(address);


    const fetchRewards = async (
        pageNum: number,
        tabType = "available",
        reset: boolean = false
    ) => {

        // Fetch Rewards
        if (pageNum === 1) {
            setIsLoading(true);
        }
        // Get the appropriate data based on tab
        if (fetchedRewards == null) {
            setIsLoading(false)
            return;
        }
        // Sort claims based Only Conected Users 
        let sourceData = fetchedRewards.filter((reward) => reward.userAddress === address)

        // Simulate paginated data fetch
        const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedRewards = sourceData.slice(startIndex, endIndex);

        console.log("Paginated", paginatedRewards)


        // Check if there are more items to load
        setHasMore(endIndex < sourceData.length);

        // Reset
        if (reset) {
            if (tabType === "available") {
                setRewards(paginatedRewards);
            } else {
                const sliced = sourceData.slice(0, endIndex);
                setRewards(sliced);
            }
        } else {
            setRewards((prev) => [...prev, ...paginatedRewards]);
        }


        // Set Page
        setPage(pageNum)

        setIsLoading(false)
    }

    // Initial Fetch
    useEffect(() => {
        if (address && fetchedRewards) {
            fetchRewards(1, "available", true)

        } else {
            setIsLoading(false)
            setRewards([])
        }
    }, [address, fetchedRewards])


    // Handle load more button click
    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            fetchRewards(page + 1, "available");
        }
    };


    const handleClaim = async ({ tokenAddress, amount, index, proof }: {
        tokenAddress: string, amount: string, index: number, proof: string[]
    }) => {

        if (!address) {
            toast.error("Wallet not connected");
            return;
        }

        setClaimingToken(tokenAddress);

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1500));


            // On chain transaction
            try {
                console.log("🚀 Claiming reward...");

                const { request } = await simulateContract(config, {
                    abi: EngageToEarn as Abi,
                    address: CONTRACTS.memedEngageToEarn as `0x${string}`,
                    functionName: 'claim',
                    args: [
                        tokenAddress as `0x${string}`,
                        BigInt(amount),
                        BigInt(index),
                        proof as `0x${string}`[],
                    ],
                    account: address,
                });

                const hash = await writeContract(config, request);

                console.log('✅ Claim transaction sent:', hash);

                const receipt = await waitForTransactionReceipt(config, { hash });
                const isSuccess = receipt.status === "success";

                // Find the token data
                const tokenData = rewards.find((r) => r.tokenAddress === tokenAddress);

                if (!tokenData) {
                    throw new Error("Token data not found");
                }

                // Success - update UI
                if (isSuccess) {
                    toast.success(
                        `Successfully claimed ${tokenData.amount} ${tokenData.ticker}`
                    );
                }

            } catch (err: any) {
                console.error('❌ Error sending claim transaction:', err);
                const message =
                    err?.shortMessage ||
                    err?.message ||
                    "Something went wrong while claiming the reward";
                throw new Error(message);
            }
            // Remove the claimed token from the list
            setRewards(rewards.filter((r) => r.tokenAddress !== tokenAddress));

        } catch (error) {
            console.error("Claim error:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to claim rewards"
            );
        } finally {
            setClaimingToken(null);
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            {isLoading || isConnecting ? (
                <div className="flex justify-center items-center py-8">
                    <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-primary rounded-full" />
                    <span className="ml-2 text-gray-500">Loading rewards...</span>
                </div>
            ) : rewards && rewards.length !== 0 ? (
                rewards.map((reward) => (
                    <div
                        key={reward._id}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                    >
                        <div>
                            <p className="font-medium">@{reward.handle}</p>
                            {/* <p className="text-sm text-gray-500">Type: {reward.type}</p> */}
                            <Badge className="bg-primary hover:bg-primary text-white">
                                +{parseFloat(reward.amount).toLocaleString()} ${reward.ticker}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">

                            <button
                                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center gap-2"
                                onClick={() => handleClaim({
                                    amount: reward.amount,
                                    index: reward.index,
                                    proof: reward.proof,
                                    tokenAddress: reward.tokenAddress
                                })}
                            >
                                {claimingToken === reward.tokenAddress ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Claiming...
                                    </>
                                ) : (
                                    <>
                                        <Gift className="w-3 h-3" />
                                        Claim
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Gift className="w-12 h-12 mb-4 text-gray-400" />
                    <h2 className="mb-2 text-2xl font-bold">No Rewards Yet</h2>
                    <p className="mb-6 text-gray-600">
                        You don't have any unclaimed rewards at the moment.
                    </p>
                </div>
            )}
            {hasMore &&
                <Button className='ml-auto' variant={'outline'} onClick={handleLoadMore}>Load More</Button>
            }
        </div>
    )
}
