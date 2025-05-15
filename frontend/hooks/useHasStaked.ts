import { useReadContract } from "wagmi";
import { Address, isAddress } from "viem";
import CONTRACTS from "@/config/contracts";
import memedStakingABI from "@/config/memedStakingABI.json";

// The return type from the stakes function is a tuple [amount: bigint, reward: bigint]
type StakesResult = [bigint, bigint];

export function useHasStaked({
  userAddress,
  tokenAddress,
  enabled = true,
}: {
  userAddress?: Address | string | null;
  tokenAddress?: Address | string | null;
  enabled?: boolean;
}) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.memedStaking as Address,
    abi: memedStakingABI,
    functionName: "stakes",
    args: [
      tokenAddress
        ? ((tokenAddress.startsWith("0x")
            ? tokenAddress
            : `0x${tokenAddress}`) as Address)
        : ("0x0000000000000000000000000000000000000000" as Address),
      userAddress as Address,
    ],
    query: {
      enabled:
        enabled &&
        !!userAddress &&
        !!tokenAddress &&
        isAddress(userAddress as string) &&
        isAddress(tokenAddress as string),
    },
  });

  // Check if the user has staked any amount
  const stakesResult = data as StakesResult | undefined;
  const hasStaked = stakesResult ? stakesResult[0] > BigInt(0) : false;
  const stakedAmount = stakesResult ? stakesResult[0].toString() : "0";

  return {
    hasStaked,
    stakedAmount,
    rewardAmount: stakesResult ? stakesResult[1].toString() : "0",
    isLoading,
    error,
    refetch,
  };
}
