import {
  Trophy,
  Search,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ArrowRight,
  Loader2,
  ClockIcon,
  FlameIcon,
  ArrowUpIcon,
  Swords,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { writeContract, simulateContract, readContract } from "@wagmi/core";
import MemedBattleABI from "@/config/memedBattleABI.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useCustomToast } from "@/components/ui/custom-toast";
import { Flame } from "lucide-react";
import { RenderBattleCard } from "./RenderBattleCard";
import { useMemes } from "@/hooks/useMemes";

import { useAccount } from "wagmi";
import { Abi } from "viem";
import CONTRACTS from "@/config/contracts";
import { TransactionType, useChainSwitch } from "@/hooks/useChainSwitch";
import { chains } from "@lens-chain/sdk/viem";
import { config } from "@/providers/Web3Provider";
import { waitForTransactionReceipt } from "wagmi/actions";
import factoryAbi from "@/config/factoryABI.json";
import { Meme, MemeBattle } from "@/app/types";
import MemeBattleCard from "./MemeBattleCard";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import Link from "next/link";
import { getMemeBattles } from "@/utils/getMemeBattles";
import { BattleCardSkeleton } from "../shared/skeletons/BattleCardSkeleton";
import { useAccountStore } from "@/store/accountStore";

// Mock data for potential opponents

export interface Battle extends Omit<MemeBattle, "memeA" | "memeB"> {
  memeA: {
    name: string;
    description: string;
    image: string;
    handle: string;
    heatScoreA: bigint;
    isLeading: boolean;
  };
  memeB: {
    name: string;
    description: string;
    image: string;
    handle: string;
    heatScoreB: bigint;
    isLeading: boolean;
  };
  ending: Date;
}

interface MemeDetails extends Meme {
  heat: bigint;
}

const getMemeHeatScore = async (token: string) => {
  try {
    if (!token) return;

    const result: any = await readContract(config, {
      abi: factoryAbi as Abi,
      address: CONTRACTS.factory as `0x${string}`,
      functionName: "getTokens",
      args: [token as `0x${string}`],
    });

    return result[0].heat; // this will be a TokenData[] array
  } catch (err) {
    console.error("Error fetching tokens:", err);
    return [];
  }
};

const getMemeInfo = (
  tokenAddress: string
): Promise<{
  name: string;
  description: string;
  image: string;
  handle: string;
  tokenAddress: string;
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

const MemeBattles = ({ meme }: { meme: Meme }) => {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMemes, setLoadingMemes] = useState<boolean>(true);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [challengingMeme, setChallengingMeme] = useState<boolean>(false);

  const [battles, setBattles] = useState<Battle[]>([]);
  const toast = useCustomToast();
  const { chain, switchToChain } = useChainSwitch();
  const [opponents, setOpponents] = useState<MemeDetails[]>([]);
  const [filteredOpponents, setFilteredOpponents] = useState<MemeDetails[]>([]);
  const [memeA, setMemeA] = useState<any>()
  const [isLoadingMemeBattles, setIsLoadingMemeBattles] =
    useState<boolean>(true);

  const {
    memes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useMemes({ initialLimit: 10, category: "tokens" });

  // Get Handle 
  const {
    selectedAccount: selectedAccountStore,

  } = useAccountStore();

  useEffect(() => {
    console.log(memeA)
  },[memeA])

  //check chain
  useEffect(() => {
    //switch to mainnet
    if (chain && chain?.id !== chains.mainnet.id) {
      switchToChain(TransactionType.accountCreation);
    }
  }, [chain, switchToChain]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredOpponents(
        opponents.filter(
          (currMeme) =>
            currMeme.tokenAddress !== meme.tokenAddress &&
            (currMeme?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
              currMeme?.ticker
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())) &&
            currMeme.handle !== meme.handle
        )
      );
    } else {
      setFilteredOpponents(
        opponents.filter(
          (currMeme) => currMeme.tokenAddress !== meme.tokenAddress
        )
      );
    }
  }, [searchQuery, opponents]);

  const fetchMemeBattles = async () => {
    setIsLoadingMemeBattles(true);
    const memeBattles = await getMemeBattles(meme.tokenAddress);
    const battleRes = await Promise.all(
      memeBattles
        .filter(
          (battle) =>
            battle.memeA !== "0x0000000000000000000000000000000000000000" &&
            battle.memeB !== "0x0000000000000000000000000000000000000000"
        )
        .map(async (battle) => {
          const memeA = await getMemeInfo(battle.memeA);
          const memeB = await getMemeInfo(battle.memeB);
          const heatScoreA = await getMemeHeatScore(memeA.tokenAddress);
          const heatScoreB = await getMemeHeatScore(memeB.tokenAddress);

          return {
            ...battle,
            ending: new Date(Number(battle.endTime) * 1000),
            memeA: {
              ...memeA,
              heatScoreA,
              isLeading: heatScoreA > heatScoreB,
            },
            memeB: {
              ...memeB,
              heatScoreB,
              isLeading: heatScoreB > heatScoreA,
            },
          };
        })
    );
    setBattles(battleRes);
    setIsLoadingMemeBattles(false);
  };
  const fetchOpponents = async () => {
    setLoadingMemes(true);
    // Filter opponents based on search query
    const filteredOpponentsWithHeat = await Promise.all(
      memes.map(async (opp) => {
        const heatScore = await getMemeHeatScore(opp.tokenAddress);
        return {
          ...opp,
          heat: heatScore,
        };
      })
    );
    setLoadingMemes(false);

    return filteredOpponentsWithHeat;
  };

  const handleChallenge = async () => {
    try {
      if (!selectedOpponent) {
        toast.error("Select an opponent", {
          description: "Please select a meme to challenge",
        });
        return;
      }
      setChallengingMeme(true);

      const contractAddress = CONTRACTS.memedBattle;

      try {
        console.log("🚀 Starting battle...");

        const { request } = await simulateContract(config, {
          abi: MemedBattleABI as Abi,
          address: contractAddress as `0x${string}`,
          functionName: "startBattle",
          args: [selectedOpponent.tokenAddress as `0x${string}`],
          account: address,
        });

        const hash = await writeContract(config, request);

        // Wait for transaction to be mined
        const receipt = await waitForTransactionReceipt(config, { hash });

        const isSuccess = receipt.status === "success";

        if (isSuccess) {
          toast.success("Challenge sent!", {
            description: `You've challenged ${selectedOpponent.name} to a 24-hour battle`,
          });
        }

        console.log("✅ Battle transaction sent:", hash);
      } catch (err: any) {
        console.log("Start Battle Meme Error : ", err);
        const message =
          err?.shortMessage ||
          err?.message ||
          "Something went wrong while starting the battle";

        throw new Error(message);
      }

      setIsModalOpen(false);
      setSelectedOpponent(null);
      setSearchQuery("");
    } catch (error: any) {
      setChallengingMeme(false);
      toast.error("Battle failed", {
        description: error?.message || "Something went wrong",
      });
      console.log(error);
    } finally {
      setChallengingMeme(false);
    }
  };

  useEffect(() => {
    if (memes && address) {
      fetchOpponents()
        .then((res) => setOpponents(res))
        .catch((err) => console.log(err));
    }
  }, [isLoading, address]);

  useEffect(() => {
    if (memes && address) {
      fetchMemeBattles();
    }
  }, [isLoading, address]);

  useEffect(() => {
    if (battles) {
      console.log(battles);
    }
  }, [battles]);

  return (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Trophy size={20} className="text-primary" />
          Meme Battles
        </h3>
        <p className="text-gray-500">
          Battles occur as Lens threads where users engage and vote. Winners
          receive bonus token mints and increased visibility.
        </p>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger
            value="ongoing"
            className="flex items-center gap-1 cursor-pointer  "
          >
            <Clock size={16} />
            Ongoing (
            {
              battles.filter(
                (battle) =>
                  battle.winner === "0x0000000000000000000000000000000000000000"
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="won"
            className="flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle size={16} />
            Won (
            {
              battles.filter((battle) => battle.winner === meme.tokenAddress)
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="lost"
            className="flex items-center gap-1 cursor-pointer"
          >
            <XCircle size={16} />
            Lost (
            {
              battles.filter(
                (battle) =>
                  battle.winner !== meme.tokenAddress &&
                  battle.winner !== "0x0000000000000000000000000000000000000000"
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="ongoing"
          className="space-y-4 grid md:grid-cols-2 grid-cols-1 gap-4"
        >
          {isLoadingMemeBattles ? (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 col-span-2">
              <BattleCardSkeleton />
              <BattleCardSkeleton />
            </div>
          ) : battles && battles.length !== 0 ? (
            battles
              .filter(
                (battle) =>
                  battle.winner === "0x0000000000000000000000000000000000000000"
              )
              .map((battle) => (
                <MemeBattleCard
                  key={battle.battleId}
                  battle={battle}
                  winner={false}
                  pending={true}
                />
              ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center col-span-2">
              <Swords className="w-12 h-12 mb-4 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">
                No Ongoing Meme Battle Found
              </h2>
              <p className="mb-6 text-gray-600">
                You don't have any Ongoing meme battle at the moment.
              </p>
              <Link href="/explore">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  Explore Memes
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="won"
          className="space-y-4 grid md:grid-cols-2 gap-4"
        >
          {isLoadingMemeBattles ? (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 col-span-2">
              <BattleCardSkeleton />
              <BattleCardSkeleton />
            </div>
          ) : battles.filter((battle) => battle.winner === meme.tokenAddress)
            .length !== 0 ? (
            battles
              .filter((battle) => battle.winner === meme.tokenAddress)
              .map((battle) => (
                <MemeBattleCard
                  key={battle.battleId}
                  battle={battle}
                  winner={true}
                  pending={false}
                />
              ))
          ) : (
            <div className="flex flex-col items-center col-span-2 justify-center py-16 text-center">
              <Swords className="w-12 h-12 mb-4 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">
                Still waiting for that first meme battle victory.
              </h2>
              <p className="mb-6 text-gray-600">
                Hasn't claimed a win in any meme battles yet — the grind for
                glory continues.
              </p>
              <Link href="/explore">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  Explore Memes
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="lost"
          className="space-y-4 grid md:grid-cols-2 gap-4"
        >
          {isLoadingMemeBattles ? (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 col-span-2">
              <BattleCardSkeleton />
              <BattleCardSkeleton />
            </div>
          ) : battles.filter(
            (battle) =>
              battle.winner !== meme.tokenAddress &&
              battle.winner !== "0x0000000000000000000000000000000000000000"
          ).length !== 0 ? (
            battles
              .filter(
                (battle) =>
                  battle.winner !== meme.tokenAddress &&
                  battle.winner !== "0x0000000000000000000000000000000000000000"
              )
              .map((battle) => (
                <MemeBattleCard
                  key={battle.battleId}
                  battle={battle}
                  winner={false}
                  pending={false}
                />
              ))
          ) : (
            <div className="flex flex-col items-center col-span-2 justify-center py-16 text-center">
              <Swords className="w-12 h-12 mb-4 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">
                Still undefeated in meme battles.
              </h2>
              <p className="mb-6 text-gray-600">
                Never known defeat — still going strong.
              </p>
              <Link href="/explore">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  Explore Memes
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer">
              <Trophy size={16} />
              Challenge to Battle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Challenge to Battle</DialogTitle>
              <DialogDescription>
                Select a meme token to challenge to a battle. Winners receive
                bonus token mints and increased visibility.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memes by name or symbol"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="border rounded-md max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
                {loadingMemes ? (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Loader2 className="animate-spin" />
                    <p>Loading Memes..</p>
                  </div>
                ) : filteredOpponents.length > 0 ? (
                  filteredOpponents.map((opponent) => (
                    <div
                      key={opponent._id}
                      className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${selectedOpponent?._id === opponent._id
                        ? "bg-gray-50"
                        : ""
                        }`}
                      onClick={() => {
                        setSelectedOpponent(opponent)
                        setMemeA(opponents.filter((opp) => opp.handle === selectedAccountStore?.username.localName))
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={opponent.image}
                            alt={opponent.name}
                          />
                          <AvatarFallback>
                            {opponent.name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{opponent.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">${opponent.ticker}</Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-amber-500 hover:bg-amber-500 flex items-center gap-1">
                        <Flame size={12} />
                        {Intl.NumberFormat("en", {
                          notation: "compact",
                        }).format(Number(opponent.heat))}{" "}
                        {/* HeatScore Update */}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No memes found matching your search</p>
                  </div>
                )}
              </div>

              

              {selectedOpponent && memeA[0] && (
                <div className="p-4 border rounded-md bg-gray-50">
                  <h4 className="font-medium mb-2">Battle Summary</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${memeA[0].image}`}
                          alt={memeA[0].name}
                        />
                        <AvatarFallback>
                          {memeA[0].name}
                        </AvatarFallback>
                      </Avatar>
                      <span>{memeA[0].name}</span>
                    </div>

                    <ArrowRight size={16} className="text-gray-500" />

                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${selectedOpponent.image}`}
                          alt={selectedOpponent.name}
                        />
                        <AvatarFallback>
                          {selectedOpponent.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedOpponent.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 cursor-pointer  "
                onClick={() => handleChallenge()}
                disabled={!selectedOpponent}
              >
                {challengingMeme ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Start Battle"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default MemeBattles;
