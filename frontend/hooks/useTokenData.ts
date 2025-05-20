import { useReadContract } from "wagmi";
import factoryABI from "@/config/factoryABI.json";
import CONTRACTS from "@/config/contracts";
import { Address, isAddress } from "viem";
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

  /**
   * Checks if the raw token data represents an empty or invalid token
   * Examples of invalid data:
   * - [0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,,,,,,0,0,0]
   * - Any array where addresses are zero addresses and strings are empty
   */
  const isEmptyData = (data: any[] | undefined): boolean => {
    if (!data || !Array.isArray(data) || data.length !== 10) {
      return true;
    }

    const [
      tokenAddress,
      creatorAddress,
      name,
      ticker,
      description,
      image,
      username,
      heat,
      lastRewardAt,
      createdAt,
    ] = data;

    // Check if token address is empty/zero address
    const isZeroAddress = (addr: any) =>
      !addr || addr === "0x0000000000000000000000000000000000000000";

    // Check addresses (first two items)
    if (isZeroAddress(tokenAddress) || isZeroAddress(creatorAddress)) {
      return true;
    }

    // Check strings (items 2-6)
    const hasEmptyStrings = [name, ticker, description, image, username].every(
      (str) => !str || str.trim() === ""
    );

    // If all strings are empty, consider it invalid data
    if (hasEmptyStrings) {
      return true;
    }

    // Important fields that should be present
    if (!tokenAddress || !creatorAddress || !name || !ticker) {
      return true;
    }

    return false;
  };

  // console.log(rawTokenData);
  // Safe type assertion with proper structure checking
  const transformedData: TokenData | null =
    rawTokenData &&
    Array.isArray(rawTokenData) &&
    rawTokenData.length === 10 &&
    !isEmptyData(rawTokenData)
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
