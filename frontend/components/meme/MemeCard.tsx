import { Meme } from "@/app/types";
import { formatNumber } from "@/lib/helpers";
import { Flame, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { useTokenData } from "@/hooks/useTokenData";
import { UserImage } from "../shared/UserImage";

export default function MemeCard({ meme }: { meme: Meme }) {
  const { data: tokenData } = useTokenData(meme.handle);
  // console.log(meme);
  return (
    <Link href={`/meme/${meme.tokenAddress}`}>
      <div className="relative overflow-hidden rounded-md transition-all duration-300 bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]">
        <div className="relative">
          <div className="h-96">
            <Image
              src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${meme.image}`}
              alt={meme.name || "meme token"}
              fill
              className="object-cover transition-transform hover:scale-105 duration-500"
            />
          </div>
        </div>
        <div className="p-4 bg-white ">
          <h2 className="font-bold text-lg mb-2 line-clamp-1">{meme.name}</h2>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <UserImage username={meme.handle} />
              <div>
                <p className="text-xs text-gray-500">
                  <span className="text-primary font-medium">By</span> @
                  {meme.handle}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
              <Zap size={14} className="mr-1 text-primary" />
              <span className="font-bold text-sm">${meme.ticker}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
              <Flame size={16} className="mr-1 text-orange-500" />
              <span className="font-bold text-sm">
                {formatNumber(Number(tokenData?.heat || 0))}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs cursor-pointer"
            >
              View Details →
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
