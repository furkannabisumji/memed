import React, { useEffect, useState } from "react";
import { useReadContract, usePublicClient, useWatchContractEvent } from "wagmi";
import { useParams } from "react-router-dom";
import { BattleChart } from "./BattleChart";
import { GrTransaction } from "react-icons/gr";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import {
  MdFingerprint,
  MdOutlinePriceChange,
  MdOutlineSavings,
} from "react-icons/md";
import { AiOutlineLineChart } from "react-icons/ai";
import memedBattle from "@/abi/memedBattle.json";
import config from "@/config.json";
import { BigNumberish, formatEther } from "ethers";
import tokenAbi from "@/abi/erc20.json";
import eventsAbi from "@/abi/events.json";
import { AbiEvent } from "viem";
import { decodeEventLog } from "viem";
import { watchContractEvent } from "viem/actions";
import { config as wagmiConfig } from "@/wagmi";
import useGlobalStore from "@/store";

interface Props {
  supply: bigint;
  description: string;
  image: string;
}
interface Holder {
  address: string;
  balance: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

type BattleStatsArray = [
  bigint, // totalBattlesInitiated
  bigint, // totalBattlesParticipated
  bigint, // totalWins
  bigint, // totalVotes
  bigint, // lastBattleTime
  bigint, // lastWinTime
  boolean, // isKing
  bigint, // kingCrownedTime
];

type TokenData = [
  string, //name
  string, // ticker
  string, // description
  string, // image
  string, // owner (Ethereum address)
  number, // stage (uint8)
  bigint, // collateral (uint256)
  bigint, // createdAt (uint256)
];

interface DecodedLog {
  args: {
    amount: BigNumberish;
    buyer: string;
    token: string;
    totalPrice: BigNumberish;
    timestamp: number;
  };
}

const TokenStats: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [sells, setSells] = useState<number>(0);
  const [buys, setBuys] = useState<number>(0);
  const publicClient = usePublicClient();
  const { refresh, setRefresh } = useGlobalStore();

  const { data }: { data: BattleStatsArray | undefined } = useReadContract({
    abi: memedBattle.abi,
    address: memedBattle.address as `0x${string}`,
    functionName: "tokenStats",
    args: [tokenAddress],
  });

  const { data: tokenData }: { data: TokenData | undefined } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "tokenData",
    args: [tokenAddress],
  });

  // Using the useReadContract hook to get the total supply of a token
  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // The ABI of the token contract
      address: tokenAddress as `0x${string}`, // The token's contract address
      functionName: "totalSupply", // The function to get the total supply of the token
    });

  // Using the useReadContract hook to get the BNB cost based on token supply and price feed data
  const { data: bnbCost }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: config.abi, // The ABI of the contract that handles BNB cost calculations
      address: config.address as `0x${string}`, // The contract address of the BNB cost calculation contract
      functionName: "getBNBAmount", // Function to get the BNB cost based on the total supply of the token
      args: [tokenAddress, totalSupply], // Arguments: token address and its total supply
    });

  //watch buy event
  useWatchContractEvent({
    address: config.address as `0x${string}`,
    abi: config.abi,
    eventName: "TokensBought",
    onLogs(logs) {
      console.log("New logs!", logs);
      const totalPrice =
        logs?.reduce(
          //@ts-ignore
          (accumulator: number, currentItem: DecodedLog) => {
            const priceInEth = parseFloat(
              formatEther(currentItem.args.totalPrice),
            );
            return accumulator + priceInEth;
          },
          0,
        ) || 0;

      //@ts-ignore
      setBuys(totalPrice + buys);
    },
  });

  //watch sell event
  useWatchContractEvent({
    address: config.address as `0x${string}`,
    abi: config.abi,
    eventName: "TokensSold",
    onLogs(logs) {
      console.log("New logs!", logs);
      const totalPrice =
        logs?.reduce(
          //@ts-ignore
          (accumulator: number, currentItem: DecodedLog) => {
            const priceInEth = parseFloat(
              formatEther(currentItem.args.totalPrice),
            );
            return accumulator + priceInEth;
          },
          0,
        ) || 0;

      //@ts-ignore
      setSells(totalPrice + sells);
    },
  });

  //fetch buy logs
  const deploymentBlock = 46680516n; // Deployment block number

  const fetchBuyLogs = async () => {
    try {
      const batchSize = 50000n; // Define the maximum block range
      const latestBlock = await publicClient?.getBlockNumber(); // Fetch the latest block number
      const logs: any[] = [];

      for (
        let startBlock = deploymentBlock;
        //@ts-ignore
        startBlock <= latestBlock;
        startBlock += batchSize
      ) {
        const endBlock =
          //@ts-ignore
          startBlock + batchSize - 1n > latestBlock
            ? latestBlock
            : startBlock + batchSize - 1n;

        // Fetch logs in batches
        const batchLogs = await publicClient?.getLogs({
          address: config.address as `0x${string}`,
          event: eventsAbi.tokensBought as AbiEvent,
          fromBlock: startBlock,
          toBlock: endBlock,
          args: {
            token: tokenAddress,
          },
        });
        //@ts-ignore
        logs.push(...batchLogs); // Add batch logs to the result
      }

      // Decode logs
      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: [eventsAbi.tokensBought],
          data: log.data,
          topics: log.topics,
        }),
      );

      // Calculate the total price
      const totalPrice =
        decodedLogs.reduce(
          //@ts-ignore
          (accumulator: number, currentItem: DecodedLog) => {
            const priceInEth = parseFloat(
              formatEther(currentItem.args.totalPrice),
            );
            return accumulator + priceInEth;
          },
          0,
        ) || 0;
      //@ts-ignore
      setBuys(totalPrice as number); // Update the state with the total price
    } catch (error) {
      console.error("Error fetching buy logs:", error);
    }
  };

  //fetch sell logs
  const fetchSellLogs = async () => {
    try {
      const batchSize = 50000n; // Define the maximum block range
      const latestBlock = await publicClient?.getBlockNumber(); // Fetch the latest block number
      const logs: any[] = [];

      for (
        let startBlock = deploymentBlock;
        //@ts-ignore
        startBlock <= latestBlock;
        startBlock += batchSize
      ) {
        const endBlock =
          //@ts-ignore
          startBlock + batchSize - 1n > latestBlock
            ? latestBlock
            : startBlock + batchSize - 1n;

        // Fetch logs in batches
        const batchLogs = await publicClient?.getLogs({
          address: config.address as `0x${string}`,
          event: eventsAbi.tokensSold as AbiEvent,
          fromBlock: startBlock,
          toBlock: endBlock,
          args: {
            token: tokenAddress,
          },
        });
        //@ts-ignore
        logs.push(...batchLogs); // Add batch logs to the result
      }

      // Decode logs
      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: [eventsAbi.tokensSold],
          data: log.data,
          topics: log.topics,
        }),
      );

      // Calculate the total price
      const totalPrice =
        decodedLogs.reduce(
          //@ts-ignore
          (accumulator: number, currentItem: DecodedLog) => {
            const priceInEth = parseFloat(
              formatEther(currentItem.args.totalPrice),
            );
            return accumulator + priceInEth;
          },
          0,
        ) || 0;
      //@ts-ignore
      setSells(totalPrice as number); // Update the state with the total price
    } catch (error) {
      console.error("Error fetching sell logs:", error);
    }
  };
  useEffect(() => {
    const fetchLogs = async () => {
      await fetchBuyLogs();
      await fetchSellLogs();
    };

    fetchLogs(); // Initial fetch

    if (refresh) {
      fetchLogs().then(() => setRefresh(false)); // Fetch again if `refresh` is true
    }
  }, [publicClient, refresh]);

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-2 px-3 gap-4 shadow">
      <div className="h-full flex w-full flex-col lg:justify-center ">
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <GrTransaction size={25} className="text-gray-500" />
            <p>Total volume</p>
          </div>
          <div className="font-semibold">
            {Number(sells + buys).toFixed(4)}
            <img
              src="https://cryptologos.cc/logos/bnb-bnb-logo.png"
              alt="BNB"
              className="inline-block w-4 h-4 ml-1"
            />
          </div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <GiReceiveMoney size={25} className="text-gray-500" />
            <p> Sells</p>
          </div>
          <div className="font-semibold">
            {Number(sells).toFixed(4)}
            <img
              src="https://cryptologos.cc/logos/bnb-bnb-logo.png"
              alt="BNB"
              className="inline-block w-4 h-4 ml-1"
            />
          </div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <GiPayMoney size={25} className="text-gray-500" />
            <p> Buys</p>
          </div>
          <div className="font-semibold">
            {Number(buys).toFixed(4)}
            <img
              src="https://cryptologos.cc/logos/bnb-bnb-logo.png"
              alt="BNB"
              className="inline-block w-4 h-4 ml-1"
            />
          </div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <MdOutlineSavings size={25} className="text-gray-500" />
            <p> Collateral</p>
          </div>
          <div className="font-semibold">
            {tokenData ? Number(formatEther(tokenData[6])).toFixed(4) : 0}
            <img
              src="https://cryptologos.cc/logos/bnb-bnb-logo.png"
              alt="BNB"
              className="inline-block w-4 h-4 ml-1"
            />
          </div>
        </div>

        {/* <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <MdOutlinePriceChange size={25} className="text-gray-500" />
            <p> Price (BNB)</p>
          </div>
          <div className="font-semibold">
            {bnbCost ? formatEther(bnbCost[0]) : 0}
          </div>
        </div> */}
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <AiOutlineLineChart size={25} className="text-gray-500" />
            <p> Battles</p>
          </div>
          <div className="font-semibold">{data ? Number(data[1]) : 0}</div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <MdFingerprint size={25} className="text-gray-500" />
            <p> Votes</p>
          </div>
          <div className="font-semibold">
            {data ? (Number(data[4]) / 10 ** 9).toFixed(2) : 0}
          </div>
        </div>
      </div>

      <div className="h-full hidden lg:block">
        <BattleChart data={data} tokenData={tokenData} />
      </div>
    </div>
  );
};

export default TokenStats;
