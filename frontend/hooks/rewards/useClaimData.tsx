// hooks/useClaimData.ts
import { ClaimProof } from '@/app/types';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';


export function useClaimData(userAddress: string | undefined) {
    return useQuery<ClaimProof[] | null, AxiosError>({
        queryKey: ['claim-data', userAddress],
        queryFn: async () => {
            if (!userAddress) return null;
            try {
                const res = await axiosInstance.get(`/api/claims/${userAddress}`);
                return res.data.rewards;
            
            } catch (error: any) {

                const axiosErr = error as AxiosError<{ error?: string }>;
                console.log(axiosErr)
                const message =
                    axiosErr?.response?.data?.error || axiosErr?.message || "Failed to fetch Claims";
                
                    throw new Error(message);
            }
        },
        enabled: !!userAddress,
    });
}

