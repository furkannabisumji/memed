import { useReadContract } from "wagmi";
import factoryABI from "@/config/factoryABI.json";
import CONTRACTS from "@/config/contracts";
import { Address, erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

interface TokenSupply {
  totalSupply: bigint;
  circulatingSupply: bigint;
  maxSupply: bigint;
}

/**
 * Hook to read token supply information from the MemeFactory contract
 * @param lensUsername The Lens username to look up token supply for
 * @returns The token supply data and query status
 */
export const useTokenSupply = (tokenAddress: Address) => {
  const {
    data: totalSupply,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: "totalSupply",
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    data: formatEther((totalSupply as bigint) || 0n),
    isLoading,
  };
};
