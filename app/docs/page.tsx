import type { Metadata } from "next";
import { Docs } from "./docs";

export const metadata: Metadata = {
  title: "Docs · FENUS",
  description: "How FENUS works: Troves, FnUSD, collateral ratio, fees, tokenized stocks, and LitVM contracts.",
};

export default function DocPage() {
  return <Docs />;
}
