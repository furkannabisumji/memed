"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Sparkles, LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ConnectProfile from "@/components/meme/ConnectProfile";
import CreateMemeForm from "@/components/meme/CreateMemeForm";
import TokenSettingForm from "@/components/meme/TokenSettingForm";
import { useAccountStore } from "@/store/accountStore";
import { useAccount } from "wagmi";
import { useCustomToast } from "@/components/ui/custom-toast";
import { useConnectKitSign } from "@/hooks/useConnectKitSign";
import { useChainSwitch } from "@/hooks/useChainSwitch";
import { TransactionType } from "@/hooks/useChainSwitch";
import { chains } from "@lens-chain/sdk/viem";

export default function LaunchPage() {
  const { selectedAccount, accounts } = useAccountStore();
  const { signWithConnectKit } = useConnectKitSign();
  const { address, chain } = useAccount();
  const toast = useCustomToast();
  const [memeImage, setMemeImage] = useState<string | null>("");
  const [step, setStep] = useState(1);
  // const [isUploading, setIsUploading] = useState(false)
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [memeTitle, setMemeTitle] = useState<string>("");
  const [memeDescription, setMemeDescription] = useState<string>("");
  const [memeSymbol, setMemeSymbol] = useState<string>("");
  const { switchToChain } = useChainSwitch();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  // console.log(selectedAccount);

  const handleMint = async () => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    if (!selectedAccount?.username.localName) {
      toast.error("No Lens handle selected");
      return;
    }

    setIsMinting(true);

    //ensure we are on mainnet
    if (chain && chain?.id !== chains.mainnet.id) {
      switchToChain(TransactionType.accountCreation);
    }
    try {
      // Generate timestamp
      const timestamp = Date.now();
      const handle = selectedAccount.username.localName;

      // Create message
      const message = `Mint meme for handle: ${handle} at ${timestamp}`;
      const signature = await signWithConnectKit(message);

      console.log(
        {
          name: memeTitle,
          ticker: memeSymbol,
          description: memeDescription,
          image: memeImage,
          message,
          signature,
          timestamp,
        },
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/mintMemeCoins/${handle}`
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/mintMemeCoins/${handle}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: memeTitle,
            ticker: memeSymbol,
            description: memeDescription,
            image: memeImage,
            message,
            signature,
            timestamp,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mint meme coins");
      }

      setShowSuccess(true);

      // Trigger confetti
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      console.log(response);
    } catch (error) {
      console.error("Minting error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mint meme coins. Please try again."
      );
    } finally {
      setIsMinting(false);
    }
  };

  if (showSuccess) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20"
          />
          <div className="container px-4 py-12 mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-8 text-white bg-primary rounded-full">
                <Sparkles className="w-10 h-10" />
              </div>
              <h1 className="mb-6 text-5xl font-black text-black">
                Meme Created!
              </h1>
              <p className="mb-8 text-xl text-gray-600">
                Your meme has been successfully tokenized and is now live on the
                blockchain.
              </p>

              <div className="p-8 mb-8 border-2 border-black">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${memeImage}`}
                    alt="Your meme"
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="mb-2 text-2xl font-bold">{memeTitle} Token</h2>
                <p className="mb-4 text-gray-600">
                  ${memeSymbol} • 1,000,000,000 supply
                </p>
                <div className="flex justify-center gap-4">
                  {/* <Button className="gap-2 bg-primary hover:shadow-2xl hover:bg-primary/90">
                    <LinkIcon className="w-4 h-4" />
                    Share
                  </Button> */}
                  <Link href={`/explore`}>
                    <Button
                      variant="outline"
                      className="gap-2 border-2 border-black text-black hover:shadow-2xl cursor-pointer"
                    >
                      View on Explorer
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/profile/mememaster">
                  {/* <Button
                    size="lg"
                    className="w-full hover:shadow-2xl cursor-pointer gap-2 bg-primary hover:bg-primary/90 sm:w-auto"
                  >
                    View Your Profile
                  </Button> */}
                </Link>
                <Link href="/launch">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 cursor-pointer hover:shadow-2xl border-2 border-black text-black sm:w-auto"
                    onClick={() => {
                      setShowSuccess(false);
                      setStep(1);
                      setMemeImage(null);
                    }}
                  >
                    Create Another Meme
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="container relative z-10 px-4 py-12 mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Step Content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <ConnectProfile
                  setStep={setStep}
                  selectedAccount={selectedAccount}
                />
              )}
              {step === 2 && (
                <CreateMemeForm
                  memeImage={memeImage}
                  setMemeImage={setMemeImage}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                  memeTitle={memeTitle}
                  setMemeTitle={setMemeTitle}
                  memeDescription={memeDescription}
                  setMemeDescription={setMemeDescription}
                />
              )}
              {step === 3 && (
                <TokenSettingForm
                  handlePrevStep={handlePrevStep}
                  handleMint={handleMint}
                  isMinting={isMinting}
                  memeImage={memeImage}
                  memeSymbol={memeSymbol}
                  setMemeSymbol={setMemeSymbol}
                  memeTitle={memeTitle}
                  setMemeTitle={setMemeTitle}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
