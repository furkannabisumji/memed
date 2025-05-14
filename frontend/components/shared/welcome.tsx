"use client";
import { useAccount, useWalletClient } from "wagmi";
import { useConnectKitSign } from "@/hooks/useConnectKitSign";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AccountsList } from "./AccountList";
import { useCustomToast } from "@/components/ui/custom-toast";
import {
  createNewAccount,
  createProfileMetadata,
  uploadToIPFS,
} from "@/lib/lens";
import { DisconnectWalletButton } from "./DisconnectWalletButton";
import ImageUploader from "./ImageUploader";
import { accountEvents, ACCOUNT_CREATED } from "@/lib/accountEvents";
import { AccountButton } from "./AccountButton";
import { useAccountStore } from "@/store/accountStore";
import { chains } from "@lens-chain/sdk/viem";
import { useChainSwitch } from "@/hooks/useChainSwitch";
import { TransactionType } from "@/hooks/useChainSwitch";

export function Welcome() {
  // Add client-side only rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  const toast = useCustomToast();
  const { isConnected, address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { signWithConnectKit } = useConnectKitSign();
  const [image, setImage] = useState<string | null>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const { switchToChain } = useChainSwitch();

  // Use the account store for all account-related state
  const {
    selectedAccount: selectedAccountStore,
    accounts: accountsStore,
    isLoading: isLoadingStore,
    fetchAccounts: fetchAccountsStore,
    setSelectedAccount,
    setIsLoading: setIsLoadingStore,
  } = useAccountStore();

  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  //check chain
  useEffect(() => {
    if (chain?.id !== chains.mainnet.id) {
      switchToChain(TransactionType.accountCreation);
    }
  }, [chain, switchToChain]);

  useEffect(() => {
    // Only provide a cleanup function for unmount
    return () => {
      // Dismiss all toasts when component unmounts
      if (toast && toast.dismissAll) {
        toast.dismissAll();
      }
    };
  }, []); // Add empty dependency array to prevent infinite loops

  // Function to fetch accounts - let the store handle loading state
  const fetchAccounts = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoadingStore(true);
      const accounts = await fetchAccountsStore(address);

      console.log(`Fetched ${accounts.length} accounts from the store`);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch your profiles");
    } finally {
      setIsLoadingStore(false);
    }
  }, [address, toast, fetchAccountsStore]);

  // Fetch accounts on initial load and when address changes
  // Using a ref to prevent infinite loops
  const hasFetchedRef = useRef(false);

  // Use a separate effect for resetting store state to avoid infinite loops
  useEffect(() => {
    // Only reset the store when disconnecting
    if (!address || !isConnected) {
      // Reset the account store state when disconnected
      // Use a timeout to ensure this happens after the component state updates
      setTimeout(() => {
        useAccountStore.getState().resetStore();
      }, 0);
    }
  }, [address, isConnected]);

  // Handle initial fetch and state reset separately
  useEffect(() => {
    if (address && isConnected && isClient && !hasFetchedRef.current) {
      // Initial fetch
      fetchAccounts();
      hasFetchedRef.current = true;
    } else if (!address || !isConnected) {
      // Reset component state when disconnected
      hasFetchedRef.current = false;
      setImage("");
      setLocalName("");
      setTxHash("");
      setIsGenerating(false);
    }
  }, [address, isConnected, fetchAccounts, isClient]);

  // Simple function to refresh accounts
  const refetchAccts = async () => {
    try {
      await fetchAccounts();
    } catch (error) {
      console.error("Error refreshing accounts:", error);
      toast.error("Failed to refresh profiles");
    }
  };

  // Function to periodically refresh accounts data - simplified to use store state
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshing || !isClient) return;

    // Dismiss any existing toasts first
    toast.dismissAll();

    // Set auto-refreshing state
    setAutoRefreshing(true);

    let refreshCount = 0;
    const maxRefreshes = 6; // Increased to 6 refreshes (60 seconds total)
    let foundNewAccount = false;

    // Use a unique ID for this toast
    const refreshStartId = `auto-refresh-start-${Date.now()}`;
    toast.info("Waiting for your new profile to appear...", {
      id: refreshStartId,
      description: "This may take a minute or two",
      duration: 3000,
    });

    const refreshInterval = setInterval(async () => {
      // Fetch new accounts using the store
      await fetchAccountsStore(address || "");
      refreshCount++;

      // Check if we have a new account by comparing counts
      const currentAccountCount = accountsStore.length || 0;

      if (refreshCount >= maxRefreshes && !foundNewAccount) {
        // Max attempts reached without finding new account
        clearInterval(refreshInterval);
        setAutoRefreshing(false);
        toast.dismissAll();
        toast.info("Your profile may take longer to appear", {
          id: `refresh-complete-${Date.now()}`,
          description: "Check back in a few minutes if you don't see it yet",
          duration: 5000,
        });
      }
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(refreshInterval);
      setAutoRefreshing(false);
    };
  }, [
    toast,
    autoRefreshing,
    isClient,
    fetchAccountsStore,
    address,
    accountsStore,
    selectedAccountStore,
    setSelectedAccount,
  ]);

  // Username validation rules for Lens Protocol
  const validateUsername = (username: string) => {
    // Check length (5-31 characters)
    if (username.length < 5 || username.length > 31) {
      return {
        valid: false,
        reason: "Username must be between 5 and 31 characters",
      };
    }

    // Check for valid characters (alphanumeric and underscores only)
    const validCharsRegex = /^[a-zA-Z0-9_]+$/;
    const hasValidChars = validCharsRegex.test(username);
    if (!hasValidChars) {
      return {
        valid: false,
        reason: "Username can only contain letters, numbers, and underscores",
      };
    }

    // Check if it starts with a letter or number (not underscore)
    const validStartRegex = /^[a-zA-Z0-9]/;
    const hasValidStart = validStartRegex.test(username);
    if (!hasValidStart) {
      return {
        valid: false,
        reason: "Username must start with a letter or number",
      };
    }

    return { valid: true };
  };

  // Reset form state and dismiss any lingering toasts
  const resetForm = () => {
    setLocalName("");
    setImage(null);
    toast.dismissAll(); // Ensure all toasts are dismissed when resetting
  };

  // Handle image changes with proper toast dismissal
  const handleImageChange = useCallback(
    (newImage: string | null) => {
      // Dismiss any existing image upload toasts first
      toast.dismissAll();
      setImage(newImage);
    },
    [toast]
  );

  const createAccount = async () => {
    // Dismiss any existing toasts before starting a new operation
    toast.dismissAll();

    // Validate username before proceeding
    const validation = validateUsername(localName);
    if (!validation.valid) {
      toast.error(validation?.reason || "Invalid username", {
        description: "Invalid username",
      });
      return;
    }

    if (!isConnected || !address || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsGenerating(true);

    // Define toast IDs outside the try block so they can be accessed in catch/finally
    const uploadingToastId = `uploading-metadata-${Date.now()}`;
    const creatingToastId = `creating-profile-${Date.now()}`;

    try {
      // Step 1: Create metadata for the profile using the function from lens.ts
      const profileMetadata = createProfileMetadata({
        localName,
        image,
        bio: `${localName}'s profile`,
      });

      const { Hash } = await uploadToIPFS(profileMetadata);
      // Make sure the URI is correctly formatted
      const metadataUri = `${
        process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY || "https://ipfs.io/ipfs/"
      }${Hash}`;

      toast.dismiss(uploadingToastId);
      toast.success("Your profile metadata has been uploaded to IPFS", {
        description: "Profile data uploaded",
      });

      // Step 2: Create account with username using the metadataUri
      toast.loading(
        "This may take a minute. Please wait and sign any requested transactions.",
        {
          id: creatingToastId,
          description: "Creating your profile",
        }
      );

      try {
        // Use the SDK function to create a new account
        const result = await createNewAccount({
          localName,
          metadataUri,
          address,
          walletClient,
          signFn: async (message) => await signWithConnectKit(message),
        });

        // Check if we have a valid account object or just a transaction hash
        if (result) {
          console.log("Account creation result:", result);

          // Reset form state completely
          resetForm();

          // Reset the file input element directly
          const fileInput = document.getElementById(
            "imageUploadInput"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }

          // If we got a transaction hash (string), store it for reference
          if (typeof result === "string") {
            setTxHash(result);
            console.log("Account creation transaction hash:", result);

            toast.dismiss(creatingToastId);
            toast.success("Account creation initiated!", {
              id: `account-created-${Date.now()}`,
              description: "Your profile is being created on the blockchain",
              duration: 5000,
            });

            // Start auto-refreshing to detect the new account
            await fetchAccountsStore(address || "");
            startAutoRefresh();
          }
          // If we got an account object, we can use it directly
          else if (typeof result === "object" && "address" in result) {
            toast.dismiss(creatingToastId);
            toast.success("Your new profile has been created!", {
              id: `account-created-${Date.now()}`,
              description: "You can now use your new Lens account",
              duration: 3000,
            });

            try {
              // First refresh accounts to make sure we have the latest list
              await fetchAccountsStore(address || "");

              // Then select the new account - use the result directly since we have it
              // This ensures we're selecting the newly created account
              console.log("Selecting newly created account directly:", result);
              setSelectedAccount(result as any);

              // Emit event to notify other components
              accountEvents.emit(ACCOUNT_CREATED);
            } catch (err) {
              console.error("Error selecting new account:", err);
            }
          }
        } else {
          toast.dismiss(creatingToastId);
          toast.error("Failed to create account", {
            description: "No result returned from account creation",
            duration: 5000,
          });
        }
      } catch (error: any) {
        console.error("Error in account creation:", error);
        // Make sure to dismiss any loading toasts
        toast.dismiss(uploadingToastId);
        toast.dismiss(creatingToastId);
        toast.error(
          "An unexpected error occurred during account creation. Please try again.",
          {
            description: error?.message || "Unknown error",
            duration: 5000,
          }
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // If we're not on the client yet, show a loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">
            Please wait while we initialize the application.
          </p>
          <p className="mt-2">
            Need help?{" "}
            <a
              href="https://docs.lens.xyz/docs/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Check the Lens Protocol documentation
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-3">
      {isConnected ? (
        <>
          <ImageUploader image={image} setImage={handleImageChange} />
          <div className="w-full max-w-sm flex flex-col gap-4 py-5">
            {/* Create Profile Section */}
            <div className="border border-gray-200 min-h-[200px] rounded-lg p-4 mb-2">
              <h2 className="text-lg font-semibold mb-3">Create New Profile</h2>
              <div className="h-12 flex items-center w-full mb-2">
                <Input
                  value={localName}
                  onChange={(e) =>
                    setLocalName(e.target.value.toLocaleLowerCase())
                  }
                  disabled={isGenerating}
                  placeholder="Choose username"
                  className="bg-background h-full w-full outline-none"
                />
              </div>
              <Button
                onClick={createAccount}
                disabled={isGenerating}
                className="w-full h-12 font-semibold cursor-pointer"
              >
                {isGenerating ? "Generating..." : "Get a profile"}
              </Button>
            </div>

            {/* Existing Accounts Section */}
            <div className="border border-gray-200 min-h-[200px] rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Your Profiles</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchAccts()}
                  disabled={isLoadingStore}
                  className="cursor-pointer"
                >
                  {isLoadingStore ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {isLoadingStore ? (
                <div className="text-center py-4 text-gray-500">
                  Loading your profiles...
                </div>
              ) : accountsStore && accountsStore.length > 0 ? (
                <AccountsList
                  accountsAvailable={{
                    // @ts-ignore
                    items: accountsStore.map((acc) => ({
                      account: acc.account,
                    })),
                    pageInfo: { next: null, prev: null },
                  }}
                />
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No profiles found. Create one above or connect a different
                  wallet.
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <DisconnectWalletButton className="mt-4" />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 border border-gray-200 rounded-lg p-6 mb-4 w-full max-w-sm">
          <div className="text-amber-600 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Wallet Not Connected</h3>
          <p className="text-gray-600 mb-4">
            Please connect your wallet to create or manage Lens profiles.
          </p>
          <div className="flex justify-center">
            <AccountButton />
          </div>
        </div>
      )}
    </div>
  );
}
