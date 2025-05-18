"use client";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Albert_Sans } from "next/font/google";
import { useAccount } from "wagmi";
import { getAvailableAccounts } from "@/lib/lens";
import { AccountButton } from "./AccountButton";
import { Home, Search, Gift, Rocket, BarChart2, Menu, X } from "lucide-react";
import Image from "next/image";

const albertsans = Albert_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const pathname = usePathname();

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return pathname === path || (path !== '/' && pathname.startsWith(path));
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Add when the menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
    <header className={`${albertsans.className}`}>
      {/* Desktop Nav */}
      <div className="md:flex justify-end my-2 px-2 relative hidden">
        <nav className="cursor-pointer mx-auto flex justify-center gap-2 items-center bg-[#DCDCDC] p-1 rounded-md">
          <Link href={"/"}>
            <div className="relative logo w-[40px] h-[40px] bg-[#28D358] text-white font-bold rounded-md">
              <Image alt={"memed"} src={'/icon/android-chrome-512x512.png'} fill />
            </div>
          </Link>
          <Link href={"/explore"}>
            <Button
              variant={"ghost"}
              className={`cursor-pointer ${isActive('/explore') ? 'bg-white/50' : ''} hover:bg-white/30`}
            >
              Explore
            </Button>
          </Link>
          <Link href={"/rewards"}>
            <Button
              variant={"ghost"}
              className={`cursor-pointer ${isActive('/rewards') ? 'bg-white/50' : ''} hover:bg-white/30`}
            >
              Rewards
            </Button>
          </Link>
          <Link href={"/launch"}>
            <Button
              variant={"ghost"}
              className={`cursor-pointer ${isActive('/launch') ? 'bg-white/50' : ''} hover:bg-white/30`}
            >
              Launch Meme
            </Button>
          </Link>
          <Link href={"/leaderboard"}>
            <Button
              variant={"ghost"}
              className={`cursor-pointer ${isActive('/leaderboard') ? 'bg-white/50' : ''} hover:bg-white/30`}
            >
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
        <nav className="cursor-pointer flex justify-center items-center  p-1 rounded-md">
          <Link href={"/"}>
            <div className={`w-[40px] h-[40px] ${isActive('/') ? 'bg-[#1ea54c]' : 'bg-[#28D358]'} relative text-white font-bold rounded-md`}>
              <Image alt={"memed"} src={'/icon/android-chrome-512x512.png'} fill />
            </div>
          </Link>
        </nav>

        <div className="flex items-center gap-2 h-full">
          <AccountButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      {usePathname() === "/" ? (
        // Burger menu for home page
        <div className="md:hidden fixed bottom-4 right-4 z-50" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-[#28D358] text-white p-3 rounded-full shadow-lg"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="fixed  bottom-16 right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
              <Link
                href="/explore"
                className={`px-4 py-3 rounded-md flex items-center gap-2 ${pathname === '/explore' ? 'bg-green-50 text-[#28D358]' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Search size={24} className={pathname === '/explore' ? 'text-[#28D358]' : 'text-gray-600'} />
                Explore
              </Link>
              <Link
                href="/rewards"
                className={`px-4 py-3 rounded-md flex items-center gap-2 ${pathname === '/rewards' ? 'bg-green-50 text-[#28D358]' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Gift size={24} className={pathname === '/rewards' ? 'text-[#28D358]' : 'text-gray-600'} />
                Rewards
              </Link>
              <Link
                href="/launch"
                className={`px-4 py-3 rounded-md flex items-center gap-2 ${pathname === '/launch' ? 'bg-green-50 text-[#28D358]' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Rocket size={24} className={pathname === '/launch' ? 'text-[#28D358]' : 'text-gray-600'} />
                Launch Meme
              </Link>
              <Link
                href="/leaderboard"
                className={`px-4 py-3 rounded-md flex items-center gap-2 ${pathname === '/leaderboard' ? 'bg-green-50 text-[#28D358]' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <BarChart2 size={24} className={pathname === '/leaderboard' ? 'text-[#28D358]' : 'text-gray-600'} />
                Leaderboard
              </Link>
            </div>
          )}
        </div>
      ) : (
        // Bottom navigation bar for other pages
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="flex justify-around items-center h-16">
            <Link href={"/"}>
              <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
                <Home size={24} className={pathname === '/' ? 'text-[#28D358]' : 'text-gray-600'} />
                <span className={`text-xs mt-1 ${pathname === '/' ? 'text-[#28D358] font-medium' : 'text-gray-600'}`}>Home</span>
              </div>
            </Link>
            <Link href={"/explore"}>
              <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
                <Search size={24} className={pathname === '/explore' ? 'text-[#28D358]' : 'text-gray-600'} />
                <span className={`text-xs mt-1 ${pathname === '/explore' ? 'text-[#28D358] font-medium' : 'text-gray-600'}`}>Explore</span>
              </div>
            </Link>
            <Link href={"/rewards"}>
              <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
                <Gift size={24} className={pathname === '/rewards' ? 'text-[#28D358]' : 'text-gray-600'} />
                <span className={`text-xs mt-1 ${pathname === '/rewards' ? 'text-[#28D358] font-medium' : 'text-gray-600'}`}>Rewards</span>
              </div>
            </Link>
            <Link href={"/launch"}>
              <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
                <Rocket size={24} className={pathname === '/launch' ? 'text-[#28D358]' : 'text-gray-600'} />
                <span className={`text-xs mt-1 ${pathname === '/launch' ? 'text-[#28D358] font-medium' : 'text-gray-600'}`}>Launch</span>
              </div>
            </Link>
            <Link href={"/leaderboard"}>
              <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
                <BarChart2 size={24} className={pathname === '/leaderboard' ? 'text-[#28D358]' : 'text-gray-600'} />
                <span className={`text-xs mt-1 ${pathname === '/leaderboard' ? 'text-[#28D358] font-medium' : 'text-gray-600'}`}>Leaderboard</span>
              </div>
            </Link>
          </div>
        </div>
      )}


    </header>
  );
}
