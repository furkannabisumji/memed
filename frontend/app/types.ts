export type Account = {
  address: string;
  owner: string;
  createdAt: string;
  score: number;
  username: {
    id?: string;
    value?: string;
    localName: string;
    linkedTo?: string;
    ownedBy?: string;
    timestamp?: string;
    namespace?: string;
  };
  metadata: {
    id?: string;
    bio?: string;
    name?: string;
    picture: string | {
      original?: { url: string };
      optimized?: { url: string };
      uri?: string;
    };
    coverPicture?: string | {
      original?: { url: string };
      optimized?: { url: string };
      uri?: string;
    };
    attributes?: Array<{
      type?: string;
      key?: string;
      value?: string;
    }>;
  };
  operations?: any;
  rules?: any;
  actions?: any[];
};

export type AccountManaged = {
  account: Account;
  addedAt: string;
};

export type AccountOwned = {
  account: Account;
  addedAt: string;
};

export type AccountsAvailableResponse = {
  items: (AccountManaged | AccountOwned)[];
  pageInfo: {
    next: string | null;
    prev: string | null;
  };
};

// Zustand store types
export interface AccountState {
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
  // selectAccount: (account: Account) => void;
  resetStore: () => void;
}
