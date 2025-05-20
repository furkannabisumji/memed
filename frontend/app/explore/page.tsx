"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Search, TrendingUp, Loader2, X } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import MemeCard from "@/components/meme/MemeCard";
import { useEffect, useRef, useState, useCallback } from "react";
import { useMemes } from "@/hooks/useMemes";
import { useCreators } from "@/hooks/useCreators";
import { CreatorCard } from "@/components/meme/CreatorCard";
import { ExploreCardSkeleton } from "@/components/shared/skeletons/ExploreCardSkeleton";
import { RewardCardSkeleton } from "@/components/shared/skeletons/RewardCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import Link from "next/link";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("tokens");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    all: null,
    tokens: null,
    creators: null,
  });
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    memes: tokenMemesData,
    fetchNextPage: fetchNextTokenMemes,
    hasNextPage: hasNextTokenMemes,
    isFetchingNextPage: isFetchingNextTokenMemes,
    isLoading: isLoadingTokenMemes,
    isPending: isPendingTokenMemes,
  } = useMemes({ category: "tokens" });

  const {
    creators: creatorsData,
    fetchNextPage: fetchNextCreators,
    hasNextPage: hasNextCreators,
    isFetchingNextPage: isFetchingNextCreators,
    isLoading: isLoadingCreators,
    isPending: isPendingCreators,
  } = useCreators({ category: "creators" });

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

  // Filter memes based on search query
  const filteredMemes = debouncedSearchQuery
    ? tokenMemesData.filter((meme) => {
        const searchLower = debouncedSearchQuery.toLowerCase();
        return (
          meme.name?.toLowerCase().includes(searchLower) ||
          meme.ticker?.toLowerCase().includes(searchLower) ||
          meme.handle?.toLowerCase().includes(searchLower) ||
          meme.description?.toLowerCase().includes(searchLower)
        );
      })
    : [];

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

  // Handle click outside to close the search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        event.target instanceof Node &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Open search results when typing
  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsSearchOpen(true);
    }
  }, [debouncedSearchQuery]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white md:mt-20 relative">
        <div className="md:px-20 px-5 py-12 mx-auto">
          <h1 className="mb-8 md:text-6xl text-3xl font-bold text-black font-clash">
            Explore Memes
          </h1>
          <div className="relative flex-1 mb-10" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search memes..."
                className="pl-10 bg-white border-2 border-black pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (debouncedSearchQuery) setIsSearchOpen(true);
                }}
              />
              {searchQuery && (
                <button
                  className="absolute right-3"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && debouncedSearchQuery && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-black rounded-md shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-500">
                    {filteredMemes.length} results for "{debouncedSearchQuery}"
                  </p>
                </div>

                {filteredMemes.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredMemes.slice(0, 5).map((meme) => (
                      <Link
                        href={`/meme/${meme.tokenAddress}`}
                        key={meme.tokenAddress}
                        className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <div className="flex-shrink-0 h-12 w-12 relative overflow-hidden rounded-md">
                          {meme.image ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${meme.image}`}
                              alt={meme.name || ""}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {meme.name || ""}
                          </p>
                          {meme.ticker && (
                            <p className="text-xs text-gray-500">
                              {meme.ticker}
                            </p>
                          )}
                          {meme.handle && (
                            <p className="text-xs text-gray-400">
                              by {meme.handle}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                    {/* {filteredMemes.length > 5 && (
                      <div className="p-3 text-center">
                        <Link
                          href={`/search?q=${encodeURIComponent(
                            debouncedSearchQuery
                          )}`}
                          className="text-sm text-primary font-medium hover:underline"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          View all {filteredMemes.length} results
                        </Link>
                      </div>
                    )} */}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No results found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Tabs
            defaultValue="tokens"
            className="mb-8"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="relative" ref={tabsListRef}>
              <TabsList
                defaultValue="tokens"
                className="w-full h-auto p-0 bg-transparent border-b border-gray-200"
              >
                {["tokens", "creators"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-6 py-3 cursor-pointer hover:bg-secondary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary transition-colors"
                    ref={(el) => {
                      tabRefs.current[tab] = el;
                    }}
                  >
                    {tab === "tokens"
                      ? "Tokens"
                      : tab === "creators"
                      ? "Creators"
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

            <TabsContent value="tokens" className="mt-8">
              {isPendingTokenMemes ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ExploreCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {tokenMemesData && tokenMemesData.length > 0 ? (
                    tokenMemesData.map((meme) => (
                      <MemeCard key={meme._id} meme={meme} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-gray-500">No token memes found</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators" className="mt-8">
              {isPendingCreators ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <RewardCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {creatorsData && creatorsData.length > 0 ? (
                    creatorsData.map((creator) => (
                      <CreatorCard key={creator.address} creator={creator} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-gray-500">No creator memes found</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-12">
            {activeTab === "tokens" && hasNextTokenMemes && (
              <Button
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white"
                onClick={() => fetchNextTokenMemes()}
                disabled={isFetchingNextTokenMemes}
              >
                {isFetchingNextTokenMemes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            )}
            {activeTab === "creators" && hasNextCreators && (
              <Button
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white"
                onClick={() => fetchNextCreators()}
                disabled={isFetchingNextCreators}
              >
                {isFetchingNextCreators ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
