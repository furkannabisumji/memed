import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useParams } from "react-router-dom";
import { useReadContract, useWriteContract } from "wagmi";
import { useState } from "react";
import config from "@/config.json";
import { useToast } from "@/hooks/use-toast";
import { BigNumberish, formatEther, parseEther } from "ethers";
import { useAccount, useBalance } from "wagmi";
import tokenAbi from "@/abi/erc20.json";
import { Loader2 } from "lucide-react";
import useGlobalStore from "@/store";

export function TradeForm() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [buyAmount, setBuyAmount] = useState<string | null>(null);
  const [sellAmount, setSellAmount] = useState<string | null>(null);
  const [tokenBuying, setTokenBuying] = useState(false);
  const [tokenSelling, setTokenSelling] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount(); // Get the connected user's address
  const { setRefresh } = useGlobalStore();

  const { data: balance } = useBalance({
    address,
  });

  const { writeContractAsync: buyFunction } = useWriteContract();
  const { writeContractAsync: sellFunction } = useWriteContract();
  const { writeContractAsync: approveFunction } = useWriteContract();
  // Fetch token balance for the specified address
  const { data: tokenBalance }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // Token contract ABI
      address: tokenAddress as `0x${string}`, // Token contract address
      functionName: "balanceOf", // Function to get balance
      args: [address], // Address to check balance for
    });
  // Fetch token name for the specified address
  const { data: tokenName } = useReadContract({
    abi: tokenAbi, // Token contract ABI typed as Abi
    address: tokenAddress as `0x${string}`, // Token contract address
    functionName: "name", // Function to get the token name
  });

  //Fetch token symbol
  const { data: tokenSymbol } = useReadContract({
    abi: tokenAbi, // Token contract ABI typed as Abi
    address: tokenAddress as `0x${string}`, // Token contract address
    functionName: "symbol", // Function to get the token symbol
  });

  // Fetch BNB cost for the given token amount when buying
  const { data: bnbCost }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: config.abi, // Contract ABI
      address: config.address as `0x${string}`, // Contract address
      functionName: "getBNBAmount", // Function to get BNB cost
      args: [tokenAddress, buyAmount ? parseEther(buyAmount) : 0], // Token address and buy amount in wei
    });

  // Fetch BNB cost for the given token amount when selling
  const { data: bnbSellCost }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: config.abi, // Contract ABI
      address: config.address as `0x${string}`, // Contract address
      functionName: "getBNBAmount", // Function to get BNB cost
      args: [tokenAddress, sellAmount ? parseEther(sellAmount) : 0], // Token address and sell amount in wei
    });

  const buy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form submission
    setTokenBuying(true); // Set loading state to true
    if (!bnbCost) return; // Exit if no cost is available
    try {
      // Call the buy function with necessary parameters
      await buyFunction({
        abi: config.abi, // Contract ABI
        address: config.address as `0x${string}`, // Contract address
        functionName: "buy", // Function to call on contract
        args: [tokenAddress, buyAmount ? parseEther(buyAmount) : 0], // Arguments: token address and amount in wei
        value: BigInt(bnbCost[0]?.toString() || "0"), // Payment value in BNB
      });

      // Show success toast
      toast({
        description: "Token purchase completed successfully!",
      });

      setTokenBuying(false); // Set loading state to false
    } catch (error) {
      // Show error toast if purchase fails
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Token purchase failed.",
      });
    } finally {
      setRefresh(true);
      setTokenBuying(false); // Ensure loading state is reset
      setBuyAmount(""); // Clear input field
    }
  };

  const sell = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent form submission
    e.preventDefault();
    setTokenSelling(true);
    try {
      // Approve token for factory contract
      await sellFunction({
        abi: tokenAbi,
        address: tokenAddress as `0x${string}`,
        functionName: "approve",
        args: [config.address, sellAmount ? parseEther(sellAmount) : 0],
      });

      // Execute the sale transaction
      await sellFunction({
        abi: config.abi,
        address: config.address as `0x${string}`,
        functionName: "sell",
        args: [tokenAddress, sellAmount ? parseEther(sellAmount) : 0],
      });

      // Show success toast
      toast({
        description: "Token sale completed successfully!",
      });
      setTokenSelling(false);
    } catch (error) {
      // Show error toast if transaction fails
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Token sale failed.",
      });
    } finally {
      setRefresh(true);
      // Reset selling state and amount
      setTokenSelling(false);
      setSellAmount("");
    }
  };

  const formatDisplayAmount = (amt: number): string | number => {
    return amt == 0 ? 0 : amt < 0.00001 ? "less than 0.00001" : amt.toFixed(4);
  };

  return (
    <Tabs
      defaultValue="buy"
      className="w-full h-full flex flex-col justify-start"
    >
      <TabsList className="grid w-full grid-cols-2 h-[10%]">
        <TabsTrigger value="buy" className="h-full">
          Buy
        </TabsTrigger>
        <TabsTrigger value="sell" className="h-full">
          Sell
        </TabsTrigger>
      </TabsList>
      <TabsContent value="buy" className="h-[90%] ">
        <Card className="h-full">
          <CardHeader className="h-[30%]">
            <CardTitle>Buy</CardTitle>
            <CardDescription>
              Trade BNB token for {tokenName as string}
            </CardDescription>
            <div className="flex justify-end">
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="h-7 flex items-center">
                    set max slippage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Slippage settings</DialogTitle>
                    <DialogDescription>
                      Make changes for the trade you are about to make
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        max. slippage (%)
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        priority fee
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> */}
            </div>
          </CardHeader>
          <form onSubmit={buy}>
            <CardContent className="space-y-2 px-5 h-[50%]">
              <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
                <p> Balance: </p>
                <p> {balance && balance.formatted} BNB </p>
              </div>
              <div className="space-y-1 h-[50%] bg-gray-500 rounded-xl">
                <Label
                  htmlFor="amount"
                  className=" h-[30%] text-gray-800 flex items-center p-3"
                >
                  Amount of {tokenSymbol as string}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  value={buyAmount || ""}
                  placeholder="0"
                  className="h-[70%] text-3xl "
                />
              </div>

              <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
                <p> Amount (BNB): </p>
                <p>
                  {" "}
                  {bnbCost &&
                    formatEther(bnbCost[0]) &&
                    formatDisplayAmount(Number(formatEther(bnbCost[0])))}
                </p>
              </div>
            </CardContent>
            <CardFooter className="h-[20%]">
              <Button disabled={tokenBuying} className="w-full">
                {tokenBuying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> // Spinner icon with animation
                ) : (
                  "Buy" // Button label when not loading
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="sell" className="h-[90%] ">
        <Card className="h-full ">
          <CardHeader className="h-[30%] ">
            <CardTitle>Sell</CardTitle>
            <CardDescription>
              Trade {tokenName as string} token for BNB
            </CardDescription>
            <div className="flex justify-end">
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="h-7 flex items-center">
                    set max slippage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Slippage settings</DialogTitle>
                    <DialogDescription>
                      Make changes for the trade you are about to make
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        max. slippage (%)
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        priority fee
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> */}
            </div>
          </CardHeader>
          <form onSubmit={sell}>
            <CardContent className="space-y-2 px-5 h-[50%]">
              <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
                <p> Balance: </p>
                <p>
                  {tokenBalance ? formatEther(tokenBalance) : "0.0"}{" "}
                  {tokenSymbol as string}
                </p>
              </div>
              <div className="space-y-1 h-[60%] bg-gray-500 rounded-xl">
                <Label
                  htmlFor="amount"
                  className=" h-[30%] text-gray-800 flex items-center p-3"
                >
                  Amount of {tokenSymbol as string}
                </Label>
                <Input
                  id="amount"
                  placeholder="0"
                  type="number"
                  min={0}
                  onChange={(e) => setSellAmount(e.target.value)}
                  value={sellAmount || ""}
                  className="h-[70%] text-3xl "
                />
              </div>

              <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
                <p> Matching BNB: </p>
                <p>
                  {" "}
                  {bnbSellCost &&
                    formatEther(bnbSellCost[0]) &&
                    formatDisplayAmount(Number(formatEther(bnbSellCost[0])))}
                </p>
              </div>
            </CardContent>
            <CardFooter className="h-[20%]">
              <Button
                disabled={tokenSelling}
                variant={"destructive"}
                className="w-full"
              >
                {tokenSelling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> // Spinner icon with animation
                ) : (
                  "Sell" // Button label when not loading
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
