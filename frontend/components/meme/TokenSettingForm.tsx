import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  CircleDollarSign,
  Loader2,
  Pencil,
  Rocket,
  X,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from "../ui/badge";

export default function TokenSettingForm({
  handlePrevStep,
  handleMint,
  isMinting,
  memeImage,
  memeSymbol,
  setMemeSymbol,
  memeTitle,
  setMemeTitle,
}: {
  handlePrevStep: () => void;
  handleMint: () => void;
  isMinting: boolean;
  memeImage: string | null;
  memeSymbol: string;
  setMemeSymbol: (symbol: string) => void;
  memeTitle: string;
  setMemeTitle: (title: string) => void;
}) {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false);
  const [tempTitle, setTempTitle] = useState(memeTitle);
  const [tempSymbol, setTempSymbol] = useState(memeSymbol);
  const [hasReviewed, setHasReviewed] = useState(false);

  const handleSaveTitle = () => {
    setMemeTitle(tempTitle);
    setIsNameDialogOpen(false);
  };

  const handleSaveSymbol = () => {
    setMemeSymbol(tempSymbol);
    setIsSymbolDialogOpen(false);
  };

  return (
    <div className="p-8 bg-white rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-black">
          Ready to Launch
        </h1>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500 hover:bg-green-500 text-white px-3 py-1 rounded-lg font-medium">
            Preview
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        {/* Left Column - Image */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl overflow-hidden border-4 border-black shadow-md">
            <div className="relative w-full aspect-square">
              <Image
                src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${memeImage}`}
                alt="Uploaded meme"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-400 to-primary rounded-lg border-2 border-black">
            <div className="flex items-center mr-4">
              <div className="mr-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-xs uppercase">Ready</span>
            </div>
            <div className="text-sm font-medium">
              All systems are go for launch!
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-black">
            <h2 className="text-2xl font-bold mb-4">Token Overview</h2>

            <div className="space-y-5">
              <div>
                <Label
                  htmlFor="token-name"
                  className="text-sm text-gray-500 font-medium"
                >
                  TOKEN NAME
                </Label>
                <div className="flex items-center">
                  <div className="text-xl font-bold">
                    {memeTitle || "Untitled Token"}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 rounded-full p-0 hover:bg-gray-200"
                          onClick={() => {
                            setTempTitle(memeTitle);
                            setIsNameDialogOpen(true);
                          }}
                        >
                          <Pencil size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit token name</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="py-4 border-t border-gray-200">
                <Label className="text-sm text-gray-500 font-medium">
                  TOKEN SYMBOL
                </Label>
                <div className="flex items-center">
                  <div className="text-xl font-bold">{memeSymbol || "---"}</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 rounded-full p-0 hover:bg-gray-200"
                          onClick={() => {
                            setTempSymbol(memeSymbol);
                            setIsSymbolDialogOpen(true);
                          }}
                        >
                          <Pencil size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit token symbol</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="py-4 border-t border-gray-200">
                <Label className="text-sm text-gray-500 font-medium">
                  INITIAL SUPPLY
                </Label>
                <div className="text-xl font-bold">1,000,000,000 Tokens</div>
              </div>
            </div>
          </div>

          <div className="bg-accent p-6 rounded-xl border-2 border-black">
            <div className="flex items-start space-x-4">
              <div className="mt-1 p-2 bg-green-100 rounded-full">
                <CircleDollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Token Economics</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 bg-primary rounded-full mr-2"></div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Trading:</span> Your token
                      will be tradable on decentralized exchanges.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 bg-primary rounded-full mr-2"></div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Engagement rewards:</span>{" "}
                      2% of supply will be distributed to users who interact
                      with your meme.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 bg-primary rounded-full mr-2"></div>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Network:</span> Your token
                      will be deployed on the Lens network.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="w-full sm:w-auto border-2 border-black text-black hover:bg-black hover:text-white cursor-pointer px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mr-2 accent-primary"
              checked={hasReviewed}
              onChange={() => setHasReviewed(!hasReviewed)}
            />
            <span className="text-sm font-medium">
              I have reviewed all details
            </span>
          </label>
          <Button
            onClick={handleMint}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 cursor-pointer px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            disabled={isMinting || !hasReviewed || !memeTitle || !memeSymbol}
            size="lg"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Launch Token
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border-2 border-black p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold">
              Edit Token Name
            </DialogTitle>
            <DialogDescription>
              This will be the official name of your token on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="e.g., DogeCoin"
                  className="border-2 border-black"
                />
                <p className="text-xs text-gray-500">
                  Choose a memorable name that reflects your meme.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="border-2 border-black"
                onClick={() => setIsNameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTitle}
                disabled={!tempTitle.trim()}
                className="bg-primary hover:bg-primary/90 border-2 border-black"
              >
                Save Name
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Symbol Dialog */}
      <Dialog open={isSymbolDialogOpen} onOpenChange={setIsSymbolDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border-2 border-black p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold">
              Edit Token Symbol
            </DialogTitle>
            <DialogDescription>
              This will be the ticker symbol for your token on exchanges.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Token Symbol</Label>
                <Input
                  id="symbol"
                  value={tempSymbol}
                  onChange={(e) => setTempSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., DOGE"
                  className="border-2 border-black"
                  maxLength={5}
                />
                <p className="text-xs text-gray-500">
                  Typically 3-5 characters, all caps. (e.g., BTC, ETH, DOGE)
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="border-2 border-black"
                onClick={() => setIsSymbolDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSymbol}
                disabled={!tempSymbol.trim()}
                className="bg-primary hover:bg-primary/90 border-2 border-black"
              >
                Save Symbol
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
