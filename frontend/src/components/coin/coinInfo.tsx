import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Progress } from "../ui/progress";
import { BigNumberish, formatEther, parseEther } from "ethers";
import config from "@/config.json";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useParams } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";

interface Props {
  supply: bigint;
  description: string;
  image: string;
}

const CoinInfo: React.FC<Props> = ({ supply, description, image }) => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [percCompleted, setPercCompleted] = useState<number>(0);

  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi,
      address: tokenAddress as `0x${string}`,
      functionName: "totalSupply",
    });

  useEffect(() => {
    if (!totalSupply) return;
    const initialSupply = 200000000;
    const currentSupply = Number(formatEther(totalSupply));
    const perc = ((currentSupply - initialSupply) / currentSupply) * 100;

    setPercCompleted(perc);
  }, [totalSupply]);
  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="col-span-1 h-auto max-h-[400px] place-items-center ">
          <img
            src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY + image}
            className="w-auto h-full"
          />
        </div>
        <div className=" lg:col-span-2 h-auto  pb-10 ">
          <p>{description}</p>
        </div>
      </div>
      {/* bonding curve progress */}
      <div className=" text-gray-400 text-sm">
        <div className="flex justify-between items-center">
          <p>Bonding curve progress: {percCompleted.toFixed(1)}%</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IoIosInformationCircleOutline size={20} />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] mr-3 bg-secondary">
                <p className="text-gray-400">
                  when the market cap reaches $21000 (~30 bnb), all the
                  liquidity in the bonding curve will be deposited to
                  pancakeswap and burned. progression increases as more tokens
                  are bought. The bonding curve still has{" "}
                  {(
                    1_000_000_000n -
                    BigInt(parseFloat(formatEther(supply.toString())))
                  ).toString()}{" "}
                  tokens available for sale.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Progress className="h-5 my-2 " value={percCompleted} />
        <p>
          graduate this coin to pancakeswap at $21000 market cap there is 30 BNB
          in the bonding curve
        </p>
      </div>
      {/* king og the hill progress */}
      <div className="pt-6 text-gray-400 text-sm">
        <div className="flex justify-between items-center">
          <p>king of the hill progress: 100%</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IoIosInformationCircleOutline size={20} />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] mr-3 bg-secondary">
                <p className="text-gray-400">
                  when the market cap reaches $46,094, this coin will be pinned
                  to the top of the feed (until dethroned)!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Progress
          className="h-5 my-2 "
          parentBg="bg-yellow-500/50 "
          childBg="bg-yellow-500 "
          value={33}
        />
        <p>crowned king of the hill on 12/3/2024, 11:38:09 AM</p>
      </div>

      {/* holdre distribution */}
      <div className="h-auto max-h-[100vh] overflow-y-auto text-gray-400">
        <h3 className="flex items-center h-12 justify-between font-semibold">
          Holder distribution
        </h3>

        <table className="min-w-full table-auto border-collapse">
          <tbody>
            {Array.from({ length: 10 }).map((item, index) => (
              <tr key={index} className="">
                <td className="  py-2">{index + 1}</td> {/* Serial Number */}
                <td className=" py-2 ">0x000</td> {/* Column 1 Data */}
                <td className="px-4 py-2 text-right">10%</td>{" "}
                {/* Column 2 Data */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CoinInfo;
