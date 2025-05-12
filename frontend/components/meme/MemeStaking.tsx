import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Info, Loader2 } from "lucide-react";

interface MemeStakingProps {
  profile: any;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  isStaking: boolean;
  handleStake: () => void;
}

const MemeStaking: React.FC<MemeStakingProps> = ({
  profile,
  stakeAmount,
  setStakeAmount,
  isStaking,
  handleStake,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              Stake Your Tokens
            </h3>

            <p className="text-gray-600 mb-4">
              Stake your {profile.tokenSymbol} tokens to earn rewards when this
              meme goes viral. Staking represents your belief in this meme's
              potential.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="stake-amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stake Amount (${profile.tokenSymbol})
                </label>
                <div className="flex gap-2">
                  <input
                    id="stake-amount"
                    type="number"
                    placeholder="Enter amount"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <Button
                    className="bg-primary hover:bg-primary/90 hover:shadow-2xl"
                    onClick={handleStake}
                    disabled={
                      isStaking || !stakeAmount || Number(stakeAmount) <= 0
                    }
                  >
                    {isStaking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Staking...
                      </>
                    ) : (
                      "Stake Now"
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-primary mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">Staking benefits:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Earn a share of fees from trading volume</li>
                      <li>Receive bonus tokens when heat score increases</li>
                      <li>Priority access to new features and battles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              Recent Staking Rewards
            </h3>

            {(() => {
              const stakingRewards = [
                {
                  id: "1",
                  reason: "Heat Score Milestone (75+)",
                  date: "2023-06-15",
                  amount: 25000,
                },
                {
                  id: "2",
                  reason: "Battle Victory Bonus",
                  date: "2023-06-10",
                  amount: 15000,
                },
                {
                  id: "3",
                  reason: "Weekly Trading Volume Share",
                  date: "2023-06-07",
                  amount: 8500,
                },
              ];

              return (
                <div className="space-y-4">
                  {stakingRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{reward.reason}</p>
                        <p className="text-sm text-gray-500">{reward.date}</p>
                      </div>
                      <Badge className="bg-primary hover:bg-primary text-white">
                        +{reward.amount.toLocaleString()} ${profile.tokenSymbol}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-primary mt-0.5" />
                <p className="text-sm text-gray-600">
                  Rewards are distributed based on your stake percentage and the
                  meme's performance. Higher heat scores lead to more frequent
                  rewards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemeStaking;
