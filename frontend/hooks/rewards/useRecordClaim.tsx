// hooks/useClaimData.ts
import axiosInstance from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface mutationArgs {
    userAddress: string,
    tokenAddress: string,
    amount: string,
    transactionHash: string
}
interface Response {
    message: string;
    userAddress: string,
    tokenAddress: string,
    amount: string,
    transactionHash: string
}
export function useRecordClaim() {
    return useMutation<Response | null, Error, mutationArgs>({
        mutationKey: ['record-claim'],
        mutationFn: ({ userAddress, tokenAddress, amount, transactionHash }) => {
            const body = {
                userAddress,
                tokenAddress,
                amount,
                transactionHash
            }

            return axiosInstance.post(`/claims/record`, body)
                .then((res) => res.data)
                .catch((error) => {
                    const axiosErr = error as AxiosError<{ message?: string }>;
                    const message =
                        axiosErr.response?.data?.message || axiosErr.message || "Upload failed";


                    throw new Error(message);
                })
        },
    });
}

