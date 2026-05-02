// FENUS Token List — standard token metadata for wallets, DEXs, and explorers.
// Compatible with Uniswap Token List standard (https://tokenlists.org)
// Add this URL to any wallet or DEX to show correct names, symbols, and icons.

import { CONTRACTS } from "./contracts";
import { WZKLITECOIN_IMAGE_URL, FNUSD_IMAGE_URL } from "@/components/app/Shared";

export const FENUS_TOKEN_LIST = {
  name: "FENUS Token List",
  timestamp: new Date().toISOString(),
  version: { major: 1, minor: 0, patch: 0 },
  tokens: [
    {
      chainId:  4441,
      address:  CONTRACTS.WzkLTC,
      name:     "Wrapped zkLitecoin",
      symbol:   "wzkLTC",
      decimals: 8,
      logoURI:  WZKLITECOIN_IMAGE_URL,
      tags:     ["collateral"],
    },
    {
      chainId:  4441,
      address:  CONTRACTS.FnUSD,
      name:     "FnUSD",
      symbol:   "FnUSD",
      decimals: 6,
      logoURI:  FNUSD_IMAGE_URL,
      tags:     ["stablecoin"],
    },
  ],
} as const;

// Individual token metadata — use these wherever you need a single token's info
export const WZKLITECOIN_TOKEN = FENUS_TOKEN_LIST.tokens[0];
export const FNUSD_TOKEN       = FENUS_TOKEN_LIST.tokens[1];
