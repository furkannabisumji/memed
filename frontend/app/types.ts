export type Account = {
  address: string;
  owner: string;
  createdAt: string;
  score: number;
  username: {
    localName: string;
  };
  metadata: {
    picture: string;
  };
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
