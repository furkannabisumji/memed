import { useReadContract } from "wagmi";
import factoryABI from "@/config/factoryABI.json";
import CONTRACTS from "@/config/contracts";
import { Address } from "viem";
import { useAccount } from "wagmi";

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
export const useTokenSupply = (lensUsername?: string) => {
  const { address: account } = useAccount();
  const isEnabled = Boolean(lensUsername && lensUsername.trim().length > 0);

  const {
    data: rawSupplyData,
    isPending,
    isError,
    error,
    refetch,
  } = useReadContract({
    abi: factoryABI,
    address: CONTRACTS.factory as Address,
    functionName: "tokenSupply",
    args: isEnabled ? [lensUsername] : undefined,
    query: {
      enabled: isEnabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Safe type assertion with proper structure checking
  const transformedData: TokenSupply | null =
    rawSupplyData && Array.isArray(rawSupplyData) && rawSupplyData.length === 3
      ? {
          totalSupply: rawSupplyData[0] as bigint,
          circulatingSupply: rawSupplyData[1] as bigint,
          maxSupply: rawSupplyData[2] as bigint,
        }
      : null;

  return {
    data: transformedData,
    isPending,
    isError,
    error,
    refetch,
  };
};
