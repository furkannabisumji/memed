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
import { formatNumber, truncateAddress } from "@/lib/helpers";
import { getAccountByAddress } from "@/lib/lens";
import { UserImage } from "@/components/shared/UserImage";
import Link from "next/link";
import { useCallback, useRef } from "react";
import { ExploreCardSkeleton } from "@/components/shared/skeletons/ExploreCardSkeleton";
// Types
type LeaderboardTab = "memes" | "creators";

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

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("memes");

  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    memes: null,
    creators: null,
  });
  const {
    topMemes,
    topCreators,
    isLoading: isLeaderboardLoading,
  }: LeaderboardData = useLeaderboard();
  // console.log(topMemes);

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
  }, [activeTab]);
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Leaderboard</h1>
          <p className="text-gray-600 text-center mb-6">
            Discover the top performing memes and creators by heat on the
            platform
          </p>

          {/* Main tabs */}
          <Tabs
            defaultValue="memes"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as LeaderboardTab)}
          >
            <div className="relative mb-3" ref={tabsListRef}>
              <TabsList
                defaultValue="memes"
                className="w-full h-auto p-0 bg-transparent border-b border-gray-200"
              >
                {["memes", "creators"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-6 py-3 cursor-pointer hover:bg-secondary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary transition-colors"
                    ref={(el) => {
                      tabRefs.current[tab] = el;
                    }}
                  >
                    {tab === "memes"
                      ? "Top Memes"
                      : tab === "creators"
                      ? "Top Creators"
                      : "Collections"}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div
                className="absolute bottom-0 h-0.5 bg-green-400 transition-all duration-300 ease-in-out"
                style={{
                  left: underlineStyle.left,
                  width: underlineStyle.width,
                }}
              />
            </div>

            {/* Memes Tab Content */}
            <TabsContent value="memes" className="w-full">
              {isLeaderboardLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ExploreCardSkeleton key={index} />
                  ))} </div>
              ) : (
                <div className="flex flex-col w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topMemes.map((meme, index) => (
                      <Link href={`/meme/${meme.tokenAddress}`} key={index}>
                        <Card className="overflow-hidden border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-300">
                          <div className="relative">
                            <div className="h-48 md:h-56">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${meme.image}`}
                                alt={meme.name || "meme token"}
                                fill
                                className="object-cover transition-transform hover:scale-105 duration-500"
                              />
                            </div>
                            <div className="absolute top-3 left-3 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            {index < 3 && (
                              <div className="absolute top-3 right-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    index === 0
                                      ? "bg-yellow-400"
                                      : index === 1
                                      ? "bg-gray-300"
                                      : "bg-amber-700"
                                  }`}
                                >
                                  <Trophy size={16} className="text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h2 className="font-bold text-lg mb-2 line-clamp-1">
                              {meme.name}
                            </h2>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <UserImage username={meme.handle} />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    <span className="text-primary font-medium">
                                      By
                                    </span>{" "}
                                    @{meme.handle}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                <Flame
                                  size={16}
                                  className="mr-1 text-orange-500"
                                />
                                <span className="font-bold text-sm">
                                  {formatNumber(
                                    Number(meme.tokenData?.heat || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {truncateAddress(meme.tokenAddress)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs cursor-pointer"
                              >
                                View Details →
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      className="border-2 border-black hover:bg-primary hover:text-white transition-colors px-6 py-2 rounded-lg"
                    >
                      Load More Memes
                    </Button>
                  </div> */}
                </div>
              )}
            </TabsContent>

            {/* Creators Tab Content */}
            <TabsContent value="creators" className="w-full">
              {isLeaderboardLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-black">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider"
                          >
                            Rank
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider"
                          >
                            Creator
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider hidden md:table-cell"
                          >
                            Score
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider hidden md:table-cell"
                          >
                            Memes
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider"
                          >
                            Heat score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topCreators.map((creator, index) => (
                          <tr
                            key={creator.creator}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                                    index + 1 === 1
                                      ? "bg-yellow-400 text-white"
                                      : index + 1 === 2
                                      ? "bg-gray-300 text-white"
                                      : index + 1 === 3
                                      ? "bg-amber-700 text-white"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {index + 1 <= 3 ? (
                                    <Trophy size={16} />
                                  ) : (
                                    <span className="text-sm">{index + 1}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <Avatar className="h-10 w-10 border-2 border-primary">
                                    <AvatarImage
                                      src={
                                        (creator.creatorData?.metadata
                                          ?.picture as string) || ""
                                      }
                                    />
                                    <AvatarFallback className="bg-primary text-white">
                                      {creator.creatorData?.metadata?.name?.substring(
                                        0,
                                        2
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">
                                    {truncateAddress(creator.creator)}
                                  </div>
                                  <div className="text-xs text-primary">
                                    @{creator?.creatorData?.username?.localName}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right hidden md:table-cell">
                              <div className="flex items-center justify-end">
                                <TrendingUp
                                  size={16}
                                  className="mr-1 text-green-500"
                                />
                                <span className="text-sm font-bold text-gray-900">
                                  {creator.creatorData?.score || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right hidden md:table-cell">
                              <div className="inline-flex items-center justify-center bg-gray-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-gray-900">
                                  {creator.memeCount}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="inline-flex items-center justify-center bg-orange-100 px-3 py-1 rounded-full">
                                <Flame
                                  size={16}
                                  className="mr-1 text-orange-500"
                                />
                                <span className="text-sm font-bold text-gray-900">
                                  {formatNumber(Number(creator.totalHeat))}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      className="border-2 border-black hover:bg-primary hover:text-white transition-colors px-6 py-2 rounded-lg"
                    >
                      Load More Creators
                    </Button>
                  </div> */}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* <div className="flex justify-center mt-8">
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
          </div> */}
        </div>
      </div>
      <Footer />
    </>
  );
}
