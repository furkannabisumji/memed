import { Address } from "viem";

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
    picture:
    | string
    | {
      original?: { url: string };
      optimized?: { url: string };
      uri?: string;
    };
    coverPicture?:
    | string
    | {
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

export interface ClaimProof {
  _id: string;
  ticker: string;
  airdrop: {
    _id:string,
    index: number,
  }
  tokenAddress: string;
  handle: string;
  amount: string;
  proof: string[];
  leaf: string;
  index: number;
  type: string;

  createdAt: string;
  transactionHash: string;
  userAddress: string
}

export interface MemeDetails extends ClaimProof {
  name: string;
  description: string;
  image: string;
  handle: string;
  ticker:string
}

export interface Meme {
  _id: string;
  handle: string;
  tokenAddress: string;
  name?: string;
  ticker?: string;
  description?: string;
  image?: string;
  creator?: string;
  followers?: string[];
  lastRewardDistribution: string;
  totalDistributed: string;
  createdAt: string;
  likesCount: number;
  __v?: number;
}

export type TokenData = {
  token: Address;
  creator: Address;
  name: string;
  ticker: string;
  description: string;
  image: string;
  lensUsername: string;
  heat: bigint;
  lastRewardAt: bigint;
  createdAt: bigint;
};

export interface TokenStats {
  upvotes: number;
  reposts: number;
  bookmarks: number;
  collects: number;
  comments: number;
  quotes: number;
  totalEngagements: number;
  engagementRate: number;
}

export interface MemeBattle {
  battleId: bigint
  endTime: bigint
  memeA: `0x${string}`
  memeB: `0x${string}`
  resolved: boolean
  startTime: bigint
  winner: `0x${string}`
}
