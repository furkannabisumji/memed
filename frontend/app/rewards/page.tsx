"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";

import { useCustomToast } from "@/components/ui/custom-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gift, AlertCircle, Search, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import RewardHistory from "@/components/rewards/RewardHistory";

import { useClaimData } from "@/hooks/rewards/useClaimData";
import { ClaimProof, MemeDetails } from "../types";
import { Abi, parseUnits } from "viem";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { TransactionType, useChainSwitch } from "@/hooks/useChainSwitch";
import { chains } from "@lens-chain/sdk/viem";
import CONTRACTS from "@/config/contracts";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@/providers/Web3Provider";

import EngageToEarn from "@/config/memedEngageToEarnABI.json";
import { RewardCardSkeleton } from "@/components/shared/skeletons/RewardCardSkeleton";
import { useQueryClient } from "@tanstack/react-query";

const getMemeInfo = (
  tokenAddress: string
): Promise<{
  name: string;
  description: string;
  image: string;
  handle: string;
  ticker: string;
}> => {
  return axiosInstance
    .get(`/api/tokens/${tokenAddress}`)
    .then((res) => res.data.data)
    .catch((error) => {
      const axiosErr = error as AxiosError<{ message?: string }>;
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        "Failed to fetch Claims";

      throw new Error(message);
    });
};

export default function RewardsPage() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const toast = useCustomToast();

  // Fetch Rewards
  const { data: fetchedrewards, isLoading: REWARDS_LOADING } =
    useClaimData(address);

  // Fetch Meme Detail
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<MemeDetails[]>([]);
  const [searchRewards, setSearchRewards] = useState<MemeDetails[]>([]);
  const [claimingToken, setClaimingToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const { chain, switchToChain } = useChainSwitch();
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

  //check chain
  useEffect(() => {
    //switch to mainnet
    if (chain && chain?.id !== chains.mainnet.id) {
      switchToChain(TransactionType.accountCreation);
    }
  }, [chain, switchToChain]);

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
      console.log(fetchedrewards + `is null`);
      setIsLoading(false);
      return;
    }
    let sourceData = fetchedrewards;

    if (tabType === "initial") {
      sourceData = fetchedrewards.filter((reward) => reward.type === "initial");
    } else if (tabType === "engagement") {
      sourceData = fetchedrewards.filter(
        (reward) => reward.type === "engagement"
      );
    }

    // Simulate paginated data fetch
    const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRewards = sourceData.slice(startIndex, endIndex);

    // Fetch meme info for each reward handle concurrently
    const rewardsWithDetails = await Promise.all(
      paginatedRewards.map(async (reward: ClaimProof) => {
        // Fetch meme info for the handle
        const memeInfo = await getMemeInfo(reward.tokenAddress); // Assuming `getMemeInfoByHandle` is a function that fetches meme info by handle
        return {
          ...reward, // Retain all the reward properties
          name: memeInfo.name,
          image: memeInfo.image,
          description: memeInfo.description,
          handle: memeInfo.handle,
          ticker: memeInfo.ticker,
          _id: reward._id, // Add fetched meme info
        };
      })
    );

    console.log("Source", rewardsWithDetails);
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
            const memeInfo = await getMemeInfo(reward.tokenAddress);
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
    if (address && fetchedrewards) {
      fetchRewards(1, "available", true);
    } else {
      setIsLoading(false);
      setRewards([]);
    }
  }, [address, fetchedrewards]);

  // Handle tab change
  useEffect(() => {
    if (address && !isLoading) {
      fetchRewards(1, activeTab as TabType, true);
    }
  }, [activeTab, address]);

  const handleClaim = async ({
    id,
    tokenAddress,
    amount,
    index,
    proof,
  }: {
    id: string;
    tokenAddress: string;
    amount: string;
    index: number;
    proof: string[];
  }) => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setClaimingToken(id);

    try {
      // Simulate API delay

      // On chain transaction
      try {
        console.log("🚀 Claiming reward...");
        console.log(amount, index, proof);

        const cleanAmount = parseUnits(amount, 18);

        const { request } = await simulateContract(config, {
          abi: EngageToEarn as Abi,
          address: CONTRACTS.memedEngageToEarn as `0x${string}`,
          functionName: "claim",
          args: [
            tokenAddress as `0x${string}`,
            cleanAmount,
            index,
            proof as `0x${string}`[],
          ],
          account: address,
        });

        const hash = await writeContract(config, request);

        console.log("✅ Claim transaction sent:", hash);

        const receipt = await waitForTransactionReceipt(config, { hash });
        const isSuccess = receipt.status === "success";

        // Find the token data
        const tokenData = rewards.find((r) => r.tokenAddress === tokenAddress);

        if (!tokenData) {
          throw new Error("Token data not found");
        }

        // Success - update UI
        if (isSuccess) {
          toast.success(
            `Successfully claimed ${tokenData.amount} ${tokenData.ticker}`
          );
        }
      } catch (err: any) {
        console.error("❌ Error sending claim transaction:", err);
        const message =
          err?.shortMessage ||
          err?.message ||
          "Something went wrong while claiming the reward";
        throw new Error(message);
      }
      // Remove the claimed token from the list
      setRewards(searchRewards.filter((r) => r._id !== id));
      queryClient.invalidateQueries({
        queryKey: ["claim-data", address],
      });
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

  const rewardHistory = rewards.filter(
    (reward) => reward.transactionHash !== null
  );

  // Search Reward
  useEffect(() => {
    if (searchQuery && !isLoading) {
      const filterRewards = rewards.filter(
        (reward) =>
          reward.name.toLowerCase().includes(searchQuery) ||
          reward.handle.toLowerCase().includes(searchQuery)
      );
      console.log(filterRewards, searchQuery);
      setSearchRewards(filterRewards);
    } else {
      setSearchRewards(rewards);
    }
  }, [searchQuery, isLoading]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white md:mt-20 relative ">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <RewardCardSkeleton key={index} />
                ))}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {searchRewards && searchRewards.length > 0 ? (
                      searchRewards
                        .filter((reward) => reward.transactionHash === null)
                        .map((reward) => (
                          <RewardCard
                            key={reward._id}
                            reward={reward}
                            onClaim={() =>
                              handleClaim({
                                id: reward._id,
                                tokenAddress: reward.tokenAddress,
                                amount: reward.amount,
                                index: reward.airdrop.index,
                                proof: reward.proof,
                              })
                            }
                            isClaiming={claimingToken === reward._id}
                          />
                        ))
                    ) : (
                      <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500">No Rewards available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="initial" className="mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {initialRewards.length > 0 ? (
                      initialRewards.map((reward) => (
                        <RewardCard
                          key={reward._id}
                          reward={reward}
                          onClaim={handleClaim}
                          isClaiming={claimingToken === reward._id}
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
                          key={reward._id}
                          reward={reward}
                          onClaim={handleClaim}
                          isClaiming={claimingToken === reward._id}
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
                  `No More ${
                    activeTab === "initial"
                      ? "Initial"
                      : activeTab === "engagement"
                      ? "Engagement"
                      : ""
                  } Rewards`
                ) : (
                  `Load More ${
                    activeTab === "initial"
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
              <RewardHistory rewards={rewardHistory} />
            </div>
          )}
        </div>
      </main>
      <Footer />
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
  onClaim: ({
    id,
    tokenAddress,
    amount,
    index,
    proof,
  }: {
    id: string;
    tokenAddress: string;
    amount: string;
    index: number;
    proof: string[];
  }) => void;
  isClaiming: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-md transition-all duration-300 bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]">
      <div className="flex">
        {/* Left side - Image */}
        <div className="w-20 h- flex-shrink-0 border-r-2 b">
          <Image
            src={
              `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${reward.image}` ||
              "/fallback.png"
            }
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
              <h3 className="text-md font-bold text-black">{reward.name}</h3>
              <p className="text-xs text-gray-600">@{reward.handle}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {reward.type === "initial" ? "Initial" : "Engagement"}
                </p>
                <p className="text-sm font-bold text-primary">
                  {Number(reward.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 6,
                  })}{" "}
                  {reward.ticker}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 text-white bg-primary rounded-full text-xs">
                <Zap size={10} />
                <span className="font-bold">${reward.ticker}</span>
              </div>

              <Button
                onClick={() =>
                  onClaim({
                    id: reward.airdrop._id,
                    amount: reward.amount,
                    index: reward.index,
                    proof: reward.proof,
                    tokenAddress: reward.tokenAddress,
                  })
                }
                className="gap-1 bg-primary hover:bg-primary/90 h-8 px-3 py-1 text-xs cursor-pointer"
                disabled={isClaiming || reward.transactionHash ? true : false}
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Claiming...
                  </>
                ) : reward.transactionHash ? (
                  <>Claimed</>
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
