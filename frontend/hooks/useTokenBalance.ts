import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";

interface UseTokenBalanceProps {
  tokenAddress: string;
  userAddress?: string;
  enabled?: boolean;
}

export function useTokenBalance({
  tokenAddress,
  userAddress,
  enabled = true,
}: UseTokenBalanceProps) {
  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress as Address],
    query: {
      enabled: !!userAddress && !!tokenAddress && enabled,
    },
  });

  return {
    balance,
    formatted: balance ? balance.toString() : "0",
    isLoading,
    error,
    refetch,
  };
}
