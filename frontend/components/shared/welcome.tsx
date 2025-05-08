"use client";
import { useAccount, useWalletClient } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery } from "@apollo/client";
import {
  CHALLENGE_MUTATION,
  CREATE_ACCOUNT_MUTATION,
  AUTHENTICATE_MUTATION,
  ACCOUNT_QUERY,
  SWITCH_ACCOUNT_MUTATION,
  ACCOUNTS_AVAILABLE_QUERY,
} from "@/lib/queries";
import { uploadAsJson } from "@/lib/storage-client";
import ImageUploader from "./ImageUploader";

import { useTransactionStatusQuery } from "@/hooks/useTransactionStatusQuery"; // Import the hook

import { ConnectButton } from "./ConnectButton";
import { Button } from "../ui/button";
import { DisconnectWalletButton } from "./DisconnectWalletButton";
import { AccountsList } from "./AccountList";
import { Input } from "../ui/input";
// Import the Apollo client for GraphQL operations
import { useApolloClient } from "@apollo/client";
import { signMessageWith } from "@/lib/lens";

import { toast } from "sonner";

export function Welcome() {
  const { isConnected, address, isConnecting } = useAccount();
  const [image, setImage] = useState<string | null>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const [challenge] = useMutation(CHALLENGE_MUTATION);
  const [createAccountWithUsername] = useMutation(CREATE_ACCOUNT_MUTATION);
  const [authenticate] = useMutation(AUTHENTICATE_MUTATION);
  const [switchAccount] = useMutation(SWITCH_ACCOUNT_MUTATION);
  const [txHash, setTxHash] = useState<string>("");

  // Get the wallet client (this is similar to a signer)
  const { data: walletClient } = useWalletClient();

  // Query transaction status using the txHash
  const {
    data: txStatusData,
    loading: txStatusLoading,
    error: txStatusError,
  } = useTransactionStatusQuery(txHash);

  // Query account info using txHash (new query)
  const {
    data: accountData,
    loading: accountLoading,
    error: accountError,
    refetch, // Expose refetch for manual querying
    stopPolling, // Allows stopping polling when condition is met
  } = useQuery(ACCOUNT_QUERY, {
    skip: !txHash, // Only run the query when txHash is available
    variables: {
      request: {
        txHash: txHash,
      },
    },
    pollInterval: 5000, // Poll every 5 seconds
    notifyOnNetworkStatusChange: true, // Notify when polling
  });

  //query available accounts
  const {
    data: accountsAvailable,
    loading: loadingAvailableAcc,
    refetch: refetchAccts,
  } = useQuery(ACCOUNTS_AVAILABLE_QUERY, {
    variables: { managedBy: address, includeOwned: true },
    skip: !address,
  });

  // Auto-refresh accounts after creation to check for metadata indexing
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  // Function to periodically refresh accounts data
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshing) return;

    setAutoRefreshing(true);
    let refreshCount = 0;
    const maxRefreshes = 5; // Maximum number of refreshes

    const refreshInterval = setInterval(async () => {
      console.log(
        `Auto-refreshing accounts data (${refreshCount + 1}/${maxRefreshes})`
      );
      await refetchAccts();
      refreshCount++;

      if (refreshCount >= maxRefreshes) {
        clearInterval(refreshInterval);
        setAutoRefreshing(false);
      }
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(refreshInterval);
      setAutoRefreshing(false);
    };
  }, [refetchAccts, autoRefreshing]);

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
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        valid: false,
        reason: "Username can only contain letters, numbers, and underscores",
      };
    }

    // Check if it starts with a letter or number (not underscore)
    if (!/^[a-zA-Z0-9]/.test(username)) {
      return {
        valid: false,
        reason: "Username must start with a letter or number",
      };
    }

    return { valid: true };
  };

  const handleChallengeMutation = async () => {
    if (!address || !image || !localName) {
      toast.error(
        "Please connect your wallet, upload an image, and choose a username",
        {
          description: "Missing information",
        }
      );
      return;
    }

    // Validate username before proceeding
    const validation = validateUsername(localName);
    if (!validation.valid) {
      toast.error(validation.reason, {
        description: "Invalid username",
      });
      return;
    }

    if (!walletClient) {
      console.error("Wallet client not available");
      return;
    }

    setIsGenerating(true);
    try {
      // Step 1: Get a challenge from the Lens API
      const { data: challengeData } = await challenge({
        variables: {
          request: {
            onboardingUser: {
              wallet: address,
              app: process.env.NEXT_PUBLIC_APP_ADDRESS,
            },
          },
        },
      });

      if (!challengeData?.challenge?.text) {
        toast.error("Challenge data is missing");
        throw new Error("Challenge data is missing");
      }

      // Step 2: Sign the challenge with the wallet
      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message: challengeData.challenge.text,
      });

      // Step 3: Authenticate with the signed challenge
      const authResponse = await authenticate({
        variables: { request: { id: challengeData.challenge.id, signature } },
      });

      const { accessToken } = authResponse?.data?.authenticate || {};

      if (!accessToken) {
        toast.error("No access token received", {
          description: "Authentication failed",
        });
        throw new Error("Authentication failed: no access token received");
      }

      console.log("Successfully authenticated with Lens");
      toast.success("Successfully authenticated with Lens Protocol", {
        description: "Authentication successful",
      });

      // Step 4: Create metadata for the profile and upload to IPFS
      // Use a simple metadata format that matches Lens Protocol requirements
      const profileMetadata = {
        name: localName,
        bio: `${localName}'s profile`,
        picture: image
          ? `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${image}`
          : null,
        // Include basic attributes without any custom fields
        attributes: [
          {
            key: "created_by",
            value: "memed_app",
            type: "string",
          },
        ],
        // Remove version field as it's not supported by the API
      };

      // Upload the metadata to IPFS using lighthouse
      const uploadingToast = toast.loading(
        "Uploading your profile metadata to IPFS...",
        {
          description: "Uploading profile data",
        }
      );

      const { Hash } = await uploadAsJson(profileMetadata);
      // Make sure the URI is correctly formatted with https://
      const metadataUri = `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${Hash}`;
      console.log("Metadata URI:", metadataUri);

      // Verify the metadata is accessible by fetching it
      try {
        const metadataResponse = await fetch(metadataUri);
        if (!metadataResponse.ok) {
          console.error(
            "Metadata verification failed",
            await metadataResponse.text()
          );
          toast.error("Failed to verify metadata accessibility");
        } else {
          const metadataJson = await metadataResponse.json();
          console.log("Metadata verified:", metadataJson);
          // Log each field to help with debugging
          console.log("Name:", metadataJson.name);
          console.log("Bio:", metadataJson.bio);
          console.log("Picture:", metadataJson.picture);
          console.log("Attributes:", metadataJson.attributes);
          console.log("Version:", metadataJson.version);
        }
      } catch (error) {
        console.error("Error verifying metadata:", error);
      }

      toast.dismiss(uploadingToast);
      toast.success("Your profile metadata has been uploaded to IPFS", {
        description: "Profile data uploaded",
      });

      // Log the request for debugging
      console.log("Creating account with request:", {
        username: { localName },
        metadataUri: metadataUri,
        accountManager: address,
        enableSignless: true,
        owner: address,
      });

      // Step 5: Create account with username using the metadataUri
      const creatingToast = toast.loading(
        "This may take a minute. Please wait and sign any requested transactions.",
        {
          description: "Creating your profile",
        }
      );

      const result = await createAccountWithUsername({
        variables: {
          request: {
            username: { localName }, // Username should be an object with localName property
            metadataUri: metadataUri,
            accountManager: address, // Set the current address as the account manager
            enableSignless: true, // Enable signless transactions
            owner: address, // Set the current address as the owner
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }).catch((error) => {
        console.error("Detailed create account error:", error);
        throw error; // Re-throw to be caught by the outer catch block
      });

      // Log the full response
      console.log("Create account response:", result);
      console.log(
        "Create account result data:",
        JSON.stringify(result?.data, null, 2)
      );

      const createAccountResult = result?.data?.createAccountWithUsername;
      console.log(
        "Create account result type:",
        createAccountResult?.__typename
      );

      if (
        createAccountResult?.__typename === "NamespaceOperationValidationFailed"
      ) {
        // Handle the specific validation error
        const errorReason =
          createAccountResult.reason || "Unknown validation error";
        console.error("Username validation failed:", errorReason);

        // Parse the error message to provide more specific feedback
        let userFriendlyMessage = errorReason;

        // Check for common error patterns
        if (
          errorReason.includes("already taken") ||
          errorReason.includes("already exists")
        ) {
          userFriendlyMessage =
            "This username is already taken. Please try a different one.";
        } else if (errorReason.includes("Not all rules satisfied")) {
          userFriendlyMessage = `Your username doesn't meet all Lens Protocol requirements. Try a different username that:
            - Is between 5-31 characters
            - Contains only letters, numbers, and underscores
            - Starts and ends with a letter or number
            - Has no consecutive underscores
            - Doesn't contain reserved words like 'lens', 'admin', etc.`;
        }

        toast.dismiss(creatingToast);
        toast.error(userFriendlyMessage, {
          description: "Username validation failed",
          duration: 10000, // Show for longer so user can read the guidelines
        });

        setIsGenerating(false);
        return;
      } else if (createAccountResult?.__typename === "TransactionWillFail") {
        // Handle transaction will fail error
        const errorReason =
          createAccountResult.reason || "Unknown transaction error";
        console.error("Transaction will fail:", errorReason);

        toast.dismiss(creatingToast);
        toast.error(`Transaction would fail: ${errorReason}`, {
          description: "Account creation failed",
          duration: 5000,
        });

        setIsGenerating(false);
        return;
      }

      const txHash = createAccountResult?.txHash;
      if (!txHash) {
        console.error(
          "Account creation failed - No hash returned",
          JSON.stringify(result?.data, null, 2)
        );

        // Provide more specific error message based on the response
        let errorMessage = "Please try again with a different username.";

        // Check if there's any error information in the response
        if (
          createAccountResult &&
          Object.keys(createAccountResult).length > 0
        ) {
          errorMessage = `Error: ${JSON.stringify(createAccountResult)}`;
        }

        toast.dismiss(creatingToast);
        toast.error(errorMessage, {
          description: "Account creation failed",
          duration: 5000,
        });

        setIsGenerating(false);
        return;
      }
      
      // Clear input fields after successful account creation
      setLocalName("");
      setImage(null);

      toast.dismiss(creatingToast);
      toast.success(
        "Your new Lens profile has been created. It may take a few minutes for your profile picture to appear.",
        {
          description: "Profile created successfully!",
        }
      );

      // Refresh accounts data to show the new account
      await refetchAccts();

      // Start auto-refreshing to check for metadata indexing
      startAutoRefresh();

      // Reset the generating state
      setIsGenerating(false);
    } catch (err) {
      console.error("Error during mutation flow:", err);
      // Dismiss any loading toasts that might be active
      toast.dismiss();
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred",
        {
          description: "Error creating profile",
        }
      );
      setIsGenerating(false);
    }
  };

  const handleSwitchAccount = async (account: string) => {
    if (!account) {
      console.error("Account address is required to switch.");
      return;
    }

    //authenticate as accountOwner
    const { data: challengeData } = await challenge({
      variables: {
        request: {
          accountOwner: {
            app: process.env.NEXT_PUBLIC_APP_ADDRESS,
            account,
            owner: address,
          },
        },
      },
    });

    if (!challengeData?.challenge?.text) {
      throw new Error("Challenge data is missing");
    }

    const signature = await walletClient?.signMessage({
      account: address as `0x${string}`,
      message: challengeData.challenge.text,
    });

    // Authenticate and get access token
    const authResponse = await authenticate({
      variables: { request: { id: challengeData.challenge.id, signature } },
    });
    console.log(authResponse);
    const { accessToken, refereshToken, idToken } =
      authResponse?.data?.authenticate || {};

    try {
      const response = await switchAccount({
        variables: {
          request: {
            account: account, // Use the destructured address here
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Refresh-Token": refereshToken,
            "X-ID-Token": idToken,
          },
        },
      });

      if (response.data.switchAccount.__typename === "AuthenticationTokens") {
        console.log("Tokens received:", response.data.switchAccount);
      } else if (response.data.switchAccount.__typename === "ForbiddenError") {
        console.error(
          "Switch account failed:",
          response.data.switchAccount.reason
        );
      }
    } catch (err) {
      console.error("Error switching account:", err);
    } finally {
      refetchAccts();
      setIsGenerating(false);
    }
  };

  const handleAction = async () => {
    if (walletClient && isConnected) {
      // Use the wallet client to sign a transaction or message
      const signature = await walletClient.signMessage({
        message: "Hello World",
      });
      console.log("Signature:", signature);
    }
  };

  // Get the Apollo client instance from the context
  const apolloClient = useApolloClient();

  // Function to check and verify metadata indexing
  const checkMetadataIndexing = async (
    accountAddress: string
  ): Promise<boolean> => {
    if (!accountAddress) return false;

    try {
      // Use Apollo client to query the account
      const { data } = await apolloClient.query({
        query: ACCOUNT_QUERY,
        variables: {
          request: {
            address: accountAddress,
          },
        },
        fetchPolicy: "network-only", // Bypass cache to get fresh data
      });

      console.log("Metadata indexing check:", data?.account?.metadata);

      // If metadata exists and has a picture or attributes, it's likely indexed
      if (
        data?.account?.metadata &&
        (data.account.metadata.picture ||
          (data.account.metadata.attributes &&
            data.account.metadata.attributes.length > 0))
      ) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking metadata indexing:", error);
      return false;
    }
  };

  useEffect(() => {
    if (
      accountData &&
      accountData.account &&
      txStatusData &&
      txStatusData.transactionStatus.__typename === "FinishedTransactionStatus"
    ) {
      const { address, createdAt, metadata, owner, username } =
        accountData.account;

      // Check if username exists and destructure safely
      const { localName } = username || {}; // Fallback to an empty object if username is null or undefined

      console.log("Account Address:", address);
      console.log("Created At:", createdAt);
      console.log("Metadata:", metadata);
      console.log("Owner Address:", owner);
      console.log("Username:", localName);

      // Even if metadata is null, we should switch to the account
      // The metadata might be indexed later
      handleSwitchAccount(address);

      // Start checking for metadata indexing
      let indexingChecks = 0;
      const maxChecks = 10; // Increase the number of checks
      const indexingInterval = setInterval(async () => {
        indexingChecks++;
        console.log(
          `Checking metadata indexing (${indexingChecks}/${maxChecks})...`
        );

        // Force refetch accounts to check for updated metadata
        await refetchAccts();

        const isIndexed = await checkMetadataIndexing(address);
        if (isIndexed) {
          console.log("Metadata is now indexed!");
          clearInterval(indexingInterval);
          refetchAccts(); // Refresh the accounts list to show updated metadata
          toast.success("Profile metadata has been indexed!", {
            description: "Your profile picture and details are now visible",
          });
        } else if (indexingChecks >= maxChecks) {
          console.log("Metadata indexing checks completed without success");
          clearInterval(indexingInterval);
          toast.error("Metadata indexing is taking longer than expected", {
            description:
              "Your profile may take some time to display correctly. Try refreshing the page in a few minutes.",
          });
          // Try one final refresh
          refetchAccts();
        }
      }, 10000); // Check more frequently (every 10 seconds)

      stopPolling(); // Stop polling for transaction status

      return () => {
        clearInterval(indexingInterval);
      };
    }
  }, [accountData, txStatusData, stopPolling, address]);

  if (!isConnected && !isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center relative">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mb-8 border border-gray-100">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              Welcome to Lens Memed
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Connect your wallet to create or manage your Lens Protocol
              profiles.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Create a new Lens profile with a custom username
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Manage your existing Lens profiles
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Switch between profiles with a single click
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center ">
              <ConnectButton />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 max-w-md">
          <p>
            Make sure you have a compatible wallet installed like MetaMask or
            Coinbase Wallet.
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
    <div className="flex flex-col items-center justify-center h-screen">
      {isConnected ? (
        <>
          <ImageUploader image={image} setImage={setImage} />
          <div className="w-full max-w-sm flex flex-col gap-4 py-5">
            {/* Create Profile Section */}
            <div className="border border-gray-200 rounded-lg p-4 mb-2">
              <h2 className="text-lg font-semibold mb-3">Create New Profile</h2>
              <div className="h-12 flex items-center w-full mb-2">
                <Input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  disabled={isGenerating}
                  placeholder="Choose username"
                  className="bg-background h-full w-full outline-none"
                />
              </div>
              <Button
                onClick={handleChallengeMutation}
                disabled={isGenerating}
                className="w-full h-12 font-semibold cursor-pointer"
              >
                {isGenerating ? "Generating..." : "Get a profile"}
              </Button>
            </div>
            
            {/* Existing Accounts Section */}
            <div className="border border-gray-200 rounded-lg p-4">
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
              ) : accountsAvailable?.accountsAvailable?.items?.length > 0 ? (
                <AccountsList
                  accountsAvailable={accountsAvailable.accountsAvailable}
                />
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No profiles found. Create one above or connect a different wallet.
                </div>
              )}
            </div>
            <DisconnectWalletButton className="mt-4" />
          </div>
        </>
      ) : (
        <div className="text-center py-8 border border-gray-200 rounded-lg p-6 mb-4 w-full max-w-sm">
          <div className="text-amber-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Wallet Not Connected</h3>
          <p className="text-gray-600 mb-4">Please connect your wallet to create or manage Lens profiles.</p>
          <ConnectButton />
        </div>
      )}

    </div>
  );
}
