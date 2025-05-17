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

import { useAccount, useWalletClient } from "wagmi";
import { Abi, WalletClient } from "viem";
import CONTRACTS from "@/config/contracts";
import { useChainSwitch } from "@/hooks/useChainSwitch";
import { chains } from "@lens-chain/sdk/viem";
import { config } from "@/providers/Web3Provider";
import { waitForTransactionReceipt } from "wagmi/actions";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import factoryAbi from "@/config/factoryABI.json";
import { Meme } from "@/app/types";
// Mock data for potential opponents

const getMemeHeatScore = async (handle: string) => {
  // try {
  //   const result = await readContract(config,{
  //     abi: factoryAbi as Abi,
  //     address: CONTRACTS.factory as `0x${string}`,
  //     functionName: 'getTokens',
  //     args: [handle as `0x${string}`],
  //   })

  //   console.log('Fetched tokens:', result)
  //   return result // this will be a TokenData[] array
  // } catch (err) {
  //   console.error('Error fetching tokens:', err)
  //   return []
  // }

  try {
    console.log(handle);
    const res = await axiosInstance.get(`/api/heat/${handle}`);
    return res.data;
  } catch (error: any) {
    // console.log(error)
    const axiosErr = error as AxiosError<{ error?: string }>;
    const message =
      axiosErr?.response?.data?.error ||
      axiosErr?.message ||
      "Failed to get heat score";
    throw new Error(message);
  }
};
const MemeBattles = ({ meme }: { meme: Meme }) => {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [challengingMeme, setChallengingMeme] = useState<boolean>(false);
  const [heatScore, setHeatScore] = useState<number>(0);
  const [battleDuration, setBattleDuration] = useState("24"); // Default 24 hours
  const toast = useCustomToast();
  const { chain, switchToChain } = useChainSwitch();
  const {
    memes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useMemes({ initialLimit: 10, category: "tokens" });

  //check chain
  useEffect(() => {
    if (chain?.id !== chains.testnet.id) {
      switchToChain();
    }
  }, [chain, switchToChain]);

  const { data } = useWalletClient();

  // Filter opponents based on search query
  const filteredOpponents = memes.filter(
    (currMeme) => currMeme.tokenAddress !== meme.tokenAddress
    // meme.handle?.toLowerCase() === profile.creatorHandle
  );

  // useEffect(() => {
  //   if (filteredOpponents && filteredOpponents.length !== 0) {
  //     getMemeHeatScore(filteredOpponents[0].tokenAddress).then((data) => {
  //       setHeatScore(data.heatScore)
  //     }).catch((err) => console.log(err))
  //   }
  // }, [filteredOpponents])

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
            description: `You've challenged ${selectedOpponent.name} to a ${battleDuration}-hour battle`,
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
      setBattleDuration("24");
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

  console.log(selectedOpponent);

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
            Ongoing ({0})
          </TabsTrigger>
          <TabsTrigger
            value="won"
            className="flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle size={16} />
            Won ({0})
          </TabsTrigger>
          <TabsTrigger
            value="lost"
            className="flex items-center gap-1 cursor-pointer"
          >
            <XCircle size={16} />
            Lost ({0})
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="ongoing" className="space-y-4">
          {ongoingBattles.length > 0 ? (
            ongoingBattles.map((battle) => (
              <RenderBattleCard
                key={battle.id}
                battle={battle}
                profile={profile}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No ongoing battles. Challenge someone to start a battle!</p>
            </div>
          )}
        </TabsContent> */}

        {/* <TabsContent value="won" className="space-y-4">
          {wonBattles.length > 0 ? (
            wonBattles.map((battle) => (
              <RenderBattleCard
                key={battle.id}
                battle={battle}
                profile={profile}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No won battles yet. Keep battling to earn victories!</p>
            </div>
          )}
        </TabsContent> */}
        {/* 
        <TabsContent value="lost" className="space-y-4">
          {lostBattles.length > 0 ? (
            lostBattles.map((battle) => (
              <RenderBattleCard
                key={battle.id}
                battle={battle}
                profile={profile}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No lost battles. Keep up the good work!</p>
            </div>
          )}
        </TabsContent> */}
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
              <div className="border rounded-md max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
                {filteredOpponents.length > 0 ? (
                  filteredOpponents.map((opponent) => (
                    <div
                      key={opponent._id}
                      className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                        selectedOpponent?._id === opponent._id
                          ? "bg-gray-50"
                          : ""
                      }`}
                      onClick={() => setSelectedOpponent(opponent)}
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
                        {heatScore} {/* HeatScore Update */}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No memes found matching your search</p>
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Battle Duration</h4>
                <div className="grid grid-cols-3 gap-2">
                  {["24", "48", "72"].map((hours) => (
                    <Button
                      key={hours}
                      variant={battleDuration === hours ? "default" : "outline"}
                      className={
                        battleDuration === hours
                          ? "bg-primary hover:bg-primary/90"
                          : ""
                      }
                      onClick={() => setBattleDuration(hours)}
                    >
                      {hours} hours
                    </Button>
                  ))}
                </div>
              </div>

              {selectedOpponent && (
                <div className="p-4 border rounded-md bg-gray-50">
                  <h4 className="font-medium mb-2">Battle Summary</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={selectedOpponent.image}
                          alt={selectedOpponent.name}
                        />
                        <AvatarFallback>
                          {selectedOpponent.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedOpponent.name}</span>
                    </div>

                    <ArrowRight size={16} className="text-gray-500" />

                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={selectedOpponent.image}
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
