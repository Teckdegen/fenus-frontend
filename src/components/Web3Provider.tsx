import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiAdapter } from "@/lib/web3";

export const Web3Provider = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>{children}</WagmiProvider>
);
