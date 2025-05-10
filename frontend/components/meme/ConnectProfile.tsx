import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAccountStore } from "@/store/accountStore";
import Link from "next/link";

export default function ConnectProfile({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  return (
    <div className="p-8 border-2 border-black">
      <h1 className="mb-6 text-4xl font-black text-black">
        Connect Your Lens Profile
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        To create a meme token, you&apos;ll need to connect your Lens profile.
        This will allow you to mint tokens and earn from engagement.
      </p>

      <div className="flex items-center p-6 mb-8 bg-accent border-2 border-black">
        <div>
          <h3 className="mb-1 text-xl font-bold">Lens Protocol</h3>
          <p className="text-gray-600">
            The social layer for Web3. Connect once, use everywhere.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between sm:flex-row">
        <Link href="/accounts">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 hover:shadow-2xl cursor-pointer shadow-none border-2 border-black text-black"
          >
            Create Lens Profile
          </Button>
        </Link>

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
      </div>
    </div>
  );
}
