"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useState } from "react";

// Define types for our API response
interface Token {
  tokenAddress: string;
  name: string;
  ticker: string;
  description: string;
  image: string;
  createdAt: string;
  totalDistributed: string;
}

export interface CreatorResponse {
  address: string;
  handle: string;
  tokens: Token[];
}

interface CreatorsResponse {
  success: boolean;
  data: {
    creators: CreatorResponse[];
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

export const useCreators = ({
  initialLimit = 10,
  category = "creators",
}: UseMemeOptions = {}) => {
  const [limit] = useState(initialLimit);

  const fetchMemes = async ({ pageParam = 1 }) => {
    try {
      // Log the full URL being requested for debugging
      const url = new URL(
        "/api/creators",
        process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin
      );
      url.searchParams.append("page", pageParam.toString());
      url.searchParams.append("limit", limit.toString());

      const response = await axiosInstance.get<CreatorsResponse>(
        "/api/creators",
        {
          params: {
            page: pageParam,
            limit,
          },
        }
      );

      // Return the nested data structure that contains both creators and pagination
      return response.data.data;
    } catch (error) {
      console.error("Error fetching creators:", error);
      // Return a default structure to prevent errors with the same structure as success
      return {
        creators: [],
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
    queryKey: ["creators", category, limit],
    queryFn: fetchMemes,
    getNextPageParam: (lastPage) => {
      // Add null check to prevent the error
      if (!lastPage || !lastPage.pagination) {
        return undefined;
      }
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten the pages array into a single array of creators
  const creators = data?.pages.flatMap((page) => page.creators || []) || [];

  return {
    creators,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
    isPending,
  };
};
