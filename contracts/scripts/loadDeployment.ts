import { readFileSync } from "fs";
import { join } from "path";

/** Addresses written by `scripts/deploy.ts` → `deployments/liteforge.json`. */
export type LiteforgeDeployment = {
  network: string;
  chainId: number;
  deployedAt?: string;
  deployer: string;
  treasury: string;
  AddressesRegistry: string;
  WzkLTC: string;
  FnUSD: string;
  PriceFeed: string;
  ActivePool: string;
  DefaultPool: string;
  CollSurplusPool: string;
  GasPool: string;
  SortedTroves: string;
  TroveManager: string;
  BorrowerOperations: string;
  RedemptionHelper: string;
  HintHelpers: string;
  CollateralRegistry: string;
};

export function loadLiteforgeDeployment(): LiteforgeDeployment {
  const path = join(__dirname, "..", "deployments", "liteforge.json");
  return JSON.parse(readFileSync(path, "utf8")) as LiteforgeDeployment;
}
