import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, Loader2, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MemeDetails } from "@/app/types";
import { CompactCardSkeleton } from "../shared/skeletons/CompactCardSkeleton";
import { RewardCardSkeleton } from "../shared/skeletons/RewardCardSkeleton";

type ClaimedReward = {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenTicker: string;
  tokenImage: string;
  handle: string;
  amount: string;
  formattedAmount: string;
  claimTransactionHash: string;
  createdAt: string;
  claimedAt: string;
  type: "initial" | "engagement";
};

// Dummy data for claimed rewards history
const dummyClaimedRewards: ClaimedReward[] = [
  {
    id: "1",
    tokenAddress: "0x1234567890123456789012345678901234567890",
    tokenName: "Doge to the Moon",
    tokenTicker: "DOGE",
    tokenImage: "/fallback.png",
    handle: "CryptoMemer",
    amount: "2500000000000000000000", // 2500 tokens with 18 decimals
    formattedAmount: "2,500",
    claimTransactionHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    claimedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    type: "initial",
  },
  {
    id: "2",
    tokenAddress: "0x2345678901234567890123456789012345678901",
    tokenName: "Pepe's Adventure",
    tokenTicker: "PEPE",
    tokenImage: "/fallback.png",
    handle: "MemeKing",
    amount: "800000000000000000000", // 800 tokens with 18 decimals
    formattedAmount: "800",
    claimTransactionHash:
      "0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    claimedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    type: "engagement",
  },
  {
    id: "3",
    tokenAddress: "0x3456789012345678901234567890123456789012",
    tokenName: "Wojak's Feelings",
    tokenTicker: "WOJAK",
    tokenImage: "/fallback.png",
    handle: "EmotionMaster",
    amount: "1200000000000000000000", // 1200 tokens with 18 decimals
    formattedAmount: "1,200",
    claimTransactionHash:
      "0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    claimedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    type: "initial",
  },
  {
    id: "4",
    tokenAddress: "0x4567890123456789012345678901234567890123",
    tokenName: "Stonks Only Go Up",
    tokenTicker: "STONK",
    tokenImage: "/fallback.png",
    handle: "WallStreetBets",
    amount: "500000000000000000000", // 500 tokens with 18 decimals
    formattedAmount: "500",
    claimTransactionHash:
      "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    claimedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(), // 19 days ago
    type: "engagement",
  },
];

export default function RewardHistory({ rewards }: { rewards: MemeDetails[] }) {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("all");
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  type TabType = "all" | "initial" | "engagement";

  const [pages, setPages] = useState<Record<TabType, number>>({
    all: 1,
    initial: 1,
    engagement: 1,
  });
  const [hasMore, setHasMore] = useState<Record<TabType, boolean>>({
    all: true,
    initial: true,
    engagement: true,
  });
  const ITEMS_PER_PAGE = 10; // History uses groups of 10

  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    all: null,
    initial: null,
    engagement: null,
  });

  // Function to update the underline position based on the active tab
  const updateUnderlinePosition = useCallback(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const tabsListElement = tabsListRef.current;

    if (activeTabElement && tabsListElement) {
      const tabRect = activeTabElement.getBoundingClientRect();
      const listRect = tabsListElement.getBoundingClientRect();

      setUnderlineStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  // Update underline position on window resize
  useEffect(() => {
    window.addEventListener("resize", updateUnderlinePosition);
    return () => {
      window.removeEventListener("resize", updateUnderlinePosition);
    };
  }, [updateUnderlinePosition]);

  // Update underline position when active tab changes
  useEffect(() => {
    updateUnderlinePosition();
  }, [activeTab, updateUnderlinePosition]);

  // Fetch claimed rewards with pagination
  const fetchClaimedRewards = async (
    pageNum: number,
    tabType: TabType = "all",
    reset: boolean = false
  ) => {
    if (pageNum === 1) {
      setIsLoading(true);
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the appropriate data based on tab
    let sourceData = dummyClaimedRewards;
    if (tabType === "initial") {
      sourceData = dummyClaimedRewards.filter(
        (reward) => reward.type === "initial"
      );
    } else if (tabType === "engagement") {
      sourceData = dummyClaimedRewards.filter(
        (reward) => reward.type === "engagement"
      );
    }

    // Simulate paginated data fetch
    const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRewards = sourceData.slice(startIndex, endIndex);

    // Check if there are more items to load
    setHasMore((prev) => ({
      ...prev,
      [tabType]: endIndex < sourceData.length,
    }));

    if (reset) {
      setClaimedRewards(
        tabType === "all" ? paginatedRewards : sourceData.slice(0, endIndex)
      );
    } else {
      setClaimedRewards((prev) => [...prev, ...paginatedRewards]);
    }

    setPages((prev) => ({
      ...prev,
      [tabType]: pageNum,
    }));
    setIsLoading(false);
  };

  // Handle load more button click
  const handleLoadMore = () => {
    if (!isLoading && hasMore[activeTab as TabType]) {
      fetchClaimedRewards(
        pages[activeTab as TabType] + 1,
        activeTab as TabType
      );
    }
  };

  // Initialize claimed rewards on mount
  useEffect(() => {
    fetchClaimedRewards(1, "all", true);
  }, []);

  // Handle tab change
  useEffect(() => {
    if (!isLoading) {
      fetchClaimedRewards(1, activeTab as TabType, true);
    }
  }, [activeTab]);

  // Get explorer URL based on chain
  const getExplorerUrl = (txHash: string) => {
    return `https://explorer.lens.xyz/tx/${txHash}`;
  };

  // Format reward type for display
  const formatRewardType = (type: "initial" | "engagement") => {
    return type === "initial" ? "Initial Distribution" : "Engagement Reward";
  };

  if (isLoading && pages.all === 1) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <RewardCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!address) {
    return (
      <div className="p-6 text-center mt-8">
        <p className="text-gray-500">
          Connect your wallet to view reward history
        </p>
      </div>
    );
  }

  if (claimedRewards.length === 0) {
    return (
      <div className="p-6 text-center mt-8">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <h3 className="text-lg font-medium">No Claimed Rewards</h3>
        <p className="text-gray-500">Your claimed rewards will appear here</p>
      </div>
    );
  }


  return (
    <div>
      <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
        <div className="relative" ref={tabsListRef}>
          <TabsList className="w-full h-auto p-0 bg-transparent border-b border-gray-200">
            {["all"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-6 py-3 cursor-pointer hover:bg-secondary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary transition-colors"
                ref={(el) => {
                  tabRefs.current[tab] = el;
                }}
              >
                {tab === "all"
                  ? "All History"
                  : tab === "initial"
                    ? "Initial Rewards"
                    : "Engagement Rewards"}
              </TabsTrigger>
            ))}
          </TabsList>
          <div
            className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-in-out"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>

        <TabsContent value="all" className="mt-8">
          <div className="grid grid-cols-1 gap-6">
            {rewards.map((reward) => (
              <RewardHistoryCard key={reward._id} reward={reward} />
            ))}
          </div>
        </TabsContent>



        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="border-2 border-black text-black hover:bg-black cursor-pointer hover:text-white"
            onClick={handleLoadMore}
            disabled={isLoading || !hasMore[activeTab as TabType]}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : !hasMore[activeTab as TabType] ? (
              `No More ${activeTab === "initial"
                ? "Initial"
                : activeTab === "engagement"
                  ? "Engagement"
                  : "Reward"
              } History`
            ) : (
              `Load More ${activeTab === "initial"
                ? "Initial"
                : activeTab === "engagement"
                  ? "Engagement"
                  : "Reward"
              } History`
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  );
}

// Reward History Card Component
function RewardHistoryCard({ reward }: { reward: MemeDetails }) {
  // Format reward type for display
  const formatRewardType = (type: "initial" | "engagement") => {
    return type === "initial" ? "Initial Distribution" : "Engagement Reward";
  };

  // Get explorer URL based on chain
  const getExplorerUrl = (txHash: string) => {
    return `https://explorer.lens.xyz/tx/${txHash}`;
  };

  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${reward.image}` || "/fallback.png"}
            alt={reward.name}
            fill
            className="object-contain"
          />
        </div>

        <div className="flex-grow text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h3 className="font-bold">{reward.name}</h3>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 text-white bg-primary rounded-full">
              <Zap size={12} />
              <span className="font-bold">${reward.ticker}</span>
            </div>
          </div>

          <p className="text-lg font-bold text-primary">
            {Number(reward.amount).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 6
            })} {reward.ticker}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500 mt-1">
            <span className="hidden sm:inline">•</span>
            <span>From @{reward.handle}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              Claimed{" "}

            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <a
            href={getExplorerUrl(reward.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <CheckCircle className="w-4 h-4" />
            View Transaction
          </a>
        </div>
      </div>
    </div>
  );
}
