import { FragmentOf, MediaImageFragment } from "@lens-protocol/client";

import { AccountFragment, AccountMetadataFragment } from "./accounts";

import { PostMetadataFragment } from "./posts";

declare module "@lens-protocol/client" {
  export interface Account extends FragmentOf<typeof AccountFragment> {}
  export interface AccountMetadata
    extends FragmentOf<typeof AccountMetadataFragment> {}
  export interface MediaImage extends FragmentOf<typeof MediaImageFragment> {}
  export type PostMetadata = FragmentOf<typeof PostMetadataFragment>;
}

export const fragments = [
  AccountFragment,
  PostMetadataFragment,
  // MediaImageFragment is removed to avoid duplication with @lens-protocol/client
];
