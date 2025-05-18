import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Flame,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Info,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

import { useState, useEffect } from "react";
import { Meme } from "@/app/types";
import { useTokenSupply } from "@/hooks/useTokenSupply";
import { Address } from "viem";
import { TokenStats } from "@/app/types";
import { getMemeBattles } from "@/utils/getMemeBattles";
import { useAccount } from "wagmi";

interface MemeDetailsProps {
  meme: Meme;
  stats?: TokenStats | null;
}

const MemeDetails: React.FC<MemeDetailsProps> = ({
  meme,
  stats,
}: {
  meme: Meme;
  stats?: TokenStats | null;
}) => {
  const [battlesWon, setBattlesWon] = useState(0);
  const [battleCount, setBattleCount] = useState(0);
  const { data: supplyData, isLoading } = useTokenSupply(
    meme.tokenAddress as Address
  );
  const { address } = useAccount();
  // console.log(supplyData);
  useEffect(() => {
    if (meme.tokenAddress && address) {
      getMemeBattles(meme.tokenAddress).then((res) => {
        setBattlesWon(
          res.filter((battle) => battle.winner === meme.tokenAddress).length
        );
        setBattleCount(
          res.filter(
            (battle) =>
              battle.memeA !== "0x0000000000000000000000000000000000000000" &&
              battle.memeB !== "0x0000000000000000000000000000000000000000"
          ).length
        );
      });
    }
  }, [meme.tokenAddress, address]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow rounded-2xl bg-white">
        <CardContent className="p-6">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
            <BarChart3 size={24} className="text-primary" />
            Token Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supply Stats Card */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-gray-50">
              <CardContent className="p-5">
                <h4 className="text-lg font-medium mb-4 text-gray-700">
                  Supply Metrics
                </h4>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total Supply</span>
                  <span className="font-semibold text-gray-800">
                    {isLoading ? (
                      <span className="animate-pulse text-gray-400">
                        Loading...
                      </span>
                    ) : !supplyData ? (
                      "N/A"
                    ) : (
                      Number(supplyData).toLocaleString()
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Token Symbol Card */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-gray-50">
              <CardContent className="p-5">
                <h4 className="text-lg font-medium mb-4 text-gray-700">
                  Token Information
                </h4>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Token Symbol</span>
                  <span className="font-semibold text-gray-800">
                    ${meme.ticker}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flame size={20} className="text-amber-500" />
            Heat Score Analysis
          </h3>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Current Heat Score:</span>
              <span className="font-bold text-xl">
                {stats?.totalEngagements || 0}/100
              </span>
            </div>
            <Progress
              value={stats?.totalEngagements ? stats.totalEngagements % 100 : 0}
              max={100}
              className="h-3 w-full bg-gray-200"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} className="text-blue-500" />
              <span className="text-gray-700">Engagement rate coming up</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-gray-700">
                Trending in {stats?.totalEngagements || 0} communities
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-gray-700">
                Won {battlesWon} out of {battleCount} recent battles
              </span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5" />
              <p className="text-sm text-gray-600">
                Heat Score affects token minting rates and staking rewards.
                Higher scores lead to more frequent mints and better rewards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemeDetails;
