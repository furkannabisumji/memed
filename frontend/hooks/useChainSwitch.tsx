import { useAccount, useSwitchChain } from "wagmi";

import { chains } from "@lens-chain/sdk/viem";
export enum TransactionType {
  /**
   * Indicates that the transaction is an account creation transaction.
   */
  accountCreation = "ACCOUNT_CREATION",

  /**
   * Indicates that the transaction is an onchain transaction.
   */
  onchainTransaction = "ONCHAIN_TRANSACTION",
}

/**
 * Hook to easily switch between mainnet and testnet chains.
 *
 * @returns {Object} An object with the current chain and a function to switch to the other chain.
 *                   The function takes an optional parameter `transactionType` which can be
 *                   either `TransactionType.accountCreation` or `TransactionType.onchainTransaction`.
 *                   If `transactionType` is `TransactionType.accountCreation` and the current chain
 *                   is not mainnet, the function will switch to mainnet. If `transactionType` is
 *                   `TransactionType.onchainTransaction` or is not provided and the current chain
 *                   is mainnet, the function will switch to testnet.
 */
export const useChainSwitch = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  /**
   * Switches to the other chain based on the current chain and the provided `transactionType`.
   *
   * @param {TransactionType} [transactionType] The type of the transaction.
   */
  const switchToChain = (transactionType?: TransactionType) => {
    if (
      transactionType === TransactionType.accountCreation &&
      chain?.id !== chains.mainnet.id
    ) {
      switchChain({ chainId: chains.mainnet.id });
    } else if (
      (transactionType !== TransactionType.accountCreation ||
        !transactionType) &&
      chain?.id === chains.mainnet.id
    ) {
      switchChain({ chainId: chains.testnet.id });
    }
  };

  return { chain, switchToChain };
};
