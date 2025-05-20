"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Share,
  UserPlus,
  ThumbsUp,
  MessageCircle,
  Repeat,
  Flame,
  Zap,
  Lock,
  Loader2,
  Bookmark,
  Quote,
  Clock,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCustomToast } from "@/components/ui/custom-toast";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import MemeStaking from "@/components/meme/MemeStaking";
import MemeBattles from "@/components/meme/MemeBattles";
import MemeSupporters from "@/components/meme/MemeSupporters";
import MemeDetails from "@/components/meme/MemeDetails";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CommentModal from "@/components/meme/CommentModal";
import MirrorModal from "@/components/meme/MirrorModal";
import { TransactionType, useChainSwitch } from "@/hooks/useChainSwitch";
import { chains } from "@lens-chain/sdk/viem";
import { useAccount } from "wagmi";
import { useMemeToken } from "@/hooks/useMemeToken";
import { truncateAddress } from "@/lib/helpers";
import { useTokenData } from "@/hooks/useTokenData";
import { TokenData, TokenStats } from "@/app/types";
import { useTokenStats } from "@/hooks/useTokenStats";

export default function MemeViewPage() {
  const params = useParams();
  const memeId = params.id as string;
  const { chain } = useAccount();
  // State for UI interactions
  const [activeTab, setActiveTab] = useState("Details");
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasEnoughTokens, setHasEnoughTokens] = useState(true); // Set to true for demo
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [engagementReward, setEngagementReward] = useState<number>(5); // Tokens per engagement
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isMirrorModalOpen, setIsMirrorModalOpen] = useState(false);
  const { data: memeToken, isLoading } = useMemeToken(memeId);
  const [copySuccess, setCopySuccess] = useState(false);
  const { data: tokenData }: { data: TokenData | null } = useTokenData(
    memeToken?.handle
  );
  const {
    stats,
    loading: statsLoading,
  }: { stats: TokenStats | null; loading: boolean } = useTokenStats(
    memeToken?.handle || ""
  );

  // console.log(stats);

  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    Details: null,
    Supporters: null,
    Battles: null,
    Staking: null,
  });
  // Handle follow button click
  const toast = useCustomToast();

  const { switchToChain } = useChainSwitch();

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    if (!tokenData) return;
    const link = `https://www.memed.fun/meme/${tokenData?.token}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

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

  //check chain
  useEffect(() => {
    //switch to mainnet
    if (chain && chain?.id !== chains.mainnet.id) {
      switchToChain(TransactionType.accountCreation);
    }
  }, [chain, switchToChain]);

  const handleFollow = () => {
    if (!hasEnoughTokens) {
      setShowTokenWarning(true);
      return;
    }
    setIsFollowing(!isFollowing);
    if (isFollowing) {
      toast.info("Unfollowed", {
        description: "You have unfollowed this meme",
      });
    } else {
      toast.success("Followed", {
        description: "You are now following this meme",
      });
    }
  };

  // Handle engagement actions
  const handleEngagement = (type: "like" | "comment" | "mirror") => {
    // For comments, open the modal instead of immediately showing success
    if (type === "comment") {
      setIsCommentModalOpen(true);
      return;
    }

    if (type === "mirror") {
      setIsMirrorModalOpen(true);
      return;
    }

    // This would connect to the contract in the future
    console.log(`Engaged with ${type}`);

    // Show toast with token reward
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added`, {
      description: `You earned ${engagementReward} ${tokenData?.ticker} tokens!`,
    });
  };

  if (isLoading || !memeToken) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen mb-20">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${memeToken.image}`}
            alt="Profile banner"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container px-4 mx-auto -mt-20">
          <div className="relative z-10 p-6 bg-white rounded-xl dark:bg-gray-800 shadow-xl">
            {/* here */}
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col items-start gap-8 md:flex-row">
                {/* Profile Image Section - Improved positioning and visual appeal */}
                <div className="relative flex-shrink-0 mx-auto md:mx-0">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${memeToken.image}`}
                      alt={memeToken.name || "Meme Token"}
                      width={180}
                      height={180}
                      className="relative rounded-full border-4 h-40 w-40 md:h-44 md:w-44 border-primary object-cover shadow-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-primary text-white p-1.5 rounded-full shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-badge-check"
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                  </div>

                  {/* Add share button below image on mobile */}
                  <div className="mt-4 flex justify-center md:hidden">
                    <Button
                      onClick={copyLinkToClipboard}
                      variant="outline"
                      className="gap-2 border-2 border-green-500 cursor-pointer   transition-colors duration-300"
                    >
                      {copySuccess ? (
                        <span className="text-green-500 text-xs">Copied!</span>
                      ) : (
                        <>
                          <Share size={16} /> Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Token Info & Stats Section */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      {/* Name & Ticker with enhanced styling */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                          {memeToken.name}
                        </h1>
                        <Badge className="bg-primary hover:bg-primary/90 text-white font-semibold px-2.5">
                          ${memeToken.ticker}
                        </Badge>
                      </div>

                      {/* Address with improved styling */}
                      <Link
                        href={`https://explorer.lens.xyz/address/${memeToken.tokenAddress}`}
                        target="_blank"
                        className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        <span>@{truncateAddress(memeToken.tokenAddress)}</span>
                        <ExternalLink size={14} />
                      </Link>

                      {/* Creator info with improved styling */}
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>Created by</span>
                        <span className="font-medium text-primary hover:underline">
                          @{memeToken.handle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(memeToken.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Share button - Hidden on mobile, shown on desktop */}
                    <div className="hidden md:block">
                      <Button
                        onClick={copyLinkToClipboard}
                        variant="outline"
                        className="gap-2 border-2 border-green-500 cursor-pointer   transition-colors duration-300"
                      >
                        {copySuccess ? (
                          <span className="text-green-500 text-xs">
                            Copied!
                          </span>
                        ) : (
                          <>
                            <Share size={16} /> Share
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Main stats card - Improved layout with shadow and hover effects */}
                  <div className="mt-6 p-4 rounded-xl bg-white dark:bg-gray-900 shadow-sm border">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <BarChart3 size={18} className="text-primary" />
                      Engagement Statistics
                    </h3>

                    {/* Total Engagement highlight card */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame size={20} className="text-primary" />
                          <span className="font-medium">Total Engagement</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {stats?.totalEngagements?.toLocaleString() || 0}
                        </span>
                      </div>
                      <Progress
                        value={
                          stats?.totalEngagements
                            ? stats.totalEngagements % 100
                            : 0
                        }
                        max={100}
                        className="h-2 w-full bg-gray-200"
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-sm font-medium">
                          {stats?.engagementRate
                            ? `${Math.round(stats?.engagementRate)}%`
                            : "0%"}{" "}
                          Engagement Rate
                        </span>
                      </div>
                    </div>

                    {/* Stats grid with improved design */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {/* Upvotes */}
                      <StatCard
                        icon={<ThumbsUp size={18} className="text-primary" />}
                        title="Upvotes"
                        value={stats?.upvotes || 0}
                        percentage={Math.round(
                          ((stats?.upvotes || 0) /
                            (stats?.totalEngagements || 1)) *
                            100
                        )}
                      />

                      {/* Reposts */}
                      <StatCard
                        icon={<Repeat size={18} className="text-primary" />}
                        title="Reposts"
                        value={stats?.reposts || 0}
                        percentage={Math.round(
                          ((stats?.reposts || 0) /
                            (stats?.totalEngagements || 1)) *
                            100
                        )}
                      />

                      {/* Comments */}
                      <StatCard
                        icon={
                          <MessageCircle size={18} className="text-primary" />
                        }
                        title="Comments"
                        value={stats?.comments || 0}
                        percentage={Math.round(
                          ((stats?.comments || 0) /
                            (stats?.totalEngagements || 1)) *
                            100
                        )}
                      />

                      {/* Bookmarks */}
                      <StatCard
                        icon={<Bookmark size={18} className="text-primary" />}
                        title="Bookmarks"
                        value={stats?.bookmarks || 0}
                        percentage={Math.round(
                          ((stats?.bookmarks || 0) /
                            (stats?.totalEngagements || 1)) *
                            100
                        )}
                      />

                      {/* Collects */}
                      <StatCard
                        icon={<Zap size={18} className="text-primary" />}
                        title="Collects"
                        value={stats?.collects || 0}
                        percentage={Math.round(
                          ((stats?.collects || 0) /
                            (stats?.totalEngagements || 1)) *
                            100
                        )}
                      />

                      {/* Quotes */}
                      <StatCard
                        icon={<Quote size={18} className="text-primary" />}
                        title="Quotes"
                        value={stats?.quotes || 0}
                        percentage={Math.round(
                          ((stats?.quotes || 0) /
                            (stats?.totalEngagements || 1)) *
                            100
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="Details"
              className="mt-8"
            >
              <div className="relative" ref={tabsListRef}>
                <TabsList className="w-full h-auto p-0 bg-transparent border-b border-gray-200">
                  <TabsTrigger
                    value="Details"
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary  rounded-none bg-transparent transition-colors ${
                      activeTab === "Details" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Details = el;
                    }}
                  >
                    Details
                    <span
                      className={` bottom-0 left-0 right-0 h-0.5  transition-all duration-200 ${
                        activeTab === "Details" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </TabsTrigger>
                  <TabsTrigger
                    value="Battles"
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary  rounded-none bg-transparent transition-colors ${
                      activeTab === "Battles" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Battles = el;
                    }}
                  >
                    Battles
                    <span
                      className={` bottom-0 left-0 right-0 h-0.5  transition-all duration-200 ${
                        activeTab === "Battles" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </TabsTrigger>
                  <TabsTrigger
                    value="Staking"
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary  rounded-none bg-transparent transition-colors ${
                      activeTab === "Staking" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Staking = el;
                    }}
                  >
                    Staking
                    <span
                      className={` bottom-0 left-0 right-0 h-0.5  transition-all duration-200 ${
                        activeTab === "Staking" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </TabsTrigger>
                </TabsList>
                <div
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300"
                  style={{
                    left: `${underlineStyle.left}px`,
                    width: `${underlineStyle.width}px`,
                  }}
                />
              </div>

              {/* Details Tab */}
              <TabsContent value="Details" className="mt-8">
                <MemeDetails meme={memeToken} stats={stats} />
              </TabsContent>

              {/* Supporters Tab */}
              {/* <TabsContent value="Supporters" className="mt-8">
                <MemeSupporters profile={profile} />
              </TabsContent> */}

              {/* Battles Tab */}
              <TabsContent value="Battles" className="mt-8">
                <MemeBattles meme={memeToken} />
              </TabsContent>

              {/* Staking Tab */}
              <TabsContent value="Staking" className="mt-8">
                <MemeStaking meme={memeToken} tokenAddress={memeId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

{
  /* Reusable stat card component */
}
const StatCard = ({
  icon,
  title,
  value,
  percentage,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  percentage: number;
}) => (
  <div className="flex flex-col items-center p-3 border rounded-lg hover:border-primary hover:shadow-md transition-all">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="font-medium text-sm">{title}</span>
    </div>
    <span className="text-xl font-bold">{value.toLocaleString()}</span>
    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
      <span className="font-semibold">{percentage}%</span>
      <span>of total</span>
    </div>
  </div>
);
