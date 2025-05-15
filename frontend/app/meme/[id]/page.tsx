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
import { useChainSwitch } from "@/hooks/useChainSwitch";
import { chains } from "@lens-chain/sdk/viem";
import { useAccount } from "wagmi";
import { useMemeToken } from "@/hooks/useMemeToken";
import { truncateAddress } from "@/lib/helpers";
import { useTokenData } from "@/hooks/useTokenData";
import { TokenData } from "@/app/types";

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
  const { data: tokenData }: { data: TokenData | null } = useTokenData(
    memeToken?.handle
  );

  console.log(tokenData);

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
    if (chain?.id !== chains.testnet.id) {
      switchToChain();
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
      description: `You earned ${engagementReward} ${profile.tokenSymbol} tokens!`,
    });
  };

  // Mock data for the meme profile
  const profile = {
    id: memeId,
    username: "DogeToTheMoon",
    displayName: "Doge To The Moon",
    bio: "The original meme that started it all. Much wow. Very token. Such value.",
    followers: 78432,
    following: 0,
    profileImage: "/fallback.png",
    bannerImage: "/fallback.png",
    isVerified: true,
    isFollowing: isFollowing,
    isOwner: false,
    createdAt: "2025-01-15T00:00:00Z",
    creatorName: "Crypto Memer",
    creatorHandle: "cryptomemer",
    creatorProfileImage: "/fallback.png",
    tokenSymbol: "DOGE",
    tokenPrice: "0.01",
    totalSupply: 1000000000,
    circulatingSupply: 250000000,
    holders: 12900,
    heatScore: 78,
    likes: 24500,
    comments: 1250,
    mirrors: 3450,
    engagements: 89245,
    tokenRequirement: 1000,
  };

  // Additional profile properties for mint progress
  const mintProgress = profile.engagements;
  const nextMintThreshold = 100000;

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
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative rounded-full">
                <Image
                  src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${memeToken.image}`}
                  alt={memeToken.name || ""}
                  width={150}
                  height={150}
                  className="rounded-full border-4 h-32 w-32 border-[#28D358] "
                />
                {profile.isVerified && (
                  <div className="absolute bottom-2 right-3 bg-primary text-white p-1 rounded-full">
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
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold">{memeToken.name}</h1>
                      <Badge className="bg-primary hover:bg-primary text-white">
                        ${memeToken.ticker}
                      </Badge>
                    </div>
                    <Link
                      href={`https://testnet.lenscan.io/address/${memeToken.tokenAddress}`}
                      target="_blank"
                      className="text-gray-500 dark:text-gray-400"
                    >
                      @{truncateAddress(memeToken.tokenAddress)}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>Created by</span>
                      <Link
                        href={`/profile/${memeToken.handle}`}
                        className="font-medium text-primary hover:underline"
                      >
                        @{memeToken.handle}
                      </Link>
                      <span>
                        on {new Date(memeToken.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    {profile.isOwner ? (
                      <Button
                        variant="outline"
                        className="gap-2 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
                      >
                        <Edit size={16} />
                        Edit Profile
                      </Button>
                    ) : profile.isFollowing ? (
                      <Button
                        variant="outline"
                        className="gap-2 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
                        onClick={handleFollow}
                      >
                        Following
                      </Button>
                    ) : (
                      <Button
                        className="gap-2 bg-primary hover:bg-primary/90 hover:shadow-2xl"
                        onClick={handleFollow}
                      >
                        <UserPlus size={16} />
                        Follow
                        {!hasEnoughTokens && (
                          <Lock size={14} className="ml-1" />
                        )}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="gap-2 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
                    >
                      <Share size={16} />
                      Share
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  {memeToken.description}
                </p>

                <div className="flex flex-wrap justify-center gap-6 mt-4 md:justify-start">
                  <div className="text-center">
                    <span className="text-xl font-bold">
                      {profile.followers.toLocaleString()}
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                      Followers
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold">
                      {profile.holders.toLocaleString()}
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                      Token Holders
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold">
                      {profile.engagements.toLocaleString()}
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                      Engagements
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Flame size={16} className="text-amber-500" />
                      <span className="text-xl font-bold">
                        {tokenData?.heat}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Heat Score
                    </p>
                  </div>
                </div>

                {/* Engagement Actions */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
                    onClick={() => handleEngagement("like")}
                  >
                    <ThumbsUp size={16} />
                    Like
                    <Badge className="ml-1 bg-primary hover:bg-primary text-white text-xs">
                      +{memeToken.likesCount}
                    </Badge>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
                    onClick={() => handleEngagement("comment")}
                  >
                    <MessageCircle size={16} />
                    Comment
                    <Badge className="ml-1 bg-primary hover:bg-primary text-white text-xs">
                      +{engagementReward}
                    </Badge>
                  </Button>

                  {/* Comment Modal */}
                  <Dialog
                    open={isCommentModalOpen}
                    onOpenChange={setIsCommentModalOpen}
                  >
                    <DialogTrigger asChild>
                      <span style={{ display: "none" }}></span>
                    </DialogTrigger>
                    <CommentModal
                      engagementReward={engagementReward}
                      profile={profile}
                    />
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-2 border-black hover:bg-black hover:text-white cursor-pointer"
                    onClick={() => handleEngagement("mirror")}
                  >
                    <Repeat size={16} />
                    Mirror
                    <Badge className="ml-1 bg-primary hover:bg-primary text-white text-xs">
                      +{engagementReward}
                    </Badge>
                  </Button>

                  {/* Mirror Modal */}
                  <Dialog
                    open={isMirrorModalOpen}
                    onOpenChange={setIsMirrorModalOpen}
                  >
                    <DialogTrigger asChild>
                      <span style={{ display: "none" }}></span>
                    </DialogTrigger>
                    <MirrorModal
                      engagementReward={engagementReward}
                      profile={profile}
                      onClose={() => setIsMirrorModalOpen(false)}
                    />
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Mint Progress Bar */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  <span className="font-medium">Next Token Mint Progress</span>
                </div>
                <span className="text-sm">
                  {mintProgress.toLocaleString()} /{" "}
                  {nextMintThreshold.toLocaleString()} engagements
                </span>
              </div>
              <Progress
                value={(mintProgress / nextMintThreshold) * 100}
                className="h-2"
              />
              <p className="mt-2 text-sm text-gray-500">
                At 100,000 engagements, 1% of tokens will be minted for the
                creator and 1% for random supporters.
              </p>
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
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary rounded-none bg-transparent transition-colors ${
                      activeTab === "Details" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Details = el;
                    }}
                  >
                    <span className="relative z-10">Details</span>
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200 ${
                        activeTab === "Details" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </TabsTrigger>
                  <TabsTrigger
                    value="Supporters"
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary rounded-none bg-transparent transition-colors ${
                      activeTab === "Supporters" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Supporters = el;
                    }}
                  >
                    <span className="relative z-10">Supporters</span>
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200 ${
                        activeTab === "Supporters" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </TabsTrigger>
                  <TabsTrigger
                    value="Battles"
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary rounded-none bg-transparent transition-colors ${
                      activeTab === "Battles" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Battles = el;
                    }}
                  >
                    Battles
                  </TabsTrigger>
                  <TabsTrigger
                    value="Staking"
                    className={`relative px-6 py-3 cursor-pointer hover:bg-secondary rounded-none bg-transparent transition-colors ${
                      activeTab === "Staking" ? "text-primary" : ""
                    }`}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current.Staking = el;
                    }}
                  >
                    <span className="relative z-10">Staking</span>
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200 ${
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
                <MemeDetails meme={memeToken} />
              </TabsContent>

              {/* Supporters Tab */}
              <TabsContent value="Supporters" className="mt-8">
                <MemeSupporters profile={profile} />
              </TabsContent>

              {/* Battles Tab */}
              <TabsContent value="Battles" className="mt-8">
                <MemeBattles profile={profile} />
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
