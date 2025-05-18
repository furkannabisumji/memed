import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

import Link from "next/link";
import { Account, TokenData } from "@/app/types";
import { useTokenData } from "@/hooks/useTokenData";

export default function ConnectProfile({
  setStep,
  selectedAccount,
}: {
  setStep: (step: number) => void;
  selectedAccount: Account | null;
}) {
  const {
    data: tokenData,
    isPending: isLoadingTokenData,
  }: { data: TokenData | null; isPending: boolean } = useTokenData(
    selectedAccount?.username.localName || ""
  );
  // console.log(selectedAccount?.username.localName);
  // console.log(tokenData);

  if (isLoadingTokenData) {
    return (
      <div className="p-8 border-2 border-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 border-2 border-black">
      <h1 className="mb-6 text-4xl font-black text-black">
        Connect Your Lens Profile
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        To create a meme token, you&apos;ll need to connect your Lens profile.
        This will allow you to mint tokens and earn from engagement.{" "}
        <strong>NOTE:</strong> each lens profile can only have one meme token.
      </p>

      <div className="flex items-center p-6 mb-8 bg-accent border-2 border-black">
        <div>
          <h3 className="mb-1 text-xl font-bold">Lens Protocol</h3>
          <p className="text-gray-600">
            The social layer for Web3. Connect once, use everywhere.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center md:justify-between gap-4 md:flex-row">
        <Link href="/accounts">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 hover:shadow-2xl cursor-pointer shadow-none border-2 border-black text-black"
          >
            Create Lens Profile
          </Button>
        </Link>

        {!tokenData && (
          <Button
            size="lg"
            className="gap-2 bg-primary hover:shadow-2xl  cursor-pointer hover:bg-primary/90"
            onClick={() => setStep(2)}
          >
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          </Button>
        )}
        {tokenData && (
          <p className="text-lg text-gray-600">You already have a meme token</p>
        )}
      </div>
    </div>
  );
}
