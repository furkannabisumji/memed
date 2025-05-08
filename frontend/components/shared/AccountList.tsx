import * as React from "react";
import { useState, useRef } from "react";

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
import { toast } from "sonner";

export function AccountsList({
  accountsAvailable,
  onAccountSelected,
}: {
  accountsAvailable: AccountsAvailableResponse;
  onAccountSelected?: (account: any) => void;
}) {
  const { data: walletClient } = useWalletClient();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

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
    const signingToast = toast.info(
      "Please sign the message to switch to this profile",
      {
        description: "Switching profile...",
      }
    );

    try {
      const authenticated = await client.login({
        accountOwner: {
          account: address,
          app: process.env.NEXT_PUBLIC_APP_ADDRESS,
          owner,
        },
        signMessage: (message) => {
          if (!walletClient) {
            throw new Error("Wallet client is not initialized");
          }

          return walletClient.signMessage({
            account: owner as `0x${string}`,
            message,
          });
        },
      });

      // Dismiss the signing toast once authentication is complete
      toast.dismiss(signingToast);

      if (authenticated.isErr()) {
        toast.error("Failed to authenticate with Lens Protocol", {
          description: authenticated.error.message,
        });
        return console.error(authenticated.error);
      }

      const sessionClient = authenticated.value;
      // Try to enable signless, but handle the case where it's already enabled
      try {
        // Show loading toast for signless setup
        const signlessToast = toast.loading(
          "Setting up your account for signless transactions...",
          {
            description: "Enabling signless experience",
          }
        );

        const result = await enableSignless(sessionClient);

        // Dismiss the signless toast
        toast.dismiss(signlessToast);

        if (result.isErr()) {
          // Check if the error is because signless is already enabled
          if (result.error.message.includes("signless enabled already")) {
            console.log("Signless is already enabled for this account");
            // This is actually not an error, so we can continue
          } else {
            toast.error("Failed to enable signless transactions", {
              description: result.error.message,
            });
            return console.error(result.error);
          }
        } else {
          const session = result.value;
          console.log("Signless enabled:", session);
        }
      } catch (error) {
        console.log("Error enabling signless, but continuing:", error);
        // Continue anyway since this is not a critical error
      }

      // Store the selected account for display
      const accountToStore = filteredAccounts.items.find(
        (item) => item.account.address === address
      )?.account;

      setSelectedAccount(accountToStore);

      toast.success("You are now using a different Lens profile", {
        description: "Profile switched successfully",
      });

      // Call the onAccountSelected callback if provided
      if (onAccountSelected) {
        onAccountSelected(accountToStore);
      }
    } catch (error) {
      console.error("Error switching profile:", error);
      // Dismiss any active toasts
      toast.dismiss();
      toast.error("Error switching profile", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  console.log(removeDuplicatesByAddress(accountsAvailable));
  const filteredAccounts = removeDuplicatesByAddress(accountsAvailable);

  if (filteredAccounts.items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No profiles found. Create a new profile to get started.
      </div>
    );
  }

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
                  src={selectedAccount.metadata.picture}
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
          <div className="flex justify-between w-full absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none">
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
          {filteredAccounts.items.map((item, index) => (
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
                              src={`${item.account.metadata.picture}`}
                              alt={
                                item.account.username?.localName ||
                                "Profile picture"
                              }
                              width={0}
                              height={0}
                              sizes="100vw"
                              className="w-full h-full object-cover"
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
