"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useQuery } from "@apollo/client";
import { ACCOUNTS_AVAILABLE_QUERY } from "@/lib/queries";
import Image from "next/image";
import { Button } from "../ui/button";
import { AccountsList } from "./AccountList";
import { ConnectKitButton } from "connectkit";
import { Copy, LogOut, ExternalLink } from "lucide-react";

interface AccountButtonProps {
  className?: string;
}

export function AccountButton({ className }: AccountButtonProps) {
  // Reference for the button element
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });

  // Client-side only states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Query available accounts
  const {
    data: accountsAvailable,
    loading: loadingAvailableAcc,
    refetch: refetchAccts,
  } = useQuery(ACCOUNTS_AVAILABLE_QUERY, {
    variables: { managedBy: address, includeOwned: true },
    skip: !address,
  });

  // Get the first account for display in the button
  const accountItems = accountsAvailable?.accountsAvailable?.items || [];
  const firstAccount = accountItems[0]?.account;
  const hasAccounts = accountItems.length > 0;

  // Set the first account as selected by default if no account is selected
  useEffect(() => {
    if (hasAccounts && !selectedAccount) {
      setSelectedAccount(firstAccount);
    }
  }, [hasAccounts, firstAccount, selectedAccount]);

  // Handle account selection
  const handleAccountSelected = (account: any) => {
    setSelectedAccount(account);
    setIsModalOpen(false);
    // Refetch accounts to ensure we have the latest data
    refetchAccts();
  };

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Copy address to clipboard
  const copyAddressToClipboard = () => {
    if (address && isMounted) {
      navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setIsModalOpen(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".account-modal") &&
        !target.closest(".account-button")
      ) {
        setIsModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle modal on button click
  const toggleModal = () => {
    console.log("Toggle modal", !isModalOpen); // Debug log
    setIsModalOpen(!isModalOpen);
  };

  // Go to welcome page to create account
  const goToWelcomePage = () => {
    router.push("/welcome");
  };

  // Don't render anything complex during server-side rendering
  if (!isMounted) {
    return (
      <div
        className={`h-10 w-32 bg-primary rounded-md ${className || ""}`}
      ></div>
    );
  }

  if (!isConnected) {
    return <ConnectKitButton />;
  }

  return (
    <div className="relative">
      {/* Account Button */}
      <button
        ref={buttonRef}
        onClick={hasAccounts ? toggleModal : goToWelcomePage}
        type="button"
        className={`account-button cursor-pointer flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/90 transition-colors ${
          className || ""
        }`}
      >
        {/* Profile Image or Icon */}
        {(selectedAccount || firstAccount)?.metadata?.picture ? (
          <div className="w-6 h-6 rounded-full overflow-hidden bg-white">
            <Image
              src={
                (selectedAccount || firstAccount).metadata.picture?.optimized
                  ?.uri ||
                (selectedAccount || firstAccount).metadata.picture?.uri ||
                "/placeholder-avatar.png"
              }
              alt="Profile"
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}

        {/* Display Name/Username */}
        <span className="hidden md:inline">
          {(selectedAccount || firstAccount)?.metadata?.displayName ||
            ((selectedAccount || firstAccount)?.username?.localName &&
              `@${(selectedAccount || firstAccount).username.localName}`) ||
            (address && formatAddress(address))}
        </span>
      </button>

      {/* Account Modal */}
      {isModalOpen && isMounted && (
        <div
          className="account-modal fixed bg-white rounded-lg shadow-lg border border-gray-200 w-80 z-[100]"
          style={{
            top: buttonRef.current
              ? buttonRef.current.getBoundingClientRect().bottom + 8
              : 0,
            right: 16,
          }}
        >
          {/* Modal Header - Wallet Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Account</h3>
              <button
                onClick={handleDisconnect}
                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>

            {/* Connected Chain */}
            <div className="bg-gray-50 rounded-md p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Connected to:</span>
                <span className="text-sm">Lens Testnet</span>
              </div>

              {/* Wallet Address */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Address:</span>
                <div className="bg-white rounded border border-gray-200 py-1 px-2 flex-1 flex items-center justify-between">
                  <span className="text-sm font-mono">
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={copyAddressToClipboard}
                    className="text-gray-500 hover:text-gray-700"
                    title="Copy full address"
                  >
                    {copySuccess ? (
                      <span className="text-green-500 text-xs">Copied!</span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Balance */}
              {balanceData && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Balance:</span>
                  <span className="text-sm">
                    {parseFloat(balanceData?.formatted).toFixed(4)}{" "}
                    {balanceData?.symbol}
                  </span>
                </div>
              )}
            </div>

            {/* Currently Selected Account */}
            {selectedAccount && (
              <div className="mb-3">
                <h4 className="text-md font-medium mb-2">Selected Account</h4>
                <div className="bg-primary/10 rounded-md p-3 flex items-center gap-3">
                  {selectedAccount.metadata?.picture ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
                      <Image
                        src={
                          selectedAccount.metadata.picture?.optimized?.uri ||
                          selectedAccount.metadata.picture?.uri ||
                          "/placeholder-avatar.png"
                        }
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-500">
                        {selectedAccount.username?.localName?.[0]?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {selectedAccount.metadata?.displayName ||
                        (selectedAccount.username?.localName &&
                          `@${selectedAccount.username.localName}`) ||
                        "Unknown Account"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAddress(selectedAccount.address)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h4 className="text-md font-medium mb-2">Your Lens Accounts</h4>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            {loadingAvailableAcc ? (
              <div className="text-center py-4">Loading accounts...</div>
            ) : hasAccounts ? (
              <div className="max-h-60 overflow-y-auto">
                <AccountsList
                  accountsAvailable={accountsAvailable.accountsAvailable}
                  onAccountSelected={handleAccountSelected}
                />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No Lens accounts found</p>
                <Button onClick={goToWelcomePage} className="w-full">
                  Create Account
                </Button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
            <div className="flex justify-between">
              <button
                onClick={handleDisconnect}
                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
              >
                <LogOut size={14} />
                Disconnect Wallet
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
