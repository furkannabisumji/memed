"use client";
import { useAccount, useWalletClient } from "wagmi";
import { useConnectKitSign } from "@/hooks/useConnectKitSign";
import { useState, useEffect, useCallback, useRef } from "react";
import { DisconnectWalletButton } from "./DisconnectWalletButton";
import { AccountsList } from "./AccountList";
import { useCustomToast } from "@/components/ui/custom-toast";
import ImageUploader from "./ImageUploader";
import {
  getAvailableAccounts,
  createNewAccount,
  switchToAccount,
  getAccountByAddress,
  createProfileMetadata,
  uploadToIPFS,
} from "@/lib/lens";
import { ConnectKitButton } from "connectkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Welcome() {
  // Add client-side only rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  const toast = useCustomToast();
  const { isConnected, address, isConnecting } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { signWithConnectKit } = useConnectKitSign();
  const [image, setImage] = useState<string | null>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [accountsAvailable, setAccountsAvailable] = useState<any>(null);
  const [loadingAvailableAcc, setLoadingAvailableAcc] = useState(false);

  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Separate effect for cleanup to avoid dependency issues
  useEffect(() => {
    // This effect doesn't need to do anything on mount
    // Only provide a cleanup function for unmount
    return () => {
      // Dismiss all toasts when component unmounts
      if (toast && toast.dismissAll) {
        toast.dismissAll();
      }
    };
  }, []);

  // Function to fetch available accounts
  const fetchAccounts = useCallback(async () => {
    if (!address) return;

    setLoadingAvailableAcc(true);
    try {
      const accounts = await getAvailableAccounts(address);

      if (accounts && accounts.items) {
        setAccountsAvailable({ accountsAvailable: accounts });
      } else {
        // Set to empty array to avoid UI jerking
        setAccountsAvailable({ accountsAvailable: { items: [] } });
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch your profiles");
      // Set to empty array on error to avoid UI jerking
      setAccountsAvailable({ accountsAvailable: { items: [] } });
    } finally {
      setLoadingAvailableAcc(false);
    }
  }, [address, toast]);

  // Fetch accounts on initial load and when address changes
  // Using a ref to prevent infinite loops
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (address && isConnected && !hasFetchedRef.current) {
      fetchAccounts();
      hasFetchedRef.current = true;
    } else if (!address) {
      // Reset the ref when address changes to null
      hasFetchedRef.current = false;
    }
  }, [address, isConnected]);

  // Function to refresh accounts
  const refetchAccts = async () => {
    await fetchAccounts();
  };

  // Auto-refresh accounts after creation to check for new account
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  // Function to periodically refresh accounts data
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshing || !isClient) return;

    // Dismiss any existing toasts first
    toast.dismissAll();

    setAutoRefreshing(true);
    let refreshCount = 0;
    const maxRefreshes = 12; // Increased maximum number of refreshes (2 minutes total)

    // Use a unique ID for this toast
    const refreshStartId = `auto-refresh-start-${Date.now()}`;
    toast.info("Waiting for your new profile to appear...", {
      id: refreshStartId,
      description: "This may take a minute or two",
      duration: 3000,
    });

    const refreshInterval = setInterval(async () => {
      await refetchAccts();
      refreshCount++;

      if (refreshCount >= maxRefreshes) {
        clearInterval(refreshInterval);
        setAutoRefreshing(false);

        // Dismiss any lingering toasts
        toast.dismissAll();

        // Show a message about the delay if we've reached max refreshes
        // Use a unique ID for this toast
        const refreshCompleteId = `auto-refresh-complete-${Date.now()}`;
        toast.info("Your profile may take longer to appear", {
          id: refreshCompleteId,
          description: "Check back in a few minutes if you don't see it yet",
          duration: 5000,
        });
      }
    }, 10000); // Refresh every 10 seconds (2 minutes total with 12 refreshes)

    return () => {
      clearInterval(refreshInterval);
      setAutoRefreshing(false);
    };
  }, [refetchAccts, autoRefreshing, isClient, toast]);

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

      // Upload the metadata to IPFS
      toast.loading("Uploading your profile metadata to IPFS...", {
        id: uploadingToastId,
        description: "This may take a moment",
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

        // Set the transaction hash for tracking
        if (result && typeof result === "string") {
          setTxHash(result);
          console.log("Account creation transaction hash:", result);
        }

        // Reset form state completely
        resetForm();

        // Reset the file input element directly
        const fileInput = document.getElementById(
          "imageUploadInput"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        toast.dismiss(creatingToastId);
        // Force a new toast with a unique ID to ensure it shows
        const toastId = `success-${Date.now()}`;
        toast.success(
          "Your new Lens profile has been created. It may take a few minutes for your profile picture to appear.",
          {
            id: toastId,
            description: "Transaction submitted successfully",
            duration: 5000,
          }
        );

        // Add a more detailed explanation toast
        setTimeout(() => {
          toast.info("Account creation process", {
            id: `process-info-${Date.now()}`,
            description:
              "Your profile and metadata are being processed on the blockchain. This typically takes 1-2 minutes, but can sometimes take longer.",
            duration: 8000,
          });
        }, 1000);

        // Start auto-refreshing accounts to check for the new account
        startAutoRefresh();
      } catch (error: any) {
        console.error("Error creating account:", error);
        toast.dismiss(creatingToastId);

        // Handle specific error cases
        if (
          error.message?.includes("already taken") ||
          error.message?.includes("already exists")
        ) {
          toast.error(
            "This username is already taken. Please try a different one.",
            {
              description: "Username unavailable",
              duration: 5000,
            }
          );
        } else if (
          error.message?.includes("rules") ||
          error.message?.includes("validation")
        ) {
          toast.error(
            `Your username doesn't meet all Lens Protocol requirements. Try a different username that:
            - Is between 5-31 characters
            - Contains only letters, numbers, and underscores
            - Starts and ends with a letter or number
            - Has no consecutive underscores
            - Doesn't contain reserved words like 'lens', 'admin', etc.`,
            {
              description: "Username validation failed",
              duration: 10000,
            }
          );
        } else {
          toast.error("Failed to create account", {
            description: error.message || "An unexpected error occurred",
            duration: 5000,
          });
        }
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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwitchAccount = async (account: string) => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Show loading toast
      const switchingToastId = `switching-account-${Date.now()}`;
      toast.loading("Switching to selected profile...", {
        id: switchingToastId,
      });

      // Call the SDK function to switch accounts
      const result = await switchToAccount({
        profileId: account,
        address,
        signFn: async (message) => await signWithConnectKit(message),
      });

      // Check if the switch was successful
      if (result) {
        // Dismiss the loading toast and show success
        toast.dismiss(switchingToastId);
        toast.success("Successfully switched to selected profile", {
          description: "Profile switched",
          duration: 3000,
        });
      } else {
        // Handle the case where the switch failed but didn't throw an error
        toast.dismiss(switchingToastId);
        toast.error("Failed to switch profile", {
          description: "Please try again",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error switching account:", error);
      toast.dismiss(`switching-account-${Date.now()}`);
      toast.error("Error switching profile", {
        description: error?.message || "Please try again",
        duration: 3000,
      });
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
                  disabled={loadingAvailableAcc}
                >
                  {loadingAvailableAcc ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {loadingAvailableAcc ? (
                <div className="text-center py-4 text-gray-500">
                  Loading your profiles...
                </div>
              ) : accountsAvailable?.accountsAvailable?.items ? (
                accountsAvailable.accountsAvailable.items.length > 0 ? (
                  <AccountsList
                    accountsAvailable={accountsAvailable.accountsAvailable}
                    onAccountSelected={handleSwitchAccount}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No profiles found. Create one above or connect a different
                    wallet.
                  </div>
                )
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Could not load profiles. Please try refreshing.
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
            <ConnectKitButton />
          </div>
        </div>
      )}
    </div>
  );
}
