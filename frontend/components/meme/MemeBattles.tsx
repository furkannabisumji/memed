import {
  Trophy,
  Search,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useState } from "react";
import { useCustomToast } from "@/components/ui/custom-toast";
import { Flame } from "lucide-react";
import { RenderBattleCard } from "./RenderBattleCard";

// Mock data for potential opponents
const potentialOpponents = [
  {
    id: "1",
    name: "Pepe's Adventure",
    symbol: "PEPE",
    image: "/fallback.png",
    followers: 65420,
    heatScore: 82,
  },
  {
    id: "2",
    name: "Wojak Feels",
    symbol: "WOJAK",
    image: "/fallback.png",
    followers: 42180,
    heatScore: 75,
  },
  {
    id: "3",
    name: "Stonks Guy",
    symbol: "STONK",
    image: "/fallback.png",
    followers: 38750,
    heatScore: 79,
  },
  {
    id: "4",
    name: "Distracted Boyfriend",
    symbol: "DISTRACT",
    image: "/fallback.png",
    followers: 29840,
    heatScore: 68,
  },
  {
    id: "5",
    name: "This is Fine",
    symbol: "FINE",
    image: "/fallback.png",
    followers: 52340,
    heatScore: 77,
  },
  {
    id: "6",
    name: "Galaxy Brain",
    symbol: "BRAIN",
    image: "/fallback.png",
    followers: 31250,
    heatScore: 71,
  },
  {
    id: "7",
    name: "Moon",
    symbol: "MOON",
    image: "/fallback.png",
    followers: 42180,
    heatScore: 85,
  },
  {
    id: "8",
    name: "Like a Boss",
    symbol: "BOSS",
    image: "/fallback.png",
    followers: 38750,
    heatScore: 82,
  },
  {
    id: "9",
    name: "Arthur's Fist",
    symbol: "FIST",
    image: "/fallback.png",
    followers: 29840,
    heatScore: 73,
  },
  {
    id: "10",
    name: "Overly Attached Girlfriend",
    symbol: "OAG",
    image: "/fallback.png",
    followers: 52340,
    heatScore: 74,
  },
  {
    id: "11",
    name: "Scumbag Steve",
    symbol: "SCUMBAG",
    image: "/fallback.png",
    followers: 31250,
    heatScore: 86,
  },
];

// Mock data for battles
const mockBattles = [
  {
    id: "1",
    opponent: "Pepe's Adventure",
    opponentImage: "/fallback.png",
    status: "ongoing",
    endTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    votes: 12500,
    opponentVotes: 10200,
  },
  {
    id: "2",
    opponent: "Wojak Feels",
    opponentImage: "/fallback.png",
    status: "ongoing",
    endTime: new Date(Date.now() + 172800000).toISOString(), // 48 hours from now
    votes: 8200,
    opponentVotes: 7900,
  },
  {
    id: "3",
    opponent: "Stonks Guy",
    opponentImage: "/fallback.png",
    status: "won",
    endTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    votes: 18900,
    opponentVotes: 12300,
  },
  {
    id: "4",
    opponent: "Distracted Boyfriend",
    opponentImage: "/fallback.png",
    status: "won",
    endTime: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    votes: 22400,
    opponentVotes: 19800,
  },
  {
    id: "5",
    opponent: "This is Fine",
    opponentImage: "/fallback.png",
    status: "lost",
    endTime: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    votes: 8700,
    opponentVotes: 9800,
  },
  {
    id: "6",
    opponent: "Galaxy Brain",
    opponentImage: "/fallback.png",
    status: "lost",
    endTime: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    votes: 15200,
    opponentVotes: 17500,
  },
];

const MemeBattles = ({ profile }: { profile: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [battleDuration, setBattleDuration] = useState("24"); // Default 24 hours
  const toast = useCustomToast();

  // Filter battles by status
  const ongoingBattles = mockBattles.filter(
    (battle) => battle.status === "ongoing"
  );
  const wonBattles = mockBattles.filter((battle) => battle.status === "won");
  const lostBattles = mockBattles.filter((battle) => battle.status === "lost");

  // Filter opponents based on search query
  const filteredOpponents = potentialOpponents.filter(
    (opponent) =>
      opponent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opponent.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChallenge = () => {
    if (!selectedOpponent) {
      toast.error("Select an opponent", {
        description: "Please select a meme to challenge",
      });
      return;
    }

    toast.success("Challenge sent!", {
      description: `You've challenged ${selectedOpponent.name} to a ${battleDuration}-hour battle`,
    });

    setIsModalOpen(false);
    setSelectedOpponent(null);
    setBattleDuration("24");
    setSearchQuery("");
  };

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
            Ongoing ({ongoingBattles.length})
          </TabsTrigger>
          <TabsTrigger
            value="won"
            className="flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle size={16} />
            Won ({wonBattles.length})
          </TabsTrigger>
          <TabsTrigger
            value="lost"
            className="flex items-center gap-1 cursor-pointer"
          >
            <XCircle size={16} />
            Lost ({lostBattles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
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
        </TabsContent>

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
                {filteredOpponents.length > 0 ? (
                  filteredOpponents.map((opponent) => (
                    <div
                      key={opponent.id}
                      className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                        selectedOpponent?.id === opponent.id ? "bg-gray-50" : ""
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
                            {opponent.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{opponent.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">${opponent.symbol}</Badge>
                            <span>
                              {opponent.followers.toLocaleString()} followers
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-amber-500 hover:bg-amber-500 flex items-center gap-1">
                        <Flame size={12} />
                        {opponent.heatScore}
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
                          src={profile.profileImage}
                          alt={profile.displayName}
                        />
                        <AvatarFallback>
                          {profile.displayName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{profile.displayName}</span>
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
                className="bg-primary hover:bg-primary/90"
                onClick={handleChallenge}
                disabled={!selectedOpponent}
              >
                Start Battle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default MemeBattles;
