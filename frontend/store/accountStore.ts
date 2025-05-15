import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Account,
  AccountManaged,
  AccountOwned,
  AccountState,
} from "@/app/types";
import { getAvailableAccounts } from "@/lib/lens";

// Define the store state type
interface AccountStoreState {
  // State
  selectedAccount: Account | null;
  accounts: (AccountManaged | AccountOwned)[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedAccount: (account: Account | null) => void;
  setAccounts: (accounts: (AccountManaged | AccountOwned)[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed values
  hasAccounts: () => boolean;
  getFirstAccount: () => Account | null;

  // Async actions
  fetchAccounts: (
    address: string
  ) => Promise<(AccountManaged | AccountOwned)[]>;

  // Reset store
  resetStore: () => void;
}

// Initial state object
const initialState = {
  selectedAccount: null,
  accounts: [],
  isLoading: false,
  error: null,
};

// Create the account store with Zustand and persist middleware for localStorage
export const useAccountStore = create<AccountStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

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
          set({ isLoading: true, error: null });

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
            isLoading: false,
          });

          return transformedAccounts;
        } catch (error) {
          // Make sure to set loading to false in case of error
          set({
            isLoading: false,
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
        // Use correct approach for clearing persisted state
        set((state) => ({
          ...state,
          selectedAccount: null,
          accounts: [],
          isLoading: false,
          error: null,
        }));

        // If needed, manually clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("lens-account-storage");
        }
      },
    }),
    {
      name: "lens-account-storage", // Name for the storage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        selectedAccount: state.selectedAccount,
        accounts: state.accounts,
        // Exclude transient state like isLoading and error
      }),
    }
  )
);
