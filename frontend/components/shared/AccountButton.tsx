"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import Image from "next/image";
import { Button } from "../ui/button";
import { AccountsList } from "./AccountList";
import { ConnectKitButton } from "connectkit";
import { Copy, LogIn, LogOut, UserPlus } from "lucide-react";
import { accountEvents, ACCOUNT_CREATED } from "@/lib/accountEvents";
import { useAccountStore } from "@/store/accountStore";

interface AccountButtonProps {
  className?: string;
}

export function AccountButton({ className }: AccountButtonProps) {
  // Reference for the button element
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Wagmi hooks
  const { isConnected, address, isConnecting, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });

  // Client-side only states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Add a timeout tracker for connection state
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get account state from the store
  const {
    selectedAccount,
    accounts: accountsStore,
    isLoading: isLoadingStore,
    fetchAccounts: fetchAccountsStore,
    setSelectedAccount,
  } = useAccountStore();

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Clear any timeouts on unmount
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  // Handle connection timeout
  useEffect(() => {
    // If connecting starts, set a timeout
    if (isConnecting && isMounted) {
      connectionTimeoutRef.current = setTimeout(() => {
        setConnectionTimedOut(true);
      }, 60000); // 1 minute timeout
    } else {
      // If no longer connecting, clear the timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      // Reset timeout state if we're connected successfully
      if (isConnected) {
        setConnectionTimedOut(false);
      }
    }
  }, [isConnecting, isMounted, isConnected]);

  // State for accounts data
  const [accountsAvailable, setAccountsAvailable] = useState<any>(null);
  const [loadingAvailableAcc, setLoadingAvailableAcc] = useState(false);

  // Function to fetch accounts using the store implementation
  const fetchAccounts = useCallback(async () => {
    if (!address) return;

    // Only show loading on first fetch
    if (!accountsAvailable) {
      setLoadingAvailableAcc(true);
    }

    try {
      // Use the store's fetchAccounts method
      await fetchAccountsStore(address);

      // Get the accounts from the store
      const storeAccounts = accountsStore;

      // Create a format compatible with the existing component
      const accountsFormat = {
        items: storeAccounts.map((acc) => ({ account: acc.account })),
      };

      // Only update local state if needed for UI purposes
      setAccountsAvailable({ accountsAvailable: accountsFormat });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      if (!accountsAvailable) {
        setAccountsAvailable({ accountsAvailable: { items: [] } });
      }
    } finally {
      setLoadingAvailableAcc(false);
    }
  }, [address, accountsAvailable, fetchAccountsStore, accountsStore]);

  // Memoize account items to prevent unnecessary re-renders
  const accountItems = useMemo(() => {
    return accountsAvailable?.accountsAvailable?.items || [];
  }, [accountsAvailable]);

  // Memoize if the user has any accounts
  const hasAccounts = useMemo(() => {
    return accountItems && accountItems.length > 0;
  }, [accountItems]);

  // Get the first account for display if no selected account
  const firstAccount = useMemo(() => {
    return accountItems && accountItems.length > 0
      ? accountItems[0].account
      : null;
  }, [accountItems]);

  // Effect to initialize selected account if needed, but only on initial mount
  // Using a ref to ensure we don't override user selections
  const initialSelectionMadeRef = useRef(false);

  useEffect(() => {
    if (!initialSelectionMadeRef.current && !selectedAccount && firstAccount) {
      setSelectedAccount(firstAccount);
      initialSelectionMadeRef.current = true;
    }
  }, [firstAccount, selectedAccount, setSelectedAccount]);

  // Fetch accounts on mount and when address changes
  useEffect(() => {
    if (address && isMounted && isConnected) {
      // Initial fetch
      fetchAccounts();

      // Set up a refresh interval to check for new accounts
      const refreshInterval = setInterval(() => {
        fetchAccounts();
      }, 5000); // Check every 5 seconds

      // Set up event listener for account creation
      const unsubscribe = accountEvents.on(ACCOUNT_CREATED, async () => {
        console.log("Account creation event received in AccountButton");
        await fetchAccounts();
      });

      return () => {
        clearInterval(refreshInterval);
        unsubscribe(); // Clean up event listener
      };
    }
  }, [address, isMounted, isConnected, fetchAccounts]);

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
    // Reset the store and clear localStorage
    const store = useAccountStore.getState();
    store.resetStore();

    // Disconnect wallet
    disconnect();
    setIsModalOpen(false);

    // Force a refresh of the page to ensure all components update correctly
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        isModalOpen &&
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
  }, [isModalOpen]);

  // Toggle modal on button click
  const toggleModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If we're opening the modal, force a refresh of accounts
    if (!isModalOpen) {
      fetchAccounts();
    }

    setIsModalOpen(!isModalOpen);
  };

  // Go to welcome page to create account
  const goToWelcomePage = () => {
    router.push("/accounts");
  };

  // Handle retrying connection after timeout
  const handleRetryConnection = () => {
    setConnectionTimedOut(false);
    // Force a page refresh to restart the connection process
    window.location.reload();
  };

  // Don't render anything complex during server-side rendering
  if (!isMounted) {
    return (
      <div
        className={`h-10 w-32 bg-primary rounded-md ${className || ""}`}
      ></div>
    );
  }

  // Handle connection timed out state
  if (connectionTimedOut) {
    return (
      <div
        className={`flex items-center justify-center h-10 ${className || ""}`}
      >
        <button
          onClick={handleRetryConnection}
          className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
        >
          <span className="text-sm">Connection failed, retry</span>
        </button>
      </div>
    );
  }

  // Handle connecting state
  if (isConnecting || status === "reconnecting") {
    return (
      <div
        className={`flex items-center justify-center h-10 ${className || ""}`}
      >
        <div className="relative w-5 h-5">
          <div className="absolute w-full h-full rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
        </div>
        <span className="ml-2 text-sm text-gray-600">Connecting...</span>
      </div>
    );
  }

  // Handle disconnected state
  if (!isConnected) {
    return <ConnectKitButton />;
  }

  // At this point, we know the user is connected
  return (
    <div className="relative">
      {/* Account Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          if (hasAccounts) {
            toggleModal(e);
          } else {
            goToWelcomePage();
          }
        }}
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
                typeof (selectedAccount || firstAccount).metadata.picture ===
                "string"
                  ? (selectedAccount || firstAccount).metadata.picture
                  : ((selectedAccount || firstAccount).metadata.picture as any)
                      ?.original?.url ||
                    ((selectedAccount || firstAccount).metadata.picture as any)
                      ?.optimized?.url ||
                    ((selectedAccount || firstAccount).metadata.picture as any)
                      ?.uri ||
                    "/fallback.png"
              }
              alt="Profile"
              width={24}
              height={24}
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/fallback.png";
              }}
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
                onClick={goToWelcomePage}
                className="text-green-500 hover:text-green-700 flex items-center gap-1 text-sm cursor-pointer"
              >
                <UserPlus size={14} />
                Create account
              </button>
            </div>

            {/* Connected Chain */}
            <div className="bg-gray-50 rounded-md p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Connected to:</span>
                <span className="text-sm">Lens Mainnet</span>
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
                  {(selectedAccount || firstAccount)?.metadata?.picture ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                      <Image
                        src={
                          typeof (selectedAccount || firstAccount).metadata
                            .picture === "string"
                            ? (selectedAccount || firstAccount).metadata.picture
                            : (
                                (selectedAccount || firstAccount).metadata
                                  .picture as any
                              )?.original?.url ||
                              (
                                (selectedAccount || firstAccount).metadata
                                  .picture as any
                              )?.optimized?.url ||
                              (
                                (selectedAccount || firstAccount).metadata
                                  .picture as any
                              )?.uri ||
                              "/placeholder-avatar.png"
                        }
                        alt="Profile"
                        width={30}
                        height={30}
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/fallback.png";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-500">
                        {selectedAccount?.username?.localName?.[0]?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {(selectedAccount.metadata as any)?.displayName ||
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
                />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No Lens accounts found</p>
                <Button
                  onClick={goToWelcomePage}
                  className="w-full cursor-pointer"
                >
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
                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm cursor-pointer"
              >
                <LogOut size={14} />
                Disconnect Wallet
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
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
