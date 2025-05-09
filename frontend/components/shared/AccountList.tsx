import * as React from "react";
import { useState, useRef, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AccountsAvailableResponse } from "@/app/types";
import Image from "next/image";
import { client } from "@/lib/client";
import { enableSignless } from "@lens-protocol/client/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useWalletClient } from "wagmi";
import { signMessageWith } from "@/lib/lens";
import { useCustomToast } from "@/components/ui/custom-toast";

export function AccountsList({
  accountsAvailable,
  onAccountSelected,
}: {
  accountsAvailable: AccountsAvailableResponse;
  onAccountSelected?: (account: any) => void;
}): React.ReactElement {
  // Make sure we have valid data before proceeding
  if (!accountsAvailable || !accountsAvailable.items) {
    return <div className="text-center py-4 text-gray-500">No account data available</div>;
  }
  
  // Process accounts data early to avoid reference errors
  const filteredAccounts = removeDuplicatesByAddress(accountsAvailable);
  
  if (filteredAccounts.items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No profiles found. Create one or connect a different wallet.
      </div>
    );
  }
  const { data: walletClient } = useWalletClient();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const toast = useCustomToast();
  
  // Add client-side only rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Early return if not client-side yet to prevent hydration errors
  if (!isClient) {
    return <div className="min-h-[200px] flex items-center justify-center">Loading accounts...</div>;
  }

  function removeDuplicatesByAddress(
    accounts: AccountsAvailableResponse
  ): AccountsAvailableResponse {
    const seen = new Set<string>();
    const filteredItems = accounts.items.filter((item) => {
      const address = item.account.address;
      if (seen.has(address)) {
        return false;
      }
      seen.add(address);
      return true;
    });

    return {
      ...accounts,
      items: filteredItems,
    };
  }

  const auth = async (address: string, owner: string) => {
    // Show initial toast
    const signingToastId = "signing-toast-" + Date.now();
    toast.info(
      "Please sign the message to switch to this profile",
      {
        id: signingToastId,
        description: "Switching profile...",
        duration: 3000, // Shorter duration
      }
    );

    try {
      const authenticated = await client.login({
        accountOwner: {
          account: address,
          app: process.env.NEXT_PUBLIC_APP_ADDRESS,
          owner,
        },
        signMessage: async (message) => {
          try {
            // Using the improved signMessageWith function which has multiple fallbacks
            return await signMessageWith(message, owner);
          } catch (error) {
            console.error("Error signing message:", error);
            throw error;
          }
        },
      });

      // Dismiss the signing toast once authentication is complete
      toast.dismiss(signingToastId);

      if (authenticated.isErr()) {
        toast.error("Failed to authenticate with Lens Protocol", {
          description: authenticated.error.message,
          duration: 3000, // Shorter duration
        });
        return console.error(authenticated.error);
      }

      const sessionClient = authenticated.value;
      // We're skipping signless setup to avoid toast issues
      console.log("Authentication successful, skipping signless setup");
      
      // Store the selected account for display
      const accountToStore = filteredAccounts.items.find(
        (item: any) => item.account.address === address
      )?.account;

      setSelectedAccount(accountToStore);

      toast.success("Profile switched successfully", {
        description: "You are now using a different Lens profile",
        duration: 3000,
      });

      // Call the onAccountSelected callback if provided
      if (onAccountSelected) {
        onAccountSelected(accountToStore);
      }
    } catch (error: any) {
      console.error("Error switching profile:", error);
      // Dismiss any active toasts
      toast.dismiss(signingToastId);
      toast.error("Error switching profile", {
        description: error?.message || "An unexpected error occurred",
        duration: 3000,
      });
    }
  };

  // Client-side rendering check already done above

  return (
    <TooltipProvider>
      {/* Display selected account details if available */}
      {selectedAccount && (
        <div className="mb-4 p-3 border rounded-lg bg-secondary">
          <h3 className="font-medium mb-1">Active Profile</h3>
          <div className="flex items-center gap-2">
            {selectedAccount.metadata?.picture ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={
                    typeof selectedAccount.metadata.picture === 'string'
                      ? selectedAccount.metadata.picture
                      : selectedAccount.metadata.picture?.original?.url ||
                        selectedAccount.metadata.picture?.optimized?.url ||
                        selectedAccount.metadata.picture?.uri ||
                        "/placeholder-avatar.png"
                  }
                  alt={selectedAccount.username?.localName || "Profile"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {selectedAccount.username?.localName?.[0]?.toUpperCase() ||
                    "?"}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">
                {selectedAccount.username?.localName || "Unknown"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selectedAccount.address}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-2">
        <p className="text-sm text-gray-500 mb-2">
          Click on a profile to switch to it
        </p>
      </div>

      {/* Custom carousel with separate navigation controls */}
      <div className="relative w-full max-w-sm">
        {/* Custom navigation buttons positioned outside the carousel */}
        {filteredAccounts.items.length > 3 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 z-10 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                const carousel = document.querySelector("[data-carousel]");
                const scrollAmount = carousel?.clientWidth || 0;
                if (carousel) {
                  carousel.scrollBy({
                    left: -scrollAmount / 2,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                const carousel = document.querySelector("[data-carousel]");
                const scrollAmount = carousel?.clientWidth || 0;
                if (carousel) {
                  carousel.scrollBy({
                    left: scrollAmount / 2,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Carousel content */}
        <div
          className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
          data-carousel
        >
          {filteredAccounts.items && filteredAccounts.items.map((item: any, index: number) => (
            <div
              key={index}
              onClick={() => auth(item.account.address, item.account.owner)}
              className="flex-none w-1/2 md:w-1/2 lg:w-1/3 p-2 cursor-pointer snap-start"
            >
              <div className="p-1 transition-all duration-200 hover:scale-105">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-0 border-2 hover:border-primary hover:shadow-md transition-all duration-200">
                      <CardContent className="flex flex-col items-center justify-center p-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md mb-2">
                          {item.account.metadata?.picture ? (
                            <Image
                              src={typeof item.account.metadata.picture === 'string' ? 
                                item.account.metadata.picture : 
                                item.account.metadata.picture?.original?.url ||
                                item.account.metadata.picture?.optimized?.url ||
                                item.account.metadata.picture?.uri || "/placeholder-avatar.png"}
                              alt={
                                item.account.username?.localName ||
                                "Profile picture"
                              }
                              width={0}
                              height={0}
                              sizes="100vw"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load');
                                (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-gray-400">
                                {item.account.username?.localName?.[0]?.toUpperCase() ||
                                  "?"}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                Pending metadata
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate w-full text-center">
                          {item.account.username?.localName || "Unknown User"}
                        </p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="z-[110]">
                    <p>
                      Click to switch to{" "}
                      {item.account.username?.localName || "this profile"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
