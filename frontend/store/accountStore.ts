import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Account,
  AccountManaged,
  AccountOwned,
  AccountState,
} from "@/app/types";
import { getAvailableAccounts } from "@/lib/lens";

// Create the account store with Zustand and persist middleware for localStorage
export const useAccountStore = create(
  persist<AccountState>(
    (set, get) => ({
      // State
      selectedAccount: null,
      accounts: [],
      isLoading: false,
      error: null,

      // Actions
      setSelectedAccount: (account: Account | null) =>
        set({ selectedAccount: account }),
      setAccounts: (accounts: (AccountManaged | AccountOwned)[]) =>
        set({ accounts }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      // Computed values
      hasAccounts: () => get().accounts.length > 0,
      getFirstAccount: () =>
        get().accounts.length > 0 ? get().accounts[0].account : null,

      // Async actions (thunks)
      fetchAccounts: async (
        address: string
      ): Promise<(AccountManaged | AccountOwned)[]> => {
        if (!address) return [];

        try {
          // Add a small delay to ensure the loading state is visible
          await new Promise((resolve) => setTimeout(resolve, 500));

          const result = await getAvailableAccounts(address);

          // Transform the items to include the required addedAt property
          const transformedAccounts = (result.items || []).map((item) => ({
            account: item.account,
            addedAt: new Date().toISOString(), // Add the required addedAt property
          })) as (AccountManaged | AccountOwned)[];

          // Update accounts in store
          set({
            accounts: transformedAccounts,
          });

          return transformedAccounts;
        } catch (error) {
          // Make sure to set loading to false in case of error
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch accounts",
          });
          return [];
        }
      },

      // Reset store state
      resetStore: () => {
        set({
          selectedAccount: null,
          accounts: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "lens-account-storage", // Name for the storage key
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      },
    }
  )
);
