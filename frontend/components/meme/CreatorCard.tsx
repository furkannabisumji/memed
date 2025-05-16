// components/creator/CreatorCard.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  Calendar,
  BarChart3,
  ChevronRight,
  Zap,
  User,
} from "lucide-react";
import { CreatorResponse } from "@/hooks/useCreators";
import { getAccountByUsername } from "@/lib/lens";
import { Account } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CreatorCardProps {
  creator: CreatorResponse;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserAccount() {
      try {
        setLoading(true);
        const result = (await getAccountByUsername(
          creator.handle
        )) as Account | null;
        setAccount(result);
      } catch (error) {
        console.error("Error fetching account:", error);
      } finally {
        setLoading(false);
      }
    }
    getUserAccount();
  }, [creator.handle]);

  // Helper function to get profile picture
  const getProfilePicture = () => {
    if (!account?.metadata?.picture) return null;

    if (typeof account.metadata.picture === "string") {
      return account.metadata.picture;
    }

    return (
      account.metadata.picture.optimized?.url ||
      account.metadata.picture.original?.url ||
      account.metadata.picture.uri
    );
  };

  // Helper to format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const profilePicture = getProfilePicture();

  return (
    <div className="relative overflow-hidden rounded-lg transition-all duration-300 bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-black">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={
                    profilePicture ||
                    `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${creator.tokens[0]?.image}`
                  }
                  alt={creator.handle}
                />
                <AvatarFallback className="bg-primary text-white font-bold">
                  {creator.handle.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">
                {creator.handle}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User size={14} />
                {formatAddress(creator.address)}
              </p>
              {account?.metadata?.bio && (
                <p className="text-sm text-gray-600 line-clamp-1 max-w-md mt-1">
                  {account.metadata.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 text-white bg-primary rounded-full">
            <Zap size={14} />
            <span className="font-bold">{creator.tokens.length} Token(s)</span>
          </div>
        </div>

        <Tabs defaultValue="tokens" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="tokens"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm cursor-pointer"
            >
              Tokens
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm cursor-pointer"
            >
              Creator Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="mt-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {creator.tokens.map((token) => (
                <Link
                  href={`/meme/${token.tokenAddress}`}
                  key={token.tokenAddress}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-md border-2 border-black transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                    <div className="relative aspect-video bg-gray-200">
                      {token.image && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${token.image}`}
                          alt={token.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      {!token.image && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white border-t-2 border-black">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-black">{token.name}</h3>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                          <Zap size={10} />
                          <span>${token.ticker}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                        {token.description || "No description available"}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-600" />
                          <span>
                            {new Date(token.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 size={12} className="text-gray-600" />
                          <span>
                            {Intl.NumberFormat().format(
                              parseInt(token.totalDistributed)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border-2 border-black rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                  <p className="text-sm text-gray-600">Account Score</p>
                  <p className="text-2xl font-bold text-primary">
                    {account?.score || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on activity
                  </p>
                </div>

                <div className="p-4 border-2 border-black rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                  <p className="text-sm text-gray-600">Account Age</p>
                  <p className="text-2xl font-bold text-primary">
                    {account?.createdAt
                      ? `${Math.floor(
                          (Date.now() - new Date(account.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Member since{" "}
                    {account?.createdAt
                      ? new Date(account.createdAt).toLocaleDateString()
                      : "unknown"}
                  </p>
                </div>

                <div className="col-span-2 p-4 border-2 border-black rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                  <p className="text-sm text-gray-600">Token Details</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Total Tokens</p>
                      <p className="text-2xl font-bold text-primary">
                        {creator.tokens.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 text-right">
                        Avg. Distribution
                      </p>
                      <p className="text-2xl font-bold text-right text-primary">
                        {creator.tokens.length > 0
                          ? Intl.NumberFormat().format(
                              creator.tokens.reduce(
                                (acc, token) =>
                                  acc + parseInt(token.totalDistributed),
                                0
                              ) / creator.tokens.length
                            )
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* <div className="p-4 bg-gray-100 border-t-2 border-black mt-2">
        <Link
          href={`/creators/${creator.handle}`}
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          View Complete Profile <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div> */}
    </div>
  );
}
