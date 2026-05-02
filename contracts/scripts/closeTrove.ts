// Closes the deployer's Trove — uses the dust-fix BorrowerOperations
import { ethers } from "hardhat";
import "dotenv/config";

const BO = "0xBCF1D8725a3887443367653C11D1325d3CE6cCd2";
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
