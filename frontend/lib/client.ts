import { PublicClient, mainnet } from "@lens-protocol/client";

// Create client without passing any custom fragments to avoid duplicate fragment errors
export const client = PublicClient.create({
  environment: mainnet,
  // Don't pass any custom fragments to avoid duplication with built-in fragments
  fragments: [],
});
