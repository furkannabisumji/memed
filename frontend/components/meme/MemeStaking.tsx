import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCustomToast } from "@/components/ui/custom-toast";
import { config } from "@/providers/Web3Provider";
import { useAccount } from "wagmi";
import { useHasStaked } from "@/hooks/useHasStaked";
import type { Meme } from "@/app/types";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { writeContract, simulateContract } from "@wagmi/core";
import { parseUnits, formatUnits } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";
import CONTRACTS from "@/config/contracts";
import type { Abi } from "viem";

// Import ABI
import memedStakingABI from "@/config/memedStakingABI.json";
import StakingRewards from "../rewards/StakingRewards";

// Ensure we have a valid ABI
if (!Array.isArray(memedStakingABI)) {
  throw new Error("Invalid ABI format");
}

interface MemeStakingProps {
  meme: Meme;
  tokenAddress?: string; // Optional token address from URL
}

const MemeStaking: React.FC<MemeStakingProps> = ({ meme, tokenAddress }) => {
  const { address: userAddress } = useAccount();
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [stakeAction, setStakeAction] = useState<"stake" | "unstake">("stake");
  const toast = useCustomToast();
  const [jobStarted, setJobStarted] = useState(false);
  const {
    balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useTokenBalance({
    tokenAddress: tokenAddress || "",
    userAddress,
    enabled: !!userAddress && !!tokenAddress,
  });

  const formattedBalance = balance ? formatUnits(balance, 18) : "0";

  // Check if approval is needed
  const {
    needsApproval,
    isCheckingApproval,
    isApproving,
    approve,
    approvalError,
  } = useTokenApproval({
    tokenAddress: tokenAddress || "",
    amount: stakeAmount ? parseUnits(stakeAmount, 18) : 0n,
    enabled: !!tokenAddress && !!stakeAmount && !!userAddress,
  });
  // Check if user has already staked
  const {
    hasStaked,
    stakedAmount,
    isLoading: isLoadingStakeStatus,
    refetch: refetchStakeStatus,
  } = useHasStaked({
    userAddress,
    tokenAddress: tokenAddress || "",
    enabled: !!userAddress && !!tokenAddress,
  });


  const handleStakeAction = async (action: "stake" | "unstake") => {

    if (!userAddress || !tokenAddress) {
      toast.error("Error", {
        description: "Please connect your wallet",
      });
      return;
    }

    if (!stakeAmount || Number(stakeAmount) <= 0) {
      toast.error("Invalid Amount", {
        description: `Please enter a valid amount to ${action}`,
      });
      return;
    }


    const isStake = action === "stake";


    if (isStake && Number(stakeAmount) > Number(formattedBalance)) {
      toast.error("Not enough tokens", {
        description: `You don't have enough tokens to ${action}`,
      });
      return;
    }

    if (
      !isStake &&
      Number(stakeAmount) > Number(formatUnits(BigInt(stakedAmount), 18))
    ) {
      toast.error("Not enough tokens", {
        description: `You don't have enough tokens to ${action}`,
      });
      return;
    }

    try {
      if (isStake) {
        setIsStaking(true);
      } else {
        setIsUnstaking(true);
      }

      // Parse the amount to wei (assuming 18 decimals)
      const amountInWei = parseUnits(stakeAmount, 18);

      // Convert address to proper format
      const contractAddress = CONTRACTS.memedStaking as `0x${string}`;
      const formattedTokenAddress = tokenAddress as `0x${string}`;

      try {
        // First simulate the transaction to catch any potential errors
        const { request } = await simulateContract(config, {
          address: contractAddress,
          abi: memedStakingABI as Abi,
          functionName: isStake ? "stake" : "unstake",

          args: [formattedTokenAddress, amountInWei],
          account: userAddress as `0x${string}`,
        });

        // If simulation is successful, proceed with the actual transaction
        const hash = await writeContract(config, request);

        // Wait for transaction to be mined
        const receipt = await waitForTransactionReceipt(config, { hash });
        const isSuccess = receipt.status === "success";
        
        if (isSuccess) {
          const actionText = isStake ? "Staked" : "Unstaked";
          toast.success(`${actionText} Successfully`, {
            description: `You have ${actionText.toLowerCase()} ${stakeAmount} ${
              meme.ticker
            } tokens`,
          });
          setStakeAmount("");
          refetchStakeStatus();
          refetchBalance();
        } else {
          throw new Error("Transaction failed");
        }
      } catch (error) {
        console.error("Transaction simulation failed:", error);
        throw error; // Re-throw to be caught by the outer catch block
      }
    } catch (error: any) {
      const actionText = isStake ? "staking" : "unstaking";
      console.error(`${actionText} error:`, error);
      toast.error(
        `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Failed`,
        {
          description:
            error?.message || `An error occurred while ${actionText}`,
        }
      );
    } finally {
      setIsStaking(false);
      setIsUnstaking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              {hasStaked ? "Your Stake" : "Stake Your Tokens"}
            </h3>

            <p className="text-gray-600 mb-4">
              {hasStaked
                ? `You have staked ${formatUnits(BigInt(stakedAmount), 18)} ${
                    meme.ticker
                  } tokens. Manage your stake below.`
                : `Stake your ${meme.ticker} tokens to earn rewards when this meme goes viral. Staking represents your belief in this meme's potential.`}
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="stake-amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stake Amount ({meme.ticker})
                </label>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                  <span>Your balance:</span>
                  <span className="font-medium">
                    {isLoadingBalance ? (
                      <span className="inline-block h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      `${Number(formattedBalance).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })} ${meme.ticker}`
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    id="stake-amount"
                    type="number"
                    placeholder={`Enter amount to ${
                      hasStaked ? "stake/unstake" : "stake"
                    }`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="0"
                    step="0.000000000000000001"
                  />
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 hover:shadow-2xl w-full cursor-pointer"
                      onClick={async () => {

                        setStakeAction("stake");
                        setJobStarted(true); //this helps keep the button disabled in between approval and staking

                        const action = "stake";
                        setStakeAction(action);

                        if (needsApproval && !approvalError) {
                          try {
                            setJobStarted(true); //this helps keep the button disabled in between approval and staking
                            await approve();
                          } catch (error) {
                            console.error("Approval failed:", error);
                            setJobStarted(false);
                            return;
                          } finally {
                            setJobStarted(false);
                          }
                        }
                        await handleStakeAction(action);
                      }}
                      disabled={
                        isStaking ||
                        isApproving ||
                        isCheckingApproval ||
                        jobStarted ||
                        !stakeAmount ||
                        Number(stakeAmount) <= 0
                      }
                    >
                      {isStaking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Staking...
                        </>
                      ) : isApproving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        "Stake"
                      )}
                    </Button>
                    {hasStaked && (
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        onClick={async () => {
                          const action = "unstake";
                          setStakeAction(action);
                          await handleStakeAction(action);
                        }}
                        disabled={
                          isUnstaking ||
                          !stakeAmount ||
                          Number(stakeAmount) <= 0
                        }
                      >
                        {isUnstaking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Unstaking...
                          </>
                        ) : (
                          "Unstake"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <Info
                    size={16}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <div className="text-sm text-gray-600">
                    {hasStaked ? (
                      <>
                        <p className="mb-1">Your staking details:</p>
                        <ul className="space-y-1">
                          <li>
                            • Staked: {formatUnits(BigInt(stakedAmount), 18)}{" "}
                            {meme.ticker}
                          </li>
                          <li>
                            • Status:{" "}
                            <span className="text-green-600 font-medium">
                              Active
                            </span>
                          </li>
                          <li>• Rewards: Claimable soon</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="mb-1">Staking benefits:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Earn a share of fees from trading volume</li>
                          <li>
                            Receive bonus tokens when heat score increases
                          </li>
                          <li>Priority access to new features and battles</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              Recent Staking Rewards
            </h3>

            {(() => {
              

              return (
                <div className="space-y-4">
                  <StakingRewards ticker={meme.ticker as string} tokenAddress={meme.tokenAddress}/>
                  
                </div>
              );
            })()}

            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-primary mt-0.5" />
                <p className="text-sm text-gray-600">
                  Rewards are distributed based on your stake percentage and the
                  meme's performance. Higher heat scores lead to more frequent
                  rewards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemeStaking;
