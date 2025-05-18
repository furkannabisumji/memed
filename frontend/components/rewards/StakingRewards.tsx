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

import { simulateContract, waitForTransactionReceipt, writeContract, readContract } from '@wagmi/core'
import EngageToEarn from '@/config/memedEngageToEarnABI.json'
import { config } from '@/providers/Web3Provider';
import { Abi, formatEther } from 'viem';
import MemedStakingABI from '@/config/memedStakingABI.json'
import { motion } from 'motion/react'
export default function StakingRewards({ ticker, tokenAddress }: { ticker: string, tokenAddress: string }) {
    const { address, isConnecting } = useAccount()
    const [reward, setReward] = useState(0n)
    const [rewardAmount, setRewardAmount] = useState()
    const [isPending, setIsPending] = useState<boolean>(false)
    const [loadingStake, setLoadingStake] = useState<boolean>(true)
    const toast = useCustomToast();



    const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

    const getReward = async (token: string) => {
        try {
            if (!token) return;
            setLoadingStake(true)
            const result: any = await readContract(config, {
                abi: MemedStakingABI as Abi,
                address: CONTRACTS.memedStaking as `0x${string}`,
                functionName: 'stakes',
                args: [token as `0x${string}`, address!],
            })
            console.log("Reward: ", result)
            console.log(result)
            return result // this will be a TokenData[] array
        } catch (err) {
            console.error('Error fetching tokens:', err)
            setLoadingStake(false)
            return []
        } finally {
            setLoadingStake(false)
        }
    }

    useEffect(() => {
        if (address && tokenAddress) {
            getReward(tokenAddress).then((res) => {
                const amount = res?.[0] ?? 0n;
                const reward = res?.[1]   ?? 0n;
                setReward(reward)
                setRewardAmount(amount)
            })
        }
    }, [address, tokenAddress])

    const claim = async (tokenAddress: string) => {
        if (!tokenAddress) {
            toast.error("Invalid Token")
            return
        }
        setIsPending(true)
        try {
            const { request } = await simulateContract(config, {
                abi: MemedStakingABI as Abi,
                address: CONTRACTS.memedStaking as `0x${string}`,
                functionName: "claimReward",
                args: [tokenAddress as `0x${string}`],
            });
            const hash = await writeContract(config, request);

            const receipt = await waitForTransactionReceipt(config, { hash });

            const isSuccess = receipt.status === "success";

            if (isSuccess) {
                toast.success("Reward claimed!", {
                    description: `You've successfully claimed your reward for this meme.`,
                });
                setIsPending(false)
            }
            console.log("✅ Reward claim tx sent:", hash);
        } catch (err: any) {

            const message =
                err?.shortMessage ||
                err?.message ||
                "Something went wrong while claiming the reward";

            toast.error(message)
            throw new Error(message);
        } finally {
            setIsPending(false)
        }

    }


    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-2xl flex flex-col items-center gap-2 p-10 justify-center text-center"
        >
            <motion.div
                animate={reward && reward > 0n ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, -5, 5, -5, 0], // Shake effect
                } : {}}
                transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                }}
            >
                <Gift className="w-20 h-20 drop-shadow-md" style={{ color: "#28d358" }} />
            </motion.div>


            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white mt-3">
                Claim Your Reward
            </h2>

            {loadingStake ? (
                <p className="text-gray-600 dark:text-gray-300 animate-pulse">
                    Loading reward...
                </p>
            ) : reward && reward > 0n ? (
                <>
                    <p className="text-lg mb-2" style={{ color: "#000" }}>
                        🎉 You have {(Number(reward) * 1e-18).toFixed(18).replace(/\.?0+$/, '')} tokens to claim!
                    </p>

                    <motion.button
                        onClick={() => claim(tokenAddress)}
                        disabled={isPending}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className="text-white cursor-pointer font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "#28d358",
                            // optional hover color
                        }}
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                Claiming Reward <Loader2 className="animate-spin w-5 h-5" />
                            </div>
                        ) : (
                            "Claim Reward"
                        )}
                    </motion.button>
                </>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No rewards available to claim.</p>
            )}
        </motion.div>
    )
}
