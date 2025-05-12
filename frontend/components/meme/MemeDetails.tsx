import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  LineChart,
  Flame,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  DollarSign,
  Activity,
  Volume2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface MemeDetailsProps {
  profile: any;
}

// Mock price history data
const generatePriceData = () => {
  // Generate 30 days of price data with some volatility
  const data = [];
  let price = 0.05; // Starting price
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some random volatility
    const change = (Math.random() - 0.5) * 0.01;
    price = Math.max(0.001, price + change); // Ensure price doesn't go below 0.001

    data.push({
      date: date.toISOString().split("T")[0],
      price: price.toFixed(5),
      volume: Math.floor(Math.random() * 500000) + 100000,
    });
  }

  return data;
};

// Mock trading activity
const recentTrades = [
  {
    id: 1,
    type: "buy",
    amount: 25000,
    price: 0.052,
    time: "10 mins ago",
    wallet: "0x8f23...4a21",
  },
  {
    id: 2,
    type: "sell",
    amount: 12000,
    price: 0.051,
    time: "25 mins ago",
    wallet: "0x3e7b...9c45",
  },
  {
    id: 3,
    type: "buy",
    amount: 50000,
    price: 0.05,
    time: "42 mins ago",
    wallet: "0xf12c...6d78",
  },
  {
    id: 4,
    type: "buy",
    amount: 8000,
    price: 0.049,
    time: "1 hour ago",
    wallet: "0x2a9d...1e34",
  },
  {
    id: 5,
    type: "sell",
    amount: 30000,
    price: 0.048,
    time: "2 hours ago",
    wallet: "0x7b3c...8f12",
  },
];

const MemeDetails: React.FC<MemeDetailsProps> = ({ profile }) => {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [chartTimeframe, setChartTimeframe] = useState("7d");
  const [priceChange, setPriceChange] = useState({
    value: 0,
    percentage: 0,
    isPositive: true,
  });

  useEffect(() => {
    // Generate mock price data when component mounts
    const data = generatePriceData();
    setPriceData(data);

    // Calculate price change
    if (data.length >= 2) {
      const currentPrice = parseFloat(data[data.length - 1].price);
      const previousPrice = parseFloat(data[0].price);
      const change = currentPrice - previousPrice;
      const percentChange = (change / previousPrice) * 100;

      setPriceChange({
        value: Math.abs(change),
        percentage: Math.abs(percentChange),
        isPositive: change >= 0,
      });
    }
  }, []);

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (!priceData.length) return [];

    const days =
      chartTimeframe === "24h"
        ? 1
        : chartTimeframe === "7d"
        ? 7
        : chartTimeframe === "30d"
        ? 30
        : 90;

    return priceData.slice(-days - 1);
  };

  const filteredData = getFilteredData();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Token Details
          </h3>
          <div className="grid gap-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Token Symbol:</span>
              <span className="font-medium">${profile.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Price:</span>
              <span className="font-medium">{profile.tokenPrice} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Supply:</span>
              <span className="font-medium">
                {profile.totalSupply.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Circulating Supply:</span>
              <span className="font-medium">
                {profile.circulatingSupply.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Holders:</span>
              <span className="font-medium">
                {profile.holders.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button className="bg-primary hover:bg-primary/90 hover:shadow-2xl cursor-pointer">
              Buy Tokens
            </Button>
            <Button
              variant="outline"
              className="border-2 border-black hover:bg-black hover:text-white cursor-pointer"
              onClick={() => setIsChartOpen(true)}
            >
              <LineChart size={16} className="mr-2" />
              View Chart
            </Button>

            {/* Price Chart Modal */}
            <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-bold text-xl">
                      ${profile.tokenSymbol} Price Chart
                    </span>
                    <Badge
                      className={`${
                        priceChange.isPositive
                          ? "bg-green-500 hover:bg-green-500"
                          : "bg-red-500 hover:bg-red-500"
                      } text-white`}
                    >
                      {priceChange.isPositive ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {priceChange.percentage.toFixed(2)}%
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Current price: {profile.tokenPrice} ETH
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                  <Tabs defaultValue="chart" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="chart">Price Chart</TabsTrigger>
                      <TabsTrigger value="trades">Recent Trades</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold">
                            {profile.tokenPrice} ETH
                          </h3>
                          <div className="flex items-center gap-1 text-sm">
                            <span
                              className={
                                priceChange.isPositive
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {priceChange.isPositive ? "+" : "-"}
                              {priceChange.value.toFixed(5)} ETH (
                              {priceChange.percentage.toFixed(2)}%)
                            </span>
                            <span className="text-gray-500">
                              Past {chartTimeframe}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {["24h", "7d", "30d", "90d"].map((timeframe) => (
                            <Button
                              key={timeframe}
                              variant={
                                chartTimeframe === timeframe
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className={
                                chartTimeframe === timeframe
                                  ? "bg-primary hover:bg-primary/90"
                                  : ""
                              }
                              onClick={() => setChartTimeframe(timeframe)}
                            >
                              {timeframe}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Chart visualization */}
                      <div className="h-[300px] w-full relative border border-gray-200 rounded-lg p-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* This would be replaced with an actual chart library in production */}
                          <div className="w-full h-full flex flex-col">
                            <div className="flex-1 relative">
                              {/* Simple price line visualization */}
                              <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d={`M0,${
                                    100 -
                                    parseFloat(filteredData[0]?.price) * 1000
                                  } ${filteredData
                                    .map(
                                      (point, i) =>
                                        `L${
                                          (i / (filteredData.length - 1)) * 100
                                        },${
                                          100 - parseFloat(point.price) * 1000
                                        }`
                                    )
                                    .join(" ")}`}
                                  fill="none"
                                  stroke={
                                    priceChange.isPositive
                                      ? "#10b981"
                                      : "#ef4444"
                                  }
                                  strokeWidth="2"
                                />
                              </svg>

                              {/* Price markers */}
                              <div className="absolute top-0 right-0 p-2 text-sm text-gray-500">
                                {Math.max(
                                  ...filteredData.map((d) =>
                                    parseFloat(d.price)
                                  )
                                ).toFixed(5)}{" "}
                                ETH
                              </div>
                              <div className="absolute bottom-0 right-0 p-2 text-sm text-gray-500">
                                {Math.min(
                                  ...filteredData.map((d) =>
                                    parseFloat(d.price)
                                  )
                                ).toFixed(5)}{" "}
                                ETH
                              </div>
                            </div>

                            {/* Date markers */}
                            <div className="h-6 flex justify-between text-xs text-gray-500 mt-2">
                              <span>{filteredData[0]?.date}</span>
                              <span>
                                {
                                  filteredData[
                                    Math.floor(filteredData.length / 2)
                                  ]?.date
                                }
                              </span>
                              <span>
                                {filteredData[filteredData.length - 1]?.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats cards */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign size={16} className="text-primary" />
                              <span className="text-sm text-gray-500">
                                Market Cap
                              </span>
                            </div>
                            <p className="font-bold">
                              {(
                                profile.circulatingSupply *
                                parseFloat(profile.tokenPrice)
                              ).toLocaleString()}{" "}
                              ETH
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Volume2 size={16} className="text-primary" />
                              <span className="text-sm text-gray-500">
                                24h Volume
                              </span>
                            </div>
                            <p className="font-bold">
                              {(
                                Math.floor(Math.random() * 50000) + 10000
                              ).toLocaleString()}{" "}
                              ETH
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity size={16} className="text-primary" />
                              <span className="text-sm text-gray-500">
                                Volatility
                              </span>
                            </div>
                            <p className="font-bold">
                              {(Math.random() * 10 + 5).toFixed(2)}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="trades">
                      <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Price</div>
                          <div>Time</div>
                          <div>Wallet</div>
                        </div>

                        {recentTrades.map((trade) => (
                          <div
                            key={trade.id}
                            className="grid grid-cols-5 gap-4 p-3 border-b last:border-b-0 text-sm"
                          >
                            <div>
                              <Badge
                                className={
                                  trade.type === "buy"
                                    ? "bg-green-500 hover:bg-green-500"
                                    : "bg-red-500 hover:bg-red-500"
                                }
                              >
                                {trade.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div>
                              {trade.amount.toLocaleString()} $
                              {profile.tokenSymbol}
                            </div>
                            <div>{trade.price} ETH</div>
                            <div>{trade.time}</div>
                            <div className="truncate">{trade.wallet}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-sm text-gray-500 flex items-start gap-2">
                        <Info size={16} className="mt-0.5" />
                        <p>
                          All trades are executed on-chain. The price is
                          determined by the current liquidity pool ratio. Large
                          trades may experience slippage.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
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
              <span className="font-bold text-xl">{profile.heatScore}/100</span>
            </div>
            <Progress value={profile.heatScore} className="h-3" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} className="text-blue-500" />
              <span className="text-gray-700">
                Engagement rate is above average
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-gray-700">Trending in 3 communities</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-gray-700">
                Won 2 out of 3 recent battles
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
