"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Flame, ThumbsUp, Loader2 } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { LeaderboardData, useLeaderboard } from "@/hooks/useLeaderBoard";
import Image from "next/image";
import { truncateAddress } from "@/lib/helpers";
import { getAccountByAddress } from "@/lib/lens";
import { UserImage } from "@/components/shared/UserImage";
import Link from "next/link";

// Types
type LeaderboardTab = "memes" | "creators";
type TimeFrame = "daily" | "weekly" | "monthly" | "allTime";

interface Creator {
  id: string;
  rank: number;
  name: string;
  handle: string;
  profileImageUrl: string;
  followers: number;
  posts: number;
  engagement: number;
}

interface Meme {
  id: string;
  rank: number;
  title: string;
  creatorName: string;
  creatorHandle: string;
  creatorImageUrl: string;
  memeImageUrl: string;
  likes: number;
  comments: number;
  shares: number;
  score: number;
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  } else {
    return num.toString();
  }
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("memes");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("allTime");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [displayedMemes, setDisplayedMemes] = useState<Meme[]>([]);
  const [displayedCreators, setDisplayedCreators] = useState<Creator[]>([]);
  const [hasMoreMemes, setHasMoreMemes] = useState(false);
  const [hasMoreCreators, setHasMoreCreators] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState<Record<LeaderboardTab, boolean>>({
    memes: false,
    creators: false,
  });
  const {
    topMemes,
    topCreators,
    isLoading: isLeaderboardLoading,
    isError,
    error,
  }: LeaderboardData = useLeaderboard();

  // console.log({ topMemes, topCreators });
  // console.log(isLeaderboardLoading);

  // Number of items to display per page
  const itemsPerPage = 10;

  // Handle load more for memes
  const handleLoadMoreMemes = () => {
    setLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      const currentlyDisplayed = displayedMemes.length;
      const newItems = memes.slice(
        currentlyDisplayed,
        currentlyDisplayed + itemsPerPage
      );
      setDisplayedMemes([...displayedMemes, ...newItems]);
      setHasMoreMemes(currentlyDisplayed + newItems.length < memes.length);
      setHasMore((prev) => ({
        ...prev,
        memes: currentlyDisplayed + newItems.length < memes.length,
      }));
      setLoadingMore(false);
    }, 500);
  };

  // Handle load more for creators
  const handleLoadMoreCreators = () => {
    setLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      const currentlyDisplayed = displayedCreators.length;
      const newItems = creators.slice(
        currentlyDisplayed,
        currentlyDisplayed + itemsPerPage
      );
      setDisplayedCreators([...displayedCreators, ...newItems]);
      setHasMoreCreators(
        currentlyDisplayed + newItems.length < creators.length
      );
      setHasMore((prev) => ({
        ...prev,
        creators: currentlyDisplayed + newItems.length < creators.length,
      }));
      setLoadingMore(false);
    }, 500);
  };

  // Handle load more based on active tab
  const handleLoadMore = () => {
    if (isLoading || !hasMore[activeTab]) return;

    setIsLoading(true);
    if (activeTab === "memes") {
      handleLoadMoreMemes();
    } else if (activeTab === "creators") {
      handleLoadMoreCreators();
    }
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Leaderboard</h1>
          <p className="text-gray-600 text-center mb-6">
            Discover the top performing memes and creators on the platform
          </p>

          {/* Main tabs */}
          <Tabs
            defaultValue="memes"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as LeaderboardTab)}
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="memes" className="cursor-pointer">
                Top Memes
              </TabsTrigger>
              <TabsTrigger value="creators" className="cursor-pointer">
                Top Creators
              </TabsTrigger>
            </TabsList>

            {/* Memes Tab Content */}
            <TabsContent value="memes" className="w-full">
              {isLeaderboardLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                    {topMemes.map((meme, index) => (
                      <Link href={`/meme/${meme.tokenAddress}`} key={index}>
                        <Card
                          key={meme.tokenAddress}
                          className="overflow-hidden border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-300"
                        >
                          <div className="relative">
                            <div className="h-[200px]">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${meme.image}`}
                                alt={meme.name || "meme token"}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                              />
                            </div>
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h2 className="font-bold text-lg mb-2">
                              {meme.name}
                            </h2>
                            <div className="flex items-center mb-3">
                              <UserImage username={meme.handle} />
                              <div>
                                <h3 className="text-sm font-medium">
                                  {truncateAddress(meme.tokenAddress)}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  <span className="text-primary">By</span> @
                                  {meme.handle}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end text-sm text-gray-600">
                              {/* <div className="flex items-center">
                              <ThumbsUp size={16} className="mr-1" />
                              <span>{formatNumber(meme.likesCount)}</span>
                            </div> */}
                              <div className="flex items-center">
                                <Flame size={16} className="mr-1" />
                                <span>
                                  {formatNumber(
                                    Number(meme.tokenData?.heat || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* We'll use the global load more button instead */}
                </div>
              )}
            </TabsContent>

            {/* Creators Tab Content */}
            <TabsContent value="creators" className="w-full">
              {isLeaderboardLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="bg-white rounded-lg shadow overflow-hidden border-2 border-black">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            Rank
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            Creator
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                          >
                            Score
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                          >
                            Memes
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            Engagement
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topCreators.map((creator, index) => (
                          <tr
                            key={creator.creator}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                  {index + 1 <= 3 ? (
                                    <Trophy
                                      size={14}
                                      className={
                                        index + 1 === 1
                                          ? "text-yellow-500"
                                          : index + 1 === 2
                                          ? "text-gray-400"
                                          : "text-amber-700"
                                      }
                                    />
                                  ) : (
                                    <span className="text-xs font-medium">
                                      {index + 1}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage
                                      src={
                                        (creator.creatorData?.metadata
                                          ?.picture as string) || ""
                                      }
                                    />
                                    <AvatarFallback>
                                      {creator.creatorData?.metadata?.name?.substring(
                                        0,
                                        2
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {creator.creator}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {/* @ts-ignore */}@
                                    {creator.creatorData.username.localName}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <TrendingUp
                                  size={16}
                                  className="mr-1 text-green-500"
                                />
                                <span className="text-sm text-gray-900">
                                  {creator.creatorData?.score || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">
                                  {creator.memeCount}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">
                                  {creator.totalHeat}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* We'll use the global load more button instead */}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="border-2 border-black text-black hover:bg-black cursor-pointer hover:text-white"
              onClick={handleLoadMore}
              disabled={isLeaderboardLoading || !hasMore[activeTab]}
            >
              {isLeaderboardLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : !hasMore[activeTab] ? (
                `No More ${activeTab === "memes" ? "Memes" : "Creators"}`
              ) : (
                `Load More ${activeTab === "memes" ? "Memes" : "Creators"}`
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
