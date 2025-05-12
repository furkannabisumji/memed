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

// Dummy data for creators
const dummyCreators: Creator[] = [
  {
    id: "1",
    rank: 1,
    name: "Alex Johnson",
    handle: "alexj",
    profileImageUrl: "https://i.pravatar.cc/150?img=1",
    followers: 125000,
    posts: 342,
    engagement: 8.7,
  },
  {
    id: "2",
    rank: 2,
    name: "Sophia Chen",
    handle: "sophiac",
    profileImageUrl: "https://i.pravatar.cc/150?img=5",
    followers: 98500,
    posts: 287,
    engagement: 7.9,
  },
  {
    id: "3",
    rank: 3,
    name: "Marcus Williams",
    handle: "marcusw",
    profileImageUrl: "https://i.pravatar.cc/150?img=3",
    followers: 87200,
    posts: 412,
    engagement: 7.2,
  },
  {
    id: "4",
    rank: 4,
    name: "Priya Patel",
    handle: "priyap",
    profileImageUrl: "https://i.pravatar.cc/150?img=4",
    followers: 76800,
    posts: 256,
    engagement: 6.8,
  },
  {
    id: "5",
    rank: 5,
    name: "David Kim",
    handle: "davidk",
    profileImageUrl: "https://i.pravatar.cc/150?img=7",
    followers: 65400,
    posts: 198,
    engagement: 6.5,
  },
  {
    id: "6",
    rank: 6,
    name: "Emma Rodriguez",
    handle: "emmar",
    profileImageUrl: "https://i.pravatar.cc/150?img=9",
    followers: 58900,
    posts: 312,
    engagement: 6.1,
  },
  {
    id: "7",
    rank: 7,
    name: "James Wilson",
    handle: "jamesw",
    profileImageUrl: "https://i.pravatar.cc/150?img=11",
    followers: 52300,
    posts: 178,
    engagement: 5.9,
  },
  {
    id: "8",
    rank: 8,
    name: "Olivia Taylor",
    handle: "oliviat",
    profileImageUrl: "https://i.pravatar.cc/150?img=13",
    followers: 48700,
    posts: 243,
    engagement: 5.6,
  },
  {
    id: "9",
    rank: 9,
    name: "Noah Brown",
    handle: "noahb",
    profileImageUrl: "https://i.pravatar.cc/150?img=15",
    followers: 42100,
    posts: 167,
    engagement: 5.2,
  },
  {
    id: "10",
    rank: 10,
    name: "Ava Martinez",
    handle: "avam",
    profileImageUrl: "https://i.pravatar.cc/150?img=17",
    followers: 38500,
    posts: 201,
    engagement: 4.9,
  },
];

// Dummy data for memes
const dummyMemes: Meme[] = [
  {
    id: "1",
    rank: 1,
    title: "When the code finally works",
    creatorName: "Alex Johnson",
    creatorHandle: "alexj",
    creatorImageUrl: "https://i.pravatar.cc/150?img=1",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+1",
    likes: 45200,
    comments: 1230,
    shares: 8900,
    score: 9.8,
  },
  {
    id: "2",
    rank: 2,
    title: "Monday morning feels",
    creatorName: "Sophia Chen",
    creatorHandle: "sophiac",
    creatorImageUrl: "https://i.pravatar.cc/150?img=5",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+2",
    likes: 38700,
    comments: 987,
    shares: 7600,
    score: 9.5,
  },
  {
    id: "3",
    rank: 3,
    title: "Web3 explained",
    creatorName: "Marcus Williams",
    creatorHandle: "marcusw",
    creatorImageUrl: "https://i.pravatar.cc/150?img=3",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+3",
    likes: 32400,
    comments: 876,
    shares: 6500,
    score: 9.2,
  },
  {
    id: "4",
    rank: 4,
    title: "NFT market be like",
    creatorName: "Priya Patel",
    creatorHandle: "priyap",
    creatorImageUrl: "https://i.pravatar.cc/150?img=4",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+4",
    likes: 28900,
    comments: 754,
    shares: 5800,
    score: 8.9,
  },
  {
    id: "5",
    rank: 5,
    title: "Crypto rollercoaster",
    creatorName: "David Kim",
    creatorHandle: "davidk",
    creatorImageUrl: "https://i.pravatar.cc/150?img=7",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+5",
    likes: 25600,
    comments: 698,
    shares: 5100,
    score: 8.7,
  },
  {
    id: "6",
    rank: 6,
    title: "DeFi explained simply",
    creatorName: "Emma Rodriguez",
    creatorHandle: "emmar",
    creatorImageUrl: "https://i.pravatar.cc/150?img=9",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+6",
    likes: 22100,
    comments: 632,
    shares: 4400,
    score: 8.5,
  },
  {
    id: "7",
    rank: 7,
    title: "Smart contract bugs",
    creatorName: "James Wilson",
    creatorHandle: "jamesw",
    creatorImageUrl: "https://i.pravatar.cc/150?img=11",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+7",
    likes: 19800,
    comments: 587,
    shares: 3900,
    score: 8.3,
  },
  {
    id: "8",
    rank: 8,
    title: "Gas fees be like",
    creatorName: "Olivia Taylor",
    creatorHandle: "oliviat",
    creatorImageUrl: "https://i.pravatar.cc/150?img=13",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+8",
    likes: 17500,
    comments: 543,
    shares: 3500,
    score: 8.1,
  },
  {
    id: "9",
    rank: 9,
    title: "When your transaction fails",
    creatorName: "Noah Brown",
    creatorHandle: "noahb",
    creatorImageUrl: "https://i.pravatar.cc/150?img=15",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+9",
    likes: 15200,
    comments: 498,
    shares: 3000,
    score: 7.9,
  },
  {
    id: "10",
    rank: 10,
    title: "Blockchain explained",
    creatorName: "Ava Martinez",
    creatorHandle: "avam",
    creatorImageUrl: "https://i.pravatar.cc/150?img=17",
    memeImageUrl: "https://placehold.co/300x200/png?text=Meme+10",
    likes: 13800,
    comments: 456,
    shares: 2700,
    score: 7.7,
  },
];

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

  // Number of items to display per page
  const itemsPerPage = 10;

  // Simulate fetching data
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setMemes(dummyMemes);
      setCreators(dummyCreators);
      setDisplayedMemes(dummyMemes.slice(0, itemsPerPage));
      setDisplayedCreators(dummyCreators.slice(0, itemsPerPage));
      setHasMoreMemes(dummyMemes.length > itemsPerPage);
      setHasMoreCreators(dummyCreators.length > itemsPerPage);
      setHasMore({
        memes: dummyMemes.length > itemsPerPage,
        creators: dummyCreators.length > itemsPerPage,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeFrame]);

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

          {/* Time frame selector */}
          <div className="flex space-x-2 mb-6">
            <Badge
              variant={timeFrame === "daily" ? "default" : "outline"}
              className="cursor-pointer border-2 border-black hover:bg-black hover:text-white"
              onClick={() => setTimeFrame("daily")}
            >
              Daily
            </Badge>
            <Badge
              variant={timeFrame === "weekly" ? "default" : "outline"}
              className="cursor-pointer border-2 border-black hover:bg-black hover:text-white"
              onClick={() => setTimeFrame("weekly")}
            >
              Weekly
            </Badge>
            <Badge
              variant={timeFrame === "monthly" ? "default" : "outline"}
              className="cursor-pointer border-2 border-black hover:bg-black hover:text-white"
              onClick={() => setTimeFrame("monthly")}
            >
              Monthly
            </Badge>
            <Badge
              variant={timeFrame === "allTime" ? "default" : "outline"}
              className="cursor-pointer border-2 border-black hover:bg-black hover:text-white"
              onClick={() => setTimeFrame("allTime")}
            >
              All Time
            </Badge>
          </div>

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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                    {displayedMemes.map((meme) => (
                      <Card
                        key={meme.id}
                        className="overflow-hidden border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-300"
                      >
                        <div className="relative">
                          <img
                            src={meme.memeImageUrl}
                            alt={meme.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center">
                            {meme.rank}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={meme.creatorImageUrl} />
                              <AvatarFallback>
                                {meme.creatorName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-sm font-medium">
                                {meme.creatorName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                @{meme.creatorHandle}
                              </p>
                            </div>
                          </div>
                          <h2 className="font-bold text-lg mb-2">
                            {meme.title}
                          </h2>
                          <div className="flex justify-between text-sm text-gray-600">
                            <div className="flex items-center">
                              <ThumbsUp size={16} className="mr-1" />
                              <span>{formatNumber(meme.likes)}</span>
                            </div>
                            <div className="flex items-center">
                              <Flame size={16} className="mr-1" />
                              <span>{formatNumber(meme.shares)}</span>
                            </div>
                            <div className="flex items-center">
                              <Trophy size={16} className="mr-1" />
                              <span>{meme.score.toFixed(1)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* We'll use the global load more button instead */}
                </div>
              )}
            </TabsContent>

            {/* Creators Tab Content */}
            <TabsContent value="creators" className="w-full">
              {loading ? (
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
                            Followers
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                          >
                            Posts
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
                        {displayedCreators.map((creator) => (
                          <tr key={creator.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                  {creator.rank <= 3 ? (
                                    <Trophy
                                      size={14}
                                      className={
                                        creator.rank === 1
                                          ? "text-yellow-500"
                                          : creator.rank === 2
                                          ? "text-gray-400"
                                          : "text-amber-700"
                                      }
                                    />
                                  ) : (
                                    <span className="text-xs font-medium">
                                      {creator.rank}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <Avatar>
                                    <AvatarImage
                                      src={creator.profileImageUrl}
                                    />
                                    <AvatarFallback>
                                      {creator.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {creator.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    @{creator.handle}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-900">
                                {formatNumber(creator.followers)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-900">
                                {formatNumber(creator.posts)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <TrendingUp
                                  size={16}
                                  className="mr-1 text-green-500"
                                />
                                <span className="text-sm text-gray-900">
                                  {creator.engagement.toFixed(1)}%
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
              disabled={isLoading || !hasMore[activeTab]}
            >
              {isLoading ? (
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
