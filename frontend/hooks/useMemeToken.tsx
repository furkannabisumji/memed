"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Meme } from "@/app/types";

interface MemeTokenResponse {
  success: boolean;
  data: Meme;
}

/**
 * Hook to fetch a single meme token by its address
 * @param tokenAddress The address of the token to fetch
 * @returns Query result containing the meme token data
 */
export const useMemeToken = (tokenAddress: string | null) => {
  return useQuery({
    queryKey: ["memeToken", tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) {
        throw new Error("Token address is required");
      }

      try {
        const response = await axiosInstance.get<MemeTokenResponse>(
          `/api/tokens/${tokenAddress}`
        );
        return response.data.data;
      } catch (error) {
        console.error(`Error fetching token ${tokenAddress}:`, error);
        throw error;
      }
    },
    enabled: !!tokenAddress, // Only run the query if tokenAddress is provided
  });
};
