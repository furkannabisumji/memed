"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useAccountStore } from "@/store/accountStore";
import { useConnectKitSign } from "@/hooks/useConnectKitSign";
import { useCustomToast } from "@/components/ui/custom-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Gift,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import RewardHistory from "@/components/rewards/RewardHistory";
import { claimReward } from "@/utils/blockchainServices";
import { useClaimData } from "@/hooks/rewards/useClaimData";
import { ClaimProof, MemeDetails } from "../types";
import { useRecordClaim } from "@/hooks/rewards/useRecordClaim";
import { WalletClient } from "viem";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

type RewardToken = {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenTicker: string;
  tokenImage: string;
  handle: string;
  amount: string;
  formattedAmount: string;
  type: "initial" | "engagement";
  createdAt: string;
};

// Dummy data for available rewards
const dummyAvailableReward = [
  {
    id: "1",
    tokenAddress: "0x1234567890123456789012345678901234567890",
    tokenName: "Doge to the Moon",
    tokenTicker: "DOGE",
    tokenImage: "/fallback.png",
    handle: "CryptoMemer",
    amount: "5000000000000000000000", // 5000 tokens with 18 decimals
    formattedAmount: "5,000",
    type: "initial",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "2",
    tokenAddress: "0x2345678901234567890123456789012345678901",
    tokenName: "Pepe's Adventure",
    tokenTicker: "PEPE",
    tokenImage: "/fallback.png",
    handle: "MemeKing",
    amount: "1200000000000000000000", // 1200 tokens with 18 decimals
    formattedAmount: "1,200",
    type: "engagement",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "3",
    tokenAddress: "0x3456789012345678901234567890123456789012",
    tokenName: "Wojak's Feelings",
    tokenTicker: "WOJAK",
    tokenImage: "/fallback.png",
    handle: "EmotionMaster",
    amount: "750000000000000000000", // 750 tokens with 18 decimals
    formattedAmount: "750",
    type: "engagement",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "4",
    tokenAddress: "0x4567890123456789012345678901234567890123",
    tokenName: "Stonks Only Go Up",
    tokenTicker: "STONK",
    tokenImage: "/fallback.png",
    handle: "WallStreetBets",
    amount: "3500000000000000000000", // 3500 tokens with 18 decimals
    formattedAmount: "3,500",
    type: "initial",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "5",
    tokenAddress: "0x5678901234567890123456789012345678901234",
    tokenName: "This is Fine",
    tokenTicker: "FINE",
    tokenImage: "/fallback.png",
    handle: "FireMemer",
    amount: "900000000000000000000", // 900 tokens with 18 decimals
    formattedAmount: "900",
    type: "engagement",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
  {
    id: "6",
    tokenAddress: "0x6789012345678901234567890123456789012345",
    tokenName: "Moon Lambo",
    tokenTicker: "LAMBO",
    tokenImage: "/fallback.png",
    handle: "CryptoWhale",
    amount: "2500000000000000000000", // 2500 tokens with 18 decimals
    formattedAmount: "2,500",
    type: "initial",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
  {
    id: "7",
    tokenAddress: "0x7890123456789012345678901234567890123456",
    tokenName: "Diamond Hands",
    tokenTicker: "DHAND",
    tokenImage: "/fallback.png",
    handle: "HODLer",
    amount: "800000000000000000000", // 800 tokens with 18 decimals
    formattedAmount: "800",
    type: "engagement",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "8",
    tokenAddress: "0x8901234567890123456789012345678901234567",
    tokenName: "Wen Moon",
    tokenTicker: "MOON",
    tokenImage: "/fallback.png",
    handle: "MoonBoy",
    amount: "1800000000000000000000", // 1800 tokens with 18 decimals
    formattedAmount: "1,800",
    type: "initial",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: "9",
    tokenAddress: "0x9012345678901234567890123456789012345678",
    tokenName: "Wojak Crying",
    tokenTicker: "CRY",
    tokenImage: "/fallback.png",
    handle: "SadTrader",
    amount: "650000000000000000000", // 650 tokens with 18 decimals
    formattedAmount: "650",
    type: "engagement",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "10",
    tokenAddress: "0xa123456789012345678901234567890123456789",
    tokenName: "Pump It",
    tokenTicker: "PUMP",
    tokenImage: "/fallback.png",
    handle: "BogdanoffTwin",
    amount: "4200000000000000000000", // 4200 tokens with 18 decimals
    formattedAmount: "4,200",
    type: "initial",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
  },
  {
    id: "11",
    tokenAddress: "0xb234567890123456789012345678901234567890",
    tokenName: "Chad Trader",
    tokenTicker: "CHAD",
    tokenImage: "/fallback.png",
    handle: "AlphaMemer",
    amount: "950000000000000000000", // 950 tokens with 18 decimals
    formattedAmount: "950",
    type: "engagement",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "12",
    tokenAddress: "0xc345678901234567890123456789012345678901",
    tokenName: "Buy The Dip",
    tokenTicker: "DIP",
    tokenImage: "/fallback.png",
    handle: "DipBuyer",
    amount: "1500000000000000000000", // 1500 tokens with 18 decimals
    formattedAmount: "1,500",
    type: "initial",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
  },
  {
    id: "13",
    tokenAddress: "0xd456789012345678901234567890123456789012",
    tokenName: "NFT Ape",
    tokenTicker: "APE",
    tokenImage: "/fallback.png",
    handle: "NFTCollector",
    amount: "3300000000000000000000", // 3300 tokens with 18 decimals
    formattedAmount: "3,300",
    type: "initial",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: "14",
    tokenAddress: "0xe567890123456789012345678901234567890123",
    tokenName: "Rug Pull",
    tokenTicker: "RUG",
    tokenImage: "/fallback.png",
    handle: "SafeDeveloper",
    amount: "700000000000000000000", // 700 tokens with 18 decimals
    formattedAmount: "700",
    type: "engagement",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
  {
    id: "15",
    tokenAddress: "0xf678901234567890123456789012345678901234",
    tokenName: "FOMO Sapiens",
    tokenTicker: "FOMO",
    tokenImage: "/fallback.png",
    handle: "LateInvestor",
    amount: "1100000000000000000000", // 1100 tokens with 18 decimals
    formattedAmount: "1,100",
    type: "engagement",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: "16",
    tokenAddress: "0xf789012345678901234567890123456789012345",
    tokenName: "Giga Brain",
    tokenTicker: "BRAIN",
    tokenImage: "/fallback.png",
    handle: "CryptoGenius",
    amount: "2800000000000000000000", // 2800 tokens with 18 decimals
    formattedAmount: "2,800",
    type: "initial",
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days ago
  },
  {
    id: "17",
    tokenAddress: "0xf890123456789012345678901234567890123456",
    tokenName: "Not Financial Advice",
    tokenTicker: "NFA",
    tokenImage: "/fallback.png",
    handle: "CryptoInfluencer",
    amount: "1700000000000000000000", // 1700 tokens with 18 decimals
    formattedAmount: "1,700",
    type: "engagement",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
  },
];

const getMemeInfo = (tokenAddress: string): Promise<{ name: string; description: string; image: string; handle: string; }> => {
  return axiosInstance.get(`/tokens/${tokenAddress}`)
    .then((res) => res.data)
    .catch((error) => {
      const axiosErr = error as AxiosError<{ message?: string }>;
      const message =
        axiosErr.response?.data?.message || axiosErr.message || "Failed to fetch Claims";

      throw new Error(message);
    })
}
export default function RewardsPage() {
  const { address } = useAccount();
  const { selectedAccount } = useAccountStore();
  const { signWithConnectKit } = useConnectKitSign();
  const toast = useCustomToast();
  const { data } = useWalletClient()

  const walletClient = data as WalletClient;
  // Fetch Rewards
  const {
    data: fetchedrewards,
    isLoading: REWARDS_LOADING,
  } = useClaimData(address);

  // Fetch Meme Detail

  // Record Claim
  const {
    mutate: recordClaim
  } = useRecordClaim()


  useEffect(() => {
    if (fetchedrewards) {
      console.log("Fetched Rewards: ", fetchedrewards)
    }
  }, [fetchedrewards])

  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<MemeDetails[]>([]);
  const [claimingToken, setClaimingToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  type TabType = "available" | "initial" | "engagement";

  const [pages, setPages] = useState<Record<TabType, number>>({
    available: 1,
    initial: 1,
    engagement: 1,
  });
  const [hasMore, setHasMore] = useState<Record<TabType, boolean>>({
    available: true,
    initial: true,
    engagement: true,
  });
  const ITEMS_PER_PAGE = 8;

  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    available: null,
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

  // Function to fetch available rewards
  const fetchRewards = async (
    pageNum: number,
    tabType: TabType = "available",
    reset: boolean = false
  ) => {
    if (pageNum === 1) {
      setIsLoading(true);
    }

    // Simulate API delay
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the appropriate data based on tab
    if (fetchedrewards == null) {
      setIsLoading(false)
      return;
    }
    let sourceData = fetchedrewards;
    if (tabType === "initial") {
      sourceData = fetchedrewards.filter((reward) => reward.type === "initial");
    } else if (tabType === "engagement") {
      sourceData = fetchedrewards.filter((reward) => reward.type === "engagement");
    }

    // Simulate paginated data fetch
    const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRewards = sourceData.slice(startIndex, endIndex);

    // Fetch meme info for each reward handle concurrently
    const rewardsWithDetails = await Promise.all(
      paginatedRewards.map(async (reward: ClaimProof) => {
        // Fetch meme info for the handle
        const memeInfo = await getMemeInfo(reward.token); // Assuming `getMemeInfoByHandle` is a function that fetches meme info by handle
        return {
          ...reward, // Retain all the reward properties
          ...memeInfo,  // Add fetched meme info
        };
      })
    );

    // Check if there are more items to load
    setHasMore((prev) => ({
      ...prev,
      [tabType]: endIndex < sourceData.length,
    }));

    if (reset) {
      if (tabType === "available") {
        setRewards(rewardsWithDetails);
      } else {
        const sliced = sourceData.slice(0, endIndex);
        const detailedSliced = await Promise.all(
          sliced.map(async (reward: ClaimProof) => {
            const memeInfo = await getMemeInfo(reward.token);
            return { ...reward, ...memeInfo };
          })
        );
        setRewards(detailedSliced);
      }
    } else {
      setRewards((prev) => [...prev, ...rewardsWithDetails]);
    }


    setPages((prev) => ({
      ...prev,
      [tabType]: pageNum,
    }));
    setIsLoading(false);
  };

  // Initialize rewards on mount
  useEffect(() => {
    if (address) {
      fetchRewards(1, "available", true);
    } else {
      setIsLoading(false);
      setRewards([]);
    }
  }, [address]);

  // Handle tab change
  useEffect(() => {
    if (address && !isLoading) {
      fetchRewards(1, activeTab as TabType, true);
    }
  }, [activeTab, address]);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
  const handleClaim = async ({ tokenAddress, amount, index, proof }: {
    tokenAddress: string, amount: string, index: number, proof: string[]
  }) => {

    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setClaimingToken(tokenAddress);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const claimRewardArgs = {
        walletClient,
        userAddress: address,
        contractAddress,
        tokenAddress,
        amount,
        index,
        proof
      }
      // On chain transaction
      const tx = await claimReward(claimRewardArgs)

      await recordClaim({
        amount: claimRewardArgs.amount,
        tokenAddress: claimRewardArgs.tokenAddress,
        transactionHash: tx,
        userAddress: claimRewardArgs.userAddress
      })

      // Find the token data
      const tokenData = rewards.find((r) => r.token === tokenAddress);
      if (!tokenData) {
        throw new Error("Token data not found");
      }

      // Success - update UI
      toast.success(
        `Successfully claimed ${tokenData.amount} ${tokenData.tokenTicker}`
      );

      // Remove the claimed token from the list
      setRewards(rewards.filter((r) => r.token !== tokenAddress));
    } catch (error) {
      console.error("Claim error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim rewards"
      );
    } finally {
      setClaimingToken(null);
    }
  };

  // Handle load more button click
  const handleLoadMore = () => {
    if (!isLoading && hasMore[activeTab as TabType]) {
      fetchRewards(pages[activeTab as TabType] + 1, activeTab as TabType);
    }
  };

  // Filter rewards by type
  const initialRewards = rewards.filter((reward) => reward.type === "initial");
  const engagementRewards = rewards.filter(
    (reward) => reward.type === "engagement"
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white md:mt-20">
        <div className="md:px-20 px-5 py-12 mx-auto">
          <h1 className="mb-8 md:text-6xl text-3xl font-bold text-black font-clash">
            Your Rewards
          </h1>
          <div className="flex flex-col gap-4 mb-8 md:flex-row">
            <div className="relative flex-1 justify-center item-center">
              <Search className="absolute top-[25%] left-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by token name or symbol..."
                className="pl-10 bg-white border-2 border-black"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 border-2 border-black text-black hover:bg-black hover:text-white"
            >
              <Filter size={16} />
              <span>Filters</span>
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 hover:shadow-2xl">
              <TrendingUp size={16} />
              <span>Highest Value</span>
            </Button>
          </div>
          <Tabs
            defaultValue="available"
            className="mb-8"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="relative" ref={tabsListRef}>
              <TabsList className="w-full h-auto p-0 bg-transparent border-b border-gray-200">
                {["available", "initial", "engagement"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-6 py-3 cursor-pointer hover:bg-secondary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary transition-colors"
                    ref={(el) => {
                      tabRefs.current[tab] = el;
                    }}
                  >
                    {tab === "available"
                      ? "All Rewards"
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

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading your rewards...</p>
              </div>
            ) : !address ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="w-12 h-12 mb-4 text-amber-500" />
                <h2 className="mb-2 text-2xl font-bold">Connect Your Wallet</h2>
                <p className="mb-6 text-gray-600">
                  Connect your wallet to view and claim your rewards.
                </p>
              </div>
            ) : rewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gift className="w-12 h-12 mb-4 text-gray-400" />
                <h2 className="mb-2 text-2xl font-bold">No Rewards Yet</h2>
                <p className="mb-6 text-gray-600">
                  You don't have any unclaimed rewards at the moment.
                </p>
                <Link href="/explore">
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    Explore Memes
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <TabsContent value="available" className="mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rewards.map((reward) => (
                      <RewardCard
                        key={reward.id}
                        reward={reward}
                        onClaim={handleClaim}
                        isClaiming={claimingToken === reward.token}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="initial" className="mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {initialRewards.length > 0 ? (
                      initialRewards.map((reward) => (
                        <RewardCard
                          key={reward.id}
                          reward={reward}
                          onClaim={handleClaim}
                          isClaiming={claimingToken === reward.token}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500">
                          No initial rewards available
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="engagement" className="mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {engagementRewards.length > 0 ? (
                      engagementRewards.map((reward) => (
                        <RewardCard
                          key={reward.id}
                          reward={reward}
                          onClaim={handleClaim}
                          isClaiming={claimingToken === reward.token}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500">
                          No engagement rewards available
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
          {/* Load more button - specific to selected tab */}
          {address && rewards.length > 0 && (
            <div className="flex justify-end mt-12">
              <Button
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white cursor-pointer"
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
                      : ""
                  } Rewards`
                ) : (
                  `Load More ${activeTab === "initial"
                    ? "Initial"
                    : activeTab === "engagement"
                      ? "Engagement"
                      : ""
                  } Rewards`
                )}
              </Button>
            </div>
          )}
          {/* History section */}
          {address && !isLoading && rewards.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-3xl font-bold">Reward History</h2>
              <RewardHistory />
            </div>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}

// Reward Card Component
function RewardCard({
  reward,
  onClaim,
  isClaiming,
}: {
  reward: MemeDetails;
  onClaim: ({ tokenAddress, amount, index, proof }: {
    tokenAddress: string, amount: string, index: number, proof: string[]
  }) => void;
  isClaiming: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-md transition-all duration-300 bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]">
      <div className="flex">
        {/* Left side - Image */}
        <div className="w-20 h- flex-shrink-0 border-r-2 b">
          <Image
            src={reward.image || "/fallback.png"}
            alt={reward.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-bold text-black">
                {reward.name}
              </h3>
              <p className="text-xs text-gray-600">@{reward.handle}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {reward.type === "initial" ? "Initial" : "Engagement"}
                </p>
                <p className="text-sm font-bold text-primary">
                  {reward.amount} {reward.tokenTicker}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 text-white bg-primary rounded-full text-xs">
                <Zap size={10} />
                <span className="font-bold">${reward.tokenTicker}</span>
              </div>

              <Button
                onClick={() => onClaim({ amount: reward.amount, index: reward.index, proof: reward.proof, tokenAddress: reward.token, })}
                className="gap-1 bg-primary hover:bg-primary/90 h-8 px-3 py-1 text-xs"
                disabled={isClaiming}
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="w-3 h-3" />
                    Claim
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
