"use client";
import React, { useMemo } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAccountStore } from "@/store/accountStore";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "motion/react";
export default function LandingHero() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { selectedAccount, accounts } = useAccountStore();

  // Memoize if the user has any accounts
  const hasAccounts = useMemo(() => {
    return accounts && accounts.length > 0;
  }, [accounts]);

  return (
    <motion.div
      className="relative min-h-[90vh] flex flex-col gap-10 justify-center items-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Floating Coins */}
      <motion.div
        className="absolute left-0 md:-top-0 top-0 coin-floating"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <Image alt="reward-coin" src="/coin2.png" width={250} height={100} />
      </motion.div>

      <motion.div
        className="absolute md:right-10 right-0 bottom-0 coin-floating-2"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <Image alt="reward-coin" src="/coin2.png" width={250} height={100} />
      </motion.div>

      {/* Hero Text */}
      <motion.div
        className="font-clash md:text-8xl text-3xl font-bold text-center md:max-w-11/12"
        initial={{ opacity: 0, y: -20, zIndex: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2>Turn Your Memes Into Tokens</h2>
        <h2>Get Paid for LOLs</h2>
      </motion.div>

      <motion.p
        className="text-center text-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Launch a meme profile on Lens. Mint tokens. Earn through engagement.
      </motion.p>

      {/* Call-to-Action Buttons */}
      <motion.div
        className="cta-button flex items-center gap-3 h-full font-clash"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {isConnected && (
          <Button
            onClick={() => {
              if (hasAccounts && selectedAccount) {
                router.push("/launch");
              } else {
                router.push("/accounts");
              }
            }}
            className="py-3 md:px-8 font-bold cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
          >
            Launch your meme
          </Button>
        )}

        <Link href={"/process"}>
          <Button
            variant="outline"
            className="py-3 md:px-8 border border-black font-bold cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
          >
            Learn How it works
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
