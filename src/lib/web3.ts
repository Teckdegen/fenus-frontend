import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

// TODO: replace with your Project ID from https://cloud.reown.com
export const projectId = "YOUR_REOWN_PROJECT_ID";

// LitVM LiteForge — Chain ID 4441
export const litVMLiteForge = {
  id: 4441,
  name: "LitVM LiteForge",
  nativeCurrency: { name: "zkLitecoin", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://liteforge.rpc.caldera.xyz/http"],
      webSocket: ["wss://liteforge.rpc.caldera.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "LiteForge Explorer",
      url: "https://liteforge.explorer.caldera.xyz",
    },
  },
  testnet: true,
} as const satisfies AppKitNetwork;

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [litVMLiteForge];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "FENUS",
    description: "FENUS — Borrow FnUSD against wzkLTC collateral",
    url: typeof window !== "undefined" ? window.location.origin : "https://fenus.xyz",
    icons: [
      "https://fenus.xyz/favicon.ico",
      "https://www.image2url.com/r2/default/images/1777632157848-482b63d8-a570-4f01-bc38-94ba9ebe0722.jpg",
    ],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "hsl(0 0% 100%)",
    "--w3m-border-radius-master": "12px",
  },
});
