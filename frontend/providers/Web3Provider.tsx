"use client";

import { WagmiProvider, createConfig, useAccount } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
// import { chains } from "@lens-chain/sdk";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { LensProvider } from "@lens-protocol/react";
import { client } from "@/lib/client";

// Explicitly use the WalletConnect Project ID from environment variables
const walletConnectProjectId = process.env
  .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

export const config = createConfig(
  getDefaultConfig({
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http(chains.mainnet.rpcUrls.default.http[0]!),
      // [chains.testnet.id]: http(chains.testnet.rpcUrls.default.http[0]!),
    },

    walletConnectProjectId, // Use the explicit value
    appName: "Memed.fun",
    appDescription: "Turn your memes into tokens.",
    appUrl: "https://www.memed.fun",
    appIcon: "https://www.memed.fun/icon.png",
  })
);

const queryClient = new QueryClient();

// Custom theme overrides for retro theme
const customRetroTheme = {
  // Core colors matching your green logo
  "--ck-accent-color": "#fff",
  "--ck-accent-text-color": "#FFFFFF",

  "--ck-modal-background": "#000",
  "--ck-body-background": "#FFFFFF",
  "--ck-body-background-transparent": "#FFFFFF",
  "--ck-overlay-background": "rgba(0, 0, 0, 0.5)" /* 50% opacity */,

  // Override some retro theme elements with your brand colors
  "--ck-connectbutton-background": "#4CAF50",
  "--ck-connectbutton-hover-background": "#388E3C",
  "--ck-connectbutton-active-background": "#2E7D32",

  // Keep some retro characteristics but with your color scheme
  "--ck-secondary-button-background": "#2A2A2A",
  "--ck-secondary-button-hover-background": "#333333",

  // Preserving retro borders but with your colors
  "--ck-body-border": "1px solid #4CAF50",
  "--ck-body-border-radius": "6px",
};

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="retro"
          customTheme={customRetroTheme}
          options={{
            hideBalance: false,
            hideTooltips: false,
            walletConnectCTA: "both",
          }}
        >
          <LensProvider client={client}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
