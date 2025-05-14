// hooks/useClaimData.ts
import { ClaimProof } from '@/app/types';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';


export function useClaimData(userAddress: string | undefined) {
    return useQuery<ClaimProof[] | null, Error>({
        queryKey: ['claim-data', userAddress],
        queryFn: async () => {
            if (!userAddress) return null;

            try {
                const res = await axiosInstance.get(`/api/claims/${userAddress}`);
                return res.data.proofs;
            } catch (error: any) {
                // Optional: You can log or transform the error before throwing
                const message =
                    error.response?.data?.error ||
                    error.message ||
                    'Failed to fetch claim data';

                console.log("Error:", message)
                throw new Error(message);
            }
        },
        enabled: !!userAddress,
    });
}
