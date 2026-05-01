import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

// TODO: replace with your Project ID from https://cloud.reown.com
export const projectId = "YOUR_REOWN_PROJECT_ID";

<<<<<<< HEAD
// Litecoin zkEVM (update RPC / chainId if your network specs differ)
export const litecoinZkEvm = {
 id: 8888888,
 name: "Litecoin zkEVM",
 nativeCurrency: { name: "Litecoin", symbol: "LTC", decimals: 18 },
 rpcUrls: {
 default: { http: ["https://rpc.lite.xyz"] },
 },
 blockExplorers: {
 default: { name: "LiteScan", url: "https://litescan.xyz" },
 },
 testnet: false,
=======
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
>>>>>>> 93a6f9d (jejej)
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
 description: "FENUS Borrow FnUSD against zkLTC",
 url: typeof window !== "undefined" ? window.location.origin : "https://fenus.xyz",
 icons: ["https://fenus.xyz/favicon.ico"],
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
