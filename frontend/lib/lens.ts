import { evmAddress, URI } from "@lens-protocol/client";
import {
  fetchAccount,
  fetchAccounts,
  fetchAccountsAvailable,
  createAccountWithUsername,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { client } from "./client";
import { WalletClient } from "viem";
import { MetadataAttributeType, account } from "@lens-protocol/metadata";
import lighthouse from "@lighthouse-web3/sdk";
import { Account } from "@/app/types";

// Fetch a single account by address
export const getAccountByAddress = async (address: string) => {
  if (!address) {
    return null;
  }
  const result = await fetchAccount(client, {
    address: evmAddress(address),
  });
  if (result.isErr()) {
    console.error(result.error);
    return null;
  }

  return result.value;
};

// Fetch a single account by username
export const getAccountByUsername = async (username: string) => {
  if (!username) {
    return null;
  }
  const result = await fetchAccount(client, {
    username: { localName: username },
  });
  if (result.isErr()) {
    console.error(result.error);
    return null;
  }

  return result.value;
};

// Fetch all available accounts for an address
export const getAvailableAccounts = async (address: string) => {
  if (!address) {
    return { items: [] };
  }
  try {
    const result = await fetchAccountsAvailable(client, {
      managedBy: evmAddress(address),
      includeOwned: true,
    });

    if (result.isErr()) {
      console.error("Error fetching accounts:", result.error);
      return { items: [] };
    }

    // console.log("Lens SDK accounts result:", result);

    // Ensure we return a consistent format regardless of the API response structure
    type AccountItem = { account: Account };
    let accountItems: AccountItem[] = [];

    if (Array.isArray(result.value)) {
      // Handle array response
      accountItems = result.value.map((account: Account) => ({
        account: account,
      }));
    } else if (result.value && typeof result.value === "object") {
      if ("items" in result.value && Array.isArray(result.value.items)) {
        // Handle paginated response
        accountItems = result.value.items.map((item: AccountItem) => ({
          account: item.account,
        }));
      } else {
        // Handle single object response
        // Use unknown as an intermediate step for type safety
        const singleAccount = result.value as unknown;
        // Check if it has the expected structure before casting
        if (
          singleAccount &&
          typeof singleAccount === "object" &&
          "address" in singleAccount
        ) {
          accountItems = [{ account: singleAccount as Account }];
        } else {
          console.warn("Received unexpected account format:", singleAccount);
          accountItems = [];
        }
      }
    }

    // console.log("Formatted account items:", accountItems);
    return { items: accountItems };
  } catch (error) {
    console.error("Exception fetching accounts:", error);
    return { items: [] };
  }
};

// Helper function to upload JSON to IPFS using Lighthouse
export const uploadToIPFS = async (data: any) => {
  try {
    // Convert the data to a Blob and then to a File
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], "metadata.json", {
      type: "application/json",
    });

    // Upload to Lighthouse
    const { data: uploadResponse } = await lighthouse.upload(
      [file],
      process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY as string
    );

    console.log(
      "Successfully uploaded metadata to IPFS via Lighthouse:",
      uploadResponse
    );
    return { Hash: uploadResponse.Hash };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(
      "Failed to upload to IPFS: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

// Create profile metadata for Lens Protocol
export const createProfileMetadata = ({
  localName,
  image,
  bio,
  appId = "lens_memed",
}: {
  localName: string;
  image?: string | null;
  bio?: string;
  appId?: string;
}) => {
  return account({
    name: localName,
    bio: bio || `${localName}'s profile`,
    picture: image
      ? `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY || "https://ipfs.io/ipfs/"
      }${image}`
      : undefined,
    attributes: [
      {
        key: "created_by",
        type: MetadataAttributeType.STRING,
        value: "memed_app",
      },
      {
        key: "app_id",
        type: MetadataAttributeType.STRING,
        value: appId,
      },
      {
        key: "created_at",
        type: MetadataAttributeType.DATE,
        value: new Date().toISOString(),
      },
      {
        key: "settings",
        type: MetadataAttributeType.JSON,
        value: '{"theme": "light"}',
      },
    ],
  });
};

// Create a new account with username
export const createNewAccount = async ({
  localName,
  metadataUri,
  address,
  walletClient,
  signFn,
}: {
  localName: string;
  metadataUri: string;
  address: string;
  walletClient: WalletClient;
  signFn: (message: string) => Promise<string>;
}) => {
  // First login to get an authenticated client
  const authenticated = await client.login({
    onboardingUser: {
      app: process.env.NEXT_PUBLIC_APP_ADDRESS || "",
      wallet: address,
    },
    signMessage: signFn,
  });

  if (authenticated.isErr()) {
    console.error("Login failed:", authenticated.error);
    throw new Error(`Login failed: ${authenticated.error.message}`);
  }

  const sessionClient = authenticated.value;

  // Create the account with the authenticated client
  const createResult = await createAccountWithUsername(sessionClient, {
    username: { localName },
    metadataUri: metadataUri,
    enableSignless: true,
  })
    .andThen(handleOperationWith(walletClient))
    .andThen(sessionClient.waitForTransaction);

  // Check if account creation was successful
  if (createResult.isErr()) {
    console.error("Account creation failed:", createResult.error);
    throw new Error(`Account creation failed: ${createResult.error.message}`);
  }

  // Get the transaction hash from the successful result
  const txHash = createResult.value;
  console.log("Account creation successful with txHash:", txHash);

  // Try to fetch the newly created account
  const accountResult = await fetchAccount(sessionClient, { txHash });

  if (accountResult.isErr()) {
    console.error("Error fetching newly created account:", accountResult.error);
    // Return the transaction hash since the account was created but we couldn't fetch it
    return txHash;
  }

  const account = accountResult.value;
  if (!account) {
    console.error("Account not found after creation");
    // Return the transaction hash since the account was created but not found
    return txHash;
  }

  // Try to automatically switch to the newly created account
  try {
    const switchResult = await sessionClient.switchAccount({
      account: account.address,
    });

    if (switchResult.isErr()) {
      console.error("Error switching to new account:", switchResult.error);
      // Return the account even if switching failed
      return account;
    }

    console.log("Successfully switched to new account:", account.address);
    return account;
  } catch (error) {
    console.error("Exception when switching to new account:", error);
    // Return the account even if switching failed
    return account;
  }
};

// Switch to a different account
// export const switchToAccount = async ({
//   profileId,
//   address,
//   signFn,
// }: {
//   profileId: string;
//   address: string;
//   signFn: (message: string) => Promise<string>;
// }) => {
//   // First login to get an authenticated client
//   const authenticated = await client.login({
//     accountOwner: {
//       account: evmAddress(address),
//       app: process.env.NEXT_PUBLIC_APP_ADDRESS || "",
//       owner: address,
//     },
//     signMessage: signFn,
//   });

//   if (authenticated.isErr()) {
//     console.error("Login failed:", authenticated.error);
//     throw new Error(`Login failed: ${authenticated.error.message}`);
//   }

//   const sessionClient = authenticated.value;

//   // Switch to the selected account
//   const result = await sessionClient.switchAccount({
//     account: profileId,
//   });

//   if (result.isErr()) {
//     console.error("Account switch failed:", result.error);
//     throw new Error(`Account switch failed: ${result.error.message}`);
//   }

//   return result.value;
// };

// export async function signMessageWith(message: string, address: string) {
//   try {
//     // First try using the window.__WAGMI_CONFIG if available (ConnectKit integration)
//     const wagmiConfig = (window as any).__WAGMI_CONFIG;
//     if (wagmiConfig && wagmiConfig.signMessage) {
//       try {
//         // Add a small delay to ensure any ConnectKit modals are fully rendered
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         return await wagmiConfig.signMessage({ message, account: address });
//       } catch (wagmiError) {
//         console.warn(
//           "Failed to sign with Wagmi config, falling back to ethereum provider:",
//           wagmiError
//         );
//         // Fall through to the ethereum provider method
//       }
//     }

//     // Fallback to using the window.ethereum provider directly
//     const ethereum = (window as any).ethereum;
//     if (!ethereum) {
//       throw new Error("No ethereum provider found");
//     }

//     // Try to ensure the account is connected before signing
//     await ethereum.request({
//       method: "eth_requestAccounts",
//       params: [],
//     });

//     // Add a small delay to ensure any wallet UI is fully rendered
//     await new Promise((resolve) => setTimeout(resolve, 300));

//     const signature = await ethereum.request({
//       method: "personal_sign",
//       params: [message, address],
//     });

//     return signature;
//   } catch (error) {
//     console.error("Error signing message with lens:", error);
//     throw error;
//   }
// }

