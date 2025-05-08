import { evmAddress } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { client } from "./client";
import { WalletClient } from "viem";

export const getUsers = async (address: string) => {
  if (!address) {
    return;
  }
  const result = await fetchAccount(client, {
    address: evmAddress(address),
  });
  if (result.isErr()) {
    return console.error(result.error);
  }

  const account = result.value;

  console.log(account);
};

export const signMessageWith = (walletClient: any, message: string) => {
  if (!walletClient.account?.address) {
    throw new Error("Wallet client is not initialized");
  }
  return walletClient.signMessage({
    account: walletClient.account?.address as `0x${string}`,
    message,
  });
};
