import { Meme } from "@/app/types";
import { Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function MemeCard({ meme }: { meme: Meme }) {
  return (
    <Link href={`/meme/${meme.tokenAddress}`}>
      <div className="relative overflow-hidden rounded-md transition-all duration-300 bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]">
        <div className="relative aspect-square">
          <Image
            src={meme.image || "/fallback.png"}
            alt={meme.name || "meme token"}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="p-4 bg-white border-t-2 border-black">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-black">{meme.name}</h3>
              <p className="text-sm text-gray-600">@{meme.creator}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 text-white bg-primary rounded-full">
              <Zap size={14} />
              <span className="font-bold">${meme.ticker}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-primary">${0.0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 text-right">Likes</p>
              <p className="text-xl font-bold text-right">{10}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
