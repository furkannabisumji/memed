"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useState } from "react";

// Define types for our API response
import { Meme } from "@/app/types";

interface MemesResponse {
  success: boolean;
  data: {
    tokens: Meme[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTokens: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

interface UseMemeOptions {
  initialLimit?: number;
  category?: "tokens" | "creators";
}

export const useMemes = ({
  initialLimit = 10,
  category = "tokens",
}: UseMemeOptions = {}) => {
  const [limit] = useState(initialLimit);

  const fetchMemes = async ({ pageParam = 1 }) => {
    try {
      // Log the full URL being requested for debugging
      const url = new URL(
        "/api/tokens",
        process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      );
      url.searchParams.append("page", pageParam.toString());
      url.searchParams.append("limit", limit.toString());

      const response = await axiosInstance.get<MemesResponse>("/api/tokens", {
        params: {
          page: pageParam,
          limit,
        },
      });

      return response.data.data;
    } catch (error) {
      // Return a default structure to prevent errors
      return {
        tokens: [],
        pagination: {
          currentPage: pageParam,
          totalPages: 0,
          totalTokens: 0,
          hasNextPage: false,
          hasPreviousPage: pageParam > 1,
        },
      };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["memes", category, limit],
    queryFn: fetchMemes,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten the pages array into a single array of memes
  const memes = data?.pages.flatMap((page) => page.tokens) || [];
  console.log(memes);
  return {
    memes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
    isPending,
  };
};
