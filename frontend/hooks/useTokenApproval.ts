import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { erc20Abi, type Address } from "viem";
import { useCallback, useEffect, useState } from "react";
import CONTRACTS from "@/config/contracts";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/providers/Web3Provider";

interface UseTokenApprovalProps {
  tokenAddress: string;
  spenderAddress?: string;
  amount: bigint;
  enabled?: boolean;
}

export function useTokenApproval({
  tokenAddress,
  spenderAddress = CONTRACTS.memedStaking,
  amount,
  enabled = true,
}: UseTokenApprovalProps) {
  const { address } = useAccount();
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(false);

  // Read current allowance
  const {
    data: allowance,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as Address, spenderAddress as Address],
    query: {
      enabled: !!address && !!tokenAddress && !!spenderAddress && enabled,
    },
  });

  // Check if approval is needed
  useEffect(() => {
    const checkApproval = async () => {
      if (allowance !== undefined && amount) {
        setIsCheckingApproval(true);
        setNeedsApproval(allowance < amount);
        setIsCheckingApproval(false);
      }
    };

    checkApproval();
  }, [allowance, amount]);

  // Write approval
  const {
    writeContractAsync: approveAsync,
    isPending: isApproving,
    error: approvalError,
  } = useWriteContract();

  const approve = useCallback(async () => {
    if (!tokenAddress || !spenderAddress) {
      throw new Error("Token or spender address not provided");
    }

    try {
      // Send the approval transaction
      const hash = await approveAsync({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress as Address, amount],
      });

      // Wait for the transaction to be mined
      const receipt = await waitForTransactionReceipt(config, { hash });
      
      if (receipt.status !== 'success') {
        throw new Error("Approval transaction failed");
      }

      // Update the allowance after successful approval
      await refetchAllowance();
      
      return hash;
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  }, [tokenAddress, spenderAddress, amount, approveAsync, refetchAllowance]);

  return {
    needsApproval,
    isCheckingApproval: isCheckingApproval || isLoadingAllowance,
    isApproving,
    approvalError,
    approve,
    refetchAllowance,
  };
}
