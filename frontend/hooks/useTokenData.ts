import { useReadContract } from "wagmi";
import factoryABI from "@/config/factoryABI.json";
import CONTRACTS from "@/config/contracts";
import { Address } from "viem";
import { TokenData } from "@/app/types";

/**
 * Hook to read token data from the MemeFactory contract
 * @param lensUsername The Lens username to look up token data for
 * @returns The token data and query status
 */
export const useTokenData = (lensUsername?: string) => {
  const isEnabled = Boolean(lensUsername && lensUsername.trim().length > 0);

  const {
    data: rawTokenData,
    isPending,
    isError,
    error,
    refetch,
  } = useReadContract({
    abi: factoryABI,
    address: CONTRACTS.factory as Address,
    functionName: "tokenData",
    args: isEnabled ? [lensUsername] : undefined,
    query: {
      enabled: isEnabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Safe type assertion with proper structure checking
  const transformedData: TokenData | null =
    rawTokenData && Array.isArray(rawTokenData) && rawTokenData.length === 10
      ? {
          token: rawTokenData[0] as Address,
          creator: rawTokenData[1] as Address,
          name: rawTokenData[2] as string,
          ticker: rawTokenData[3] as string,
          description: rawTokenData[4] as string,
          image: rawTokenData[5] as string,
          lensUsername: rawTokenData[6] as string,
          heat: rawTokenData[7] as bigint,
          lastRewardAt: rawTokenData[8] as bigint,
          createdAt: rawTokenData[9] as bigint,
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
