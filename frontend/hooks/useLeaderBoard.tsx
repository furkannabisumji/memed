import { useState, useEffect } from "react";
import { readContract, readContracts } from "@wagmi/core";
import factoryABI from "@/config/factoryABI.json";
import CONTRACTS from "@/config/contracts";
import { Address } from "viem";
import { config } from "@/providers/Web3Provider";
import { Account, TokenData } from "@/app/types";
import axiosInstance from "@/lib/axios";
import { getAccountByAddress, getAccountByUsername } from "@/lib/lens";

// Define the actual API response structure based on your data
interface Token {
  _id: string;
  handle: string;
  createdAt: string;
  creator: Address;
  description: string;
  image: string;
  lastRewardDistribution: string;
  likesCount: number;
  name: string;
  ticker: string;
  tokenAddress: string;
  totalDistributed: string;
}

interface TokensResponse {
  data: {
    tokens: Token[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTokens: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Define the MemeWithTokenData type which combines Token and TokenData
export type MemeWithTokenData = Token & {
  tokenData: TokenData | null;
};

// Define the leaderboard data structure
export interface LeaderboardData {
  topMemes: MemeWithTokenData[];
  topCreators: {
    creator: Address;
    totalHeat: bigint;
    memeCount: number;
    memes: MemeWithTokenData[];
    creatorData: Account | null;
  }[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  fetchStatus: "idle" | "loading" | "succeeded" | "failed" | "retrying";
  retryCount: number;
  maxRetries: number;
}

/**
 * Hook to fetch all memes and their token data, and sort them by heat to create leaderboards
 * @param options Configuration options for the hook
 * @returns Leaderboard data containing sorted top memes and top creators
 */
export const useLeaderboard = (
  options = {
    maxRetries: 3,
    retryDelay: 3000,
    batchSize: 5,
    requireBlockchainData: true,
  }
): LeaderboardData => {
  const [memes, setMemes] = useState<MemeWithTokenData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [topMemesState, setTopMemesState] = useState<MemeWithTokenData[]>([]);
  const [topCreatorsState, setTopCreatorsState] = useState<any[]>([]);
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed" | "retrying"
  >("idle");
  const [retryCount, setRetryCount] = useState<number>(0);
  const { maxRetries, retryDelay, batchSize, requireBlockchainData } = options;

  useEffect(() => {
    const fetchMemesAndTokenData = async () => {
      try {
        setIsLoading(true);
        setFetchStatus("loading");

        // Fetch all tokens from the API
        const response = await axiosInstance.get<TokensResponse>("/api/tokens");
        const fetchedTokens = response.data.data.tokens;

        if (fetchedTokens.length === 0) {
          setIsLoading(false);
          setIsError(true);
          setError(new Error("No tokens found"));
          setFetchStatus("failed");
          return;
        }

        // Filter tokens with valid addresses
        const validTokens = fetchedTokens.filter((token) => token.tokenAddress);

        // Initialize memes with token data set to null
        const memesWithTokenData: MemeWithTokenData[] = fetchedTokens.map(
          (token) => ({
            ...token,
            tokenData: null,
          })
        );

        // Process in batches
        let hasBlockchainData = false;
        for (let i = 0; i < validTokens.length; i += batchSize) {
          const batchTokens = validTokens.slice(i, i + batchSize);

          try {
            // Create contract read requests for this batch
            const contractReadResults = await readContracts(config, {
              contracts: batchTokens.map((token) => ({
                address: CONTRACTS.factory as Address,
                abi: factoryABI as any,
                functionName: "tokenData",
                args: [token.handle],
              })),
            });

            // Process results from this batch
            batchTokens.forEach((token, batchIndex) => {
              const rawTokenData = contractReadResults[batchIndex].result;
              const mainIndex = memesWithTokenData.findIndex(
                (t) => t.handle === token.handle
              );

              if (
                mainIndex !== -1 &&
                rawTokenData &&
                Array.isArray(rawTokenData) &&
                rawTokenData.length === 10
              ) {
                const tokenData: TokenData = {
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
                };

                memesWithTokenData[mainIndex] = {
                  ...memesWithTokenData[mainIndex],
                  tokenData,
                };
                hasBlockchainData = true;
              } else {
                console.warn(
                  `Invalid token data for ${token.handle}:`,
                  rawTokenData
                );
              }
            });

            // Small delay between batches to avoid overwhelming the RPC
            if (i + batchSize < validTokens.length) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (batchError) {
            console.error(
              `Error processing batch ${i} to ${i + batchSize}:`,
              batchError
            );

            // For failed batches, try individual requests as fallback
            for (const token of batchTokens) {
              try {
                const mainIndex = memesWithTokenData.findIndex(
                  (t) => t.handle === token.handle
                );
                if (mainIndex === -1) continue;

                const rawTokenData = await readContract(config, {
                  abi: factoryABI,
                  address: CONTRACTS.factory as Address,
                  functionName: "tokenData",
                  args: [token.handle],
                });

                if (
                  rawTokenData &&
                  Array.isArray(rawTokenData) &&
                  rawTokenData.length === 10
                ) {
                  const tokenData: TokenData = {
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
                  };

                  memesWithTokenData[mainIndex] = {
                    ...memesWithTokenData[mainIndex],
                    tokenData,
                  };
                  hasBlockchainData = true;
                }

                // Small delay between individual requests
                await new Promise((resolve) => setTimeout(resolve, 200));
              } catch (individualError) {
                console.error(
                  `Error processing individual token ${token.handle}:`,
                  individualError
                );
              }
            }
          }
        }

        // Count how many tokens have valid token data
        const tokensWithData = memesWithTokenData.filter(
          (meme) => meme.tokenData !== null
        );

        // Set state with the fetched data
        setMemes(memesWithTokenData);

        // Check if we have blockchain data and if we require it
        if (!hasBlockchainData && requireBlockchainData) {
          if (retryCount < maxRetries) {
            console.log(
              `No blockchain data found. Retrying (${
                retryCount + 1
              }/${maxRetries})...`
            );
            setRetryCount((prev) => prev + 1);
            setFetchStatus("retrying");

            // Retry after delay
            setTimeout(() => {
              fetchMemesAndTokenData();
            }, retryDelay);

            return;
          } else {
            console.error(
              "Failed to fetch blockchain data after maximum retries"
            );
            setIsError(true);
            setError(
              new Error("Failed to fetch blockchain data after maximum retries")
            );
            setFetchStatus("failed");
            setIsLoading(false);
            return;
          }
        }

        // Process the data for leaderboards
        await processLeaderboardData(memesWithTokenData);

        setFetchStatus("succeeded");
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tokens:", err);
        setIsError(true);
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        setFetchStatus("failed");
        setIsLoading(false);
      }
    };

    fetchMemesAndTokenData();
  }, []); // Dependencies array is empty to run only once on mount

  // Process leaderboard data from the memes
  const processLeaderboardData = async (memesData: MemeWithTokenData[]) => {
    // Filter out memes without token data
    const validMemes = memesData.filter((meme) => meme.tokenData !== null);

    if (validMemes.length === 0) {
      console.warn(
        "No valid memes with token data found. Check if token data is being fetched correctly."
      );

      // Set empty states instead of using fallback
      setTopMemesState([]);
      setTopCreatorsState([]);
      return;
    }

    // Sort memes by heat (descending)
    const sortedMemes = [...validMemes].sort((a, b) => {
      const heatA = a.tokenData?.heat || BigInt(0);
      const heatB = b.tokenData?.heat || BigInt(0);
      return heatB > heatA ? 1 : heatB < heatA ? -1 : 0;
    });

    setTopMemesState(sortedMemes);

    // Group memes by creator and calculate total heat per creator
    const creatorMap = new Map<
      string,
      {
        creator: Address;
        totalHeat: bigint;
        memeCount: number;
        memes: MemeWithTokenData[];
        creatorData: Account | null;
      }
    >();

    // First collect all memes by creator
    validMemes.forEach((meme) => {
      if (!meme.tokenData) return;

      const creatorAddress = meme.tokenData.creator;
      if (!creatorAddress) {
        return;
      }

      const heat = meme.tokenData.heat || BigInt(0);

      if (!creatorMap.has(creatorAddress)) {
        creatorMap.set(creatorAddress, {
          creator: creatorAddress,
          totalHeat: BigInt(0),
          memeCount: 0,
          memes: [],
          creatorData: null,
        });
      }

      const creatorData = creatorMap.get(creatorAddress)!;
      creatorData.totalHeat += heat;
      creatorData.memeCount += 1;
      creatorData.memes.push(meme);
    });

    // Then fetch creator data for each unique creator
    const creatorAddresses = Array.from(creatorMap.keys());
    for (const address of creatorAddresses) {
      try {
        const creatorEntry = creatorMap.get(address);
        if (!creatorEntry?.memes[0]?.handle) continue;

        const accountData = await getAccountByUsername(
          creatorEntry.memes[0].handle as string
        );
        if (creatorEntry) {
          creatorEntry.creatorData = accountData as Account;
        }
      } catch (error) {
        console.error(`Failed to fetch creator data for ${address}:`, error);
      }
    }

    // Sort creators by total heat (descending)
    const sortedCreators = Array.from(creatorMap.values()).sort((a, b) =>
      b.totalHeat > a.totalHeat ? 1 : b.totalHeat < a.totalHeat ? -1 : 0
    );

    setTopCreatorsState(sortedCreators);
  };

  return {
    topMemes: topMemesState,
    topCreators: topCreatorsState,
    isLoading,
    isError,
    error,
    fetchStatus,
    retryCount,
    maxRetries,
  };
};
