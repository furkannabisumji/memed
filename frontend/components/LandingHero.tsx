"use client";
import React, { useMemo } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAccountStore } from "@/store/accountStore";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function LandingHero() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { selectedAccount, accounts } = useAccountStore();

  // Memoize if the user has any accounts
  const hasAccounts = useMemo(() => {
    return accounts && accounts.length > 0;
  }, [accounts]);

  return (
    <div className="relative min-h-[90vh] flex flex-col gap-10 justify-center items-center">
      <Image
        alt={"reward-coin"}
        src={"/coin.png"}
        width={250}
        height={100}
        className="absolute left-0 md:-top-10 top-0 coin-floating"
      />
      <Image
        alt={"reward-coin"}
        src={"/coin.png"}
        width={250}
        height={100}
        className="absolute right-0 bottom-0 coin-floating-2"
      />
      <div className="font-clash md:text-8xl text-3xl font-bold text-center md:max-w-11/12">
        <h2>Turn Your Memes Into Tokens</h2>
        <h2>Get Paid for LOLs</h2>
      </div>
      <p className="text-center">
        Launch a meme profile on Lens. Mint tokens. Earn through engagement.
      </p>
      <div className="cta-button flex items-center gap-3 h-full font-clash">
        {isConnected && (
          <Button
            onClick={(e) => {
              if (hasAccounts && selectedAccount) {
                router.push("/launch");
              } else {
                router.push("/accounts");
              }
            }}
            className="py-3 hover:shadow-2xl h-full md:px-8 font-bold cursor-pointer"
          >
            Launch your meme
          </Button>
        )}
        <Link href={"#process"}>
          <Button
            className="py-3 hover:shadow-2xl h-full md:px-8 border border-black font-bold cursor-pointer"
            variant={"outline"}
          >
            Learn How it works
          </Button>
        </Link>
      </div>
    </div>
  );
}
