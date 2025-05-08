import { PublicClient, testnet } from "@lens-protocol/client";

// Create client without passing any custom fragments to avoid duplicate fragment errors
export const client = PublicClient.create({
  environment: testnet,
  // Don't pass any custom fragments to avoid duplication with built-in fragments
  fragments: [],
});
