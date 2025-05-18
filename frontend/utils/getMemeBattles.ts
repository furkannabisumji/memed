import { MemeBattle } from "@/app/types";
import { readContract } from '@wagmi/core'

import MemedBattleABI from "@/config/memedBattleABI.json";
import { config } from "@/providers/Web3Provider";
import { Abi } from "viem";
import CONTRACTS from "@/config/contracts";

export const getMemeBattles = async (token: string): Promise<MemeBattle[]> => {
    try {

        if (!token) return [];

        const result: any = await readContract(config, {
            abi: MemedBattleABI as Abi,
            address: CONTRACTS.memedBattle as `0x${string}`,
            functionName: 'getUserBattles',
            args: [token as `0x${string}`],
        })
        return result // this will be a TokenData[] array
    } catch (err) {
        console.error('Error fetching tokens:', err)
        return []
    }
}