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
import { truncateAddress } from "@/lib/helpers";

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
  const [imageProcessing, setImageProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  // Use the account store for all account-related state
  const {
    selectedAccount: selectedAccountStore,
    accounts: accountsStore,
    isLoading: isLoadingStore,
    fetchAccounts: fetchAccountsStore,
    setSelectedAccount,
    setIsLoading: setIsLoadingStore,
  } = useAccountStore();

  // Track if an account fetch is in progress to prevent duplicate requests
  const isFetchingRef = useRef(false);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Debounce timer for loading state changes
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Last accounts count to prevent unnecessary updates
  const lastAccountsCountRef = useRef<number>(0);

  // Safer way to set loading state with debounce
  const safeSetLoading = useCallback(
    (isLoading: boolean) => {
      // Clear any pending timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }

      // Set loading with debounce
      if (isLoading) {
        // Set loading immediately when turning on
        setIsLoadingStore(true);
      } else {
        // Delay turning off loading state to prevent flicker
        loadingTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setIsLoadingStore(false);
          }
        }, 300);
      }
    },
    [setIsLoadingStore]
  );

  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);

    // Set mounted ref to true and track last accounts count
    isMountedRef.current = true;
    lastAccountsCountRef.current = accountsStore.length;

    return () => {
      isMountedRef.current = false;

      // Clear any pending timers
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }

      // Ensure loading state is reset on unmount
      useAccountStore.getState().setIsLoading(false);

      // Dismiss all toasts when component unmounts
      if (toast && toast.dismissAll) {
        toast.dismissAll();
      }
    };
  }, [accountsStore.length]);

  //check chain
  useEffect(() => {
    if (chain && chain?.id !== chains.mainnet.id) {
      switchToChain(TransactionType.accountCreation);
    }
  }, [chain, switchToChain]);

  // Use a separate effect for resetting store state on disconnect
  useEffect(() => {
    if (!address || !isConnected) {
      // Reset the account store state when disconnected
      useAccountStore.getState().resetStore();

      // Reset component state
      setImage("");
      setLocalName("");
      setTxHash("");
      setIsGenerating(false);
      isFetchingRef.current = false;
    }
  }, [address, isConnected]);

  // Function to fetch accounts with debounce and state safety
  const fetchAccounts = useCallback(async () => {
    // Skip if no address or already fetching
    if (!address || isFetchingRef.current || !isMountedRef.current) return [];

    // Set fetching flag to prevent duplicate requests
    isFetchingRef.current = true;

    try {
      // Only set loading if we're actually going to fetch
      safeSetLoading(true);

      // Add a small delay to ensure UI stability
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch accounts
      const accounts = await fetchAccountsStore(address);

      // Only log and update if accounts changed
      if (accounts.length !== lastAccountsCountRef.current) {
        console.log(`Fetched ${accounts.length} accounts from the store`);
        lastAccountsCountRef.current = accounts.length;
      }

      return accounts;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      if (isMountedRef.current) {
        toast.error("Failed to fetch your profiles");
      }
      return [];
    } finally {
      // Turn off loading after a delay to avoid UI flicker
      if (isMountedRef.current) {
        safeSetLoading(false);
      }

      // Reset fetching flag after a small delay
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 500);
    }
  }, [address, toast, fetchAccountsStore, safeSetLoading]);

  // Initial fetch when component mounts with address
  useEffect(() => {
    // Only fetch once on initial mount with address
    if (address && isConnected && isClient && !isFetchingRef.current) {
      fetchAccounts();
    }
  }, [address, isConnected, isClient, fetchAccounts]);

  // Monitor accounts changes to avoid unnecessary loading state changes
  useEffect(() => {
    // If we have accounts and loading is true, turn it off after a delay
    if (accountsStore.length > 0 && isLoadingStore) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          safeSetLoading(false);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [accountsStore, isLoadingStore, safeSetLoading]);

  // Simple function to refresh accounts
  const refetchAccts = async () => {
    // Skip if already fetching
    if (isFetchingRef.current) return;

    try {
      await fetchAccounts();
    } catch (error) {
      console.error("Error refreshing accounts:", error);
      if (isMountedRef.current) {
        toast.error("Failed to refresh profiles");
      }
    }
  };

  // Function to periodically refresh accounts data
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshing || !isClient || !address) return;

    // Dismiss any existing toasts first
    toast.dismissAll();

    // Set auto-refreshing state
    setAutoRefreshing(true);

    let refreshCount = 0;
    const maxRefreshes = 6; // 60 seconds total

    // Use a unique ID for this toast
    const refreshStartId = `auto-refresh-start-${Date.now()}`;
    toast.info("Waiting for your new profile to appear...", {
      id: refreshStartId,
      description: "This may take a minute or two",
      duration: 3000,
    });

    const refreshInterval = setInterval(async () => {
      // Skip if already fetching or component unmounted
      if (isFetchingRef.current || !isMountedRef.current) return;

      refreshCount++;

      try {
        // Fetch new accounts
        await fetchAccounts();
      } catch (err) {
        console.error("Error in auto-refresh:", err);
      }

      // Check if we've reached max refresh attempts
      if (refreshCount >= maxRefreshes) {
        // Max attempts reached
        clearInterval(refreshInterval);
        if (isMountedRef.current) {
          setAutoRefreshing(false);
          toast.dismissAll();
          toast.info("Your profile may take longer to appear", {
            id: `refresh-complete-${Date.now()}`,
            description: "Check back in a few minutes if you don't see it yet",
            duration: 5000,
          });
        }
      }
    }, 10000); // Refresh every 10 seconds

    // Return cleanup function
    return () => {
      clearInterval(refreshInterval);
      setAutoRefreshing(false);
    };
  }, [toast, autoRefreshing, isClient, address, fetchAccounts]);

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
            if (isMountedRef.current) {
              setIsLoadingStore(true);
              await fetchAccountsStore(address || "");
              setIsLoadingStore(false);
              startAutoRefresh();
            }
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
              if (isMountedRef.current) {
                setIsLoadingStore(true);
                await fetchAccountsStore(address || "");
                setIsLoadingStore(false);
              }

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
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
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
    <div className="flex flex-col items-center justify-start min-h-[100vh] pb-20 relative bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="w-full max-w-md  overflow-auto relative ">
        {isConnected ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800">
                Create Your Lens Profile
              </h1>
              <p className="text-slate-500 mt-2">
                This account will be linked to your wallet and your meme
              </p>
            </div>

            {/* Card Container */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden ]">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 cursor-pointer py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === "create"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("create")}
                >
                  Create Profile
                </button>
                <button
                  className={`flex-1 cursor-pointer py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === "manage"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("manage")}
                >
                  Your Profiles
                </button>
              </div>

              {/* Create Profile Tab */}
              {activeTab === "create" && (
                <div className="p-6">
                  <div className="mb-6">
                    <ImageUploader
                      image={image}
                      setImage={handleImageChange}
                      setImageProcessing={setImageProcessing}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <Input
                        value={localName}
                        onChange={(e) =>
                          setLocalName(e.target.value.toLowerCase())
                        }
                        disabled={isGenerating}
                        placeholder="e.g. satoshi"
                        className="bg-white pr-12 h-12 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg w-full"
                      />
                      {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        .lens
                      </div> */}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Choose a unique username for your Lens profile
                    </p>
                  </div>

                  <Button
                    onClick={createAccount}
                    disabled={isGenerating || imageProcessing || !localName}
                    className="w-full h-12 font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Generating...
                      </span>
                    ) : imageProcessing ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Uploading Image...
                      </span>
                    ) : (
                      "Create Profile"
                    )}
                  </Button>
                </div>
              )}

              {/* Manage Profiles Tab */}
              {activeTab === "manage" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Your Profiles
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchAccts()}
                      disabled={
                        (isLoadingStore &&
                          (!accountsStore || accountsStore.length === 0)) ||
                        isFetchingRef.current
                      }
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {isLoadingStore &&
                      (!accountsStore || accountsStore.length === 0)
                        ? "Loading..."
                        : "Refresh"}
                    </Button>
                  </div>

                  {isLoadingStore &&
                  (!accountsStore || accountsStore.length === 0) ? (
                    <div className="py-12 text-center">
                      <div className="inline-block h-8 w-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Loading your profiles...</p>
                    </div>
                  ) : accountsStore && accountsStore.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      <AccountsList
                        accountsAvailable={{
                          items: accountsStore.map((acc) => ({
                            account: acc.account,
                            addedAt: acc.addedAt,
                          })),
                          pageInfo: { next: null, prev: null },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="text-gray-400 mb-3">
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
                            strokeWidth={1.5}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-2">No profiles found</p>
                      <p className="text-sm text-gray-400">
                        Create a new profile or connect a different wallet
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wallet Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 ">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="">
                    <p className="text-sm text-gray-500">Wallet Connected</p>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {truncateAddress(address as string)}
                    </p>
                  </div>
                </div>
                <DisconnectWalletButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-green-600 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to create and manage your Lens profiles
            </p>
            <div className="flex justify-center">
              <AccountButton className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors" />
            </div>
            <p className="mt-4 text-xs text-gray-400">
              New to Web3? You'll need a blockchain wallet to continue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
