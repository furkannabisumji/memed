"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Albert_Sans } from "next/font/google";
import { useAccount } from "wagmi";
import { getAvailableAccounts } from "@/lib/lens";
import { AccountButton } from "./AccountButton";
import {
  Home,
  Search,
  Gift,
  Rocket,
  BarChart2,
  HelpCircle,
} from "lucide-react";

const albertsans = Albert_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export default function Header() {
  const { address, isConnected } = useAccount();

  // Only fetch accounts if address is available
  React.useEffect(() => {
    const fetchAccounts = async () => {
      if (address && isConnected) {
        try {
          await getAvailableAccounts(address);
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      }
    };

    fetchAccounts();
  }, [address, isConnected]);

  return (
    <header className={`${albertsans.className} `}>
      {/* Desktop Nav */}
      <div className="md:flex justify-end my-2 px-2 relative hidden">
        <nav className="cursor-pointer mx-auto flex justify-center items-center bg-[#DCDCDC] p-1 rounded-md">
          <Link href={"/"}>
            <div className="logo p-2 bg-[#28D358] text-white font-bold rounded-md">
              MF
            </div>
          </Link>
          <Link href={"/explore"}>
            <Button variant={"ghost"} className="cursor-pointer">
              Explore
            </Button>
          </Link>
          <Link href={"/rewards"}>
            <Button variant={"ghost"} className="cursor-pointer">
              Rewards
            </Button>
          </Link>
          <Link href={"/launch"}>
            <Button variant={"ghost"} className="cursor-pointer">
              Launch Meme
            </Button>
          </Link>
          <Link href={"/leaderboard"}>
            <Button variant={"ghost"} className="cursor-pointer">
              Leaderboard
            </Button>
          </Link>
        </nav>
        <div className="cta-button flex items-center gap-3 absolute h-full ">
          <AccountButton />
        </div>
      </div>

      {/* Mobile Nav - Simple Top Bar */}
      <div className="md:hidden justify-between my-2 px-2 relative flex">
        <nav className="cursor-pointer flex justify-center items-center bg-[#DCDCDC] p-1 rounded-md">
          <Link href={"/"}>
            <div className="logo p-2 bg-[#28D358] text-white font-bold rounded-md">
              MF
            </div>
          </Link>
        </nav>

        <div className="flex items-center gap-2 h-full">
          <AccountButton />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <Link href={"/"}>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
              <Home size={24} className="text-gray-600" />
              <span className="text-xs mt-1">Home</span>
            </div>
          </Link>
          <Link href={"/explore"}>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
              <Search size={24} className="text-gray-600" />
              <span className="text-xs mt-1">Explore</span>
            </div>
          </Link>
          <Link href={"/rewards"}>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
              <Gift size={24} className="text-gray-600" />
              <span className="text-xs mt-1">Rewards</span>
            </div>
          </Link>
          <Link href={"/launch"}>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
              <Rocket size={24} className="text-gray-600" />
              <span className="text-xs mt-1">Launch</span>
            </div>
          </Link>
          <Link href={"/leaderboard"}>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
              <BarChart2 size={24} className="text-gray-600" />
              <span className="text-xs mt-1">Leaderboard</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Add bottom padding to main content to account for fixed nav */}
      <style jsx global>{`
        body {
          padding-bottom: 4rem;
        }
      `}</style>
    </header>
  );
}
