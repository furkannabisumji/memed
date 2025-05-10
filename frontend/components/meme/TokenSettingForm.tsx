import React from "react";
import { Button } from "../ui/button";
import { Loader2, Rocket } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import Image from "next/image";

export default function TokenSettingForm({
  handlePrevStep,
  handleMint,
  isMinting,
  memeImage,
}: {
  handlePrevStep: () => void;
  handleMint: () => void;
  isMinting: boolean;
  memeImage: string | null;
}) {
  return (
    <div className="p-8 border-2 border-black">
      <h1 className="mb-6 text-4xl font-black text-black">Token Settings</h1>
      <p className="mb-8 text-lg text-gray-600">
        Configure your meme token&apos;s properties and economics.
      </p>

      <div className="grid gap-8 mb-8 md:grid-cols-2">
        <div>
          <div className="mb-6">
            <Label htmlFor="token-name" className="mb-2 text-lg font-bold">
              Token Name
            </Label>
            <Input
              id="token-name"
              placeholder="e.g., DogeToken"
              className="border-2 border-black"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="token-symbol" className="mb-2 text-lg font-bold">
              Token Symbol
            </Label>
            <Input
              id="token-symbol"
              placeholder="e.g., DOGE"
              className="border-2 border-black"
            />
          </div>

          <div className="mb-6">
            <Label className="mb-2 text-lg font-bold">Initial Supply</Label>
            <div className="flex items-center gap-4">
              <Slider
                defaultValue={[1000000]}
                max={10000000}
                step={100000}
                className="flex-1"
              />
              <span className="text-lg font-bold">1,000,000</span>
            </div>
          </div>

          <div className="mb-6">
            <Label className="mb-2 text-lg font-bold">Creator Fee</Label>
            <div className="flex items-center gap-4">
              <Slider
                defaultValue={[5]}
                max={10}
                step={0.5}
                className="flex-1"
              />
              <span className="text-lg font-bold">5%</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            <Image
              src={memeImage || "/placeholder.svg"}
              alt="Uploaded meme"
              fill
              className="object-contain"
            />
          </div>

          <div className="p-4 bg-accent border-2 border-black">
            <h3 className="mb-2 text-lg font-bold">Token Economics</h3>
            <p className="text-gray-600">
              Your token will be tradable on decentralized exchanges. Engagement
              rewards will distribute 2% of supply to users who interact with
              your meme.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="border-2 border-black text-black hover:bg-black hover:text-white cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={handleMint}
          className="gap-2 bg-primary hover:bg-primary/90 hover:shadow-2xl cursor-pointer"
          disabled={isMinting}
        >
          {isMinting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Launch
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
