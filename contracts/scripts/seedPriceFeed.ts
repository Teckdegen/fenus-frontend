// Seeds the PriceFeed by calling fetchPrice() once on-chain.
// This populates lastGoodPrice so BorrowerOperations can use it.
import { ethers } from "hardhat";
import "dotenv/config";
import { loadLiteforgeDeployment } from "./loadDeployment";

const PRICE_FEED = loadLiteforgeDeployment().PriceFeed;

const ABI = [
  "function fetchPrice() external returns (uint256 price18, bool isLive)",
  "function getLastGoodPrice() view returns (uint256)",
  "function status() view returns (uint8)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const pf = new ethers.Contract(PRICE_FEED, ABI, signer);

  console.log("\n══════════════════════════════════════════");
  console.log("  Seed PriceFeed — LitVM LiteForge");
  console.log("══════════════════════════════════════════");

  const before = await pf.getLastGoodPrice();
  console.log(`  lastGoodPrice before: ${ethers.formatEther(before)}`);

  console.log("  Calling fetchPrice()...");
  const tx = await pf.fetchPrice();
  const receipt = await tx.wait();
  console.log(`  Tx: ${receipt.hash}`);

  const after = await pf.getLastGoodPrice();
  const status = await pf.status();
  console.log(`  lastGoodPrice after : $${ethers.formatEther(after)}`);
  console.log(`  status              : ${status} (0=Live)`);

  if (after > 0n) {
    console.log("\n  ✅ PriceFeed seeded — openTrove will now work");
  } else {
    console.log("\n  ❌ Price still 0 — check oracle connection");
  }
  console.log("══════════════════════════════════════════\n");
}

main().catch(e => { console.error(e); process.exit(1); });
