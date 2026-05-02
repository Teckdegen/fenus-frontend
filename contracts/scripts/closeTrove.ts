// Closes the deployer's Trove — BorrowerOperations from latest liteforge deployment
import { ethers } from "hardhat";
import "dotenv/config";
import { loadLiteforgeDeployment } from "./loadDeployment";

const BO = loadLiteforgeDeployment().BorrowerOperations;
const ABI = ["function closeTrove() external"];

async function main() {
  const [signer] = await ethers.getSigners();
  const bo = new ethers.Contract(BO, ABI, signer);

  console.log("\nClosing Trove...");
  const tx = await bo.closeTrove({ gas: 500000n });
  console.log(`Tx: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`✅ Confirmed block ${receipt.blockNumber}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
