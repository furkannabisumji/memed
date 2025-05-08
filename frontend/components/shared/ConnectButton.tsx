"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

interface ConnectButtonProps {
  className?: string;
}

export function ConnectButton({ className }: ConnectButtonProps) {
  const { isConnected, address } = useAccount();

  return <ConnectKitButton />;
}
