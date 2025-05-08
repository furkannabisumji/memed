import { useQuery } from "@apollo/client";
import { TRANSACTION_STATUS_QUERY } from "@/lib/queries";
import { useAuthToken } from "@/hooks/auth"; // Custom hook to get the auth token

export const useTransactionStatusQuery = (txHash: string) => {
  const accessToken = useAuthToken(); // Get the access token using your auth logic

  const { data, loading, error, refetch, stopPolling, startPolling } = useQuery(
    TRANSACTION_STATUS_QUERY,
    {
      variables: { txHash },
      context: {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "", // If token exists, send it as the header
        },
      },
      pollInterval: 5000, // Poll every 5 seconds
      skip: !txHash, // Skip query if txHash is not provided
      notifyOnNetworkStatusChange: true, // Notify when polling is active
    }
  );

  // Stop polling when the transaction is no longer pending
  if (
    data &&
    data.transactionStatus &&
    data.transactionStatus.__typename !== "PendingTransactionStatus"
  ) {
    stopPolling(); // Stop polling if the transaction has moved out of Pending status
  }

  return { data, loading, error, refetch, startPolling, stopPolling };
};
