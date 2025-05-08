"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Albert_Sans } from "next/font/google";
import { useAccount } from "wagmi";
import { getUsers } from "@/lib/lens";
import { ConnectButton } from "./ConnectButton";
const albertsans = Albert_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});
export default function Header() {
  const { address } = useAccount();
  console.log(getUsers(address!));
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
            <Button variant={"ghost"}>Explore</Button>
          </Link>
          <Link href={"/launch"}>
            <Button variant={"ghost"}>Launch Meme</Button>
          </Link>
          <Link href={"/leaderboard"}>
            <Button variant={"ghost"}>Leaderboard</Button>
          </Link>
          <Link href={"/faq"}>
            <Button variant={"ghost"}>FAQ</Button>
          </Link>
        </nav>
        <div className="cta-button flex items-center gap-3 absolute h-full ">
          <ConnectButton />
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden justify-between my-2 px-2 relative flex">
        <nav className="cursor-pointer  flex justify-center items-center bg-[#DCDCDC] p-1 rounded-md">
          <Link href={"/"}>
            <div className="logo p-2 bg-[#28D358] text-white font-bold rounded-md">
              MF
            </div>
          </Link>
        </nav>
        <div className="cta-button flex items-center gap-1 h-full ">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
