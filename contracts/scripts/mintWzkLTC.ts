import { ethers } from "hardhat";
import "dotenv/config";

// Deployed WzkLTC address on LitVM LiteForge
const WZKLITECOIN = "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec";
const AMOUNT      = ethers.parseUnits("1000000000", 8); // 1,000,000 WzkLTC (8 decimals)

const ABI = [
  "function adminMint(address to, uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n══════════════════════════════════════════");
  console.log("  Mint WzkLTC — LitVM LiteForge");
  console.log("══════════════════════════════════════════");
  console.log(`  WzkLTC  : ${WZKLITECOIN}`);
  console.log(`  To      : ${deployer.address}`);
  console.log(`  Amount  : 1,000,000 WzkLTC`);
  console.log("══════════════════════════════════════════\n");

  const token = new ethers.Contract(WZKLITECOIN, ABI, deployer);

  const balBefore = await token.balanceOf(deployer.address);
  console.log(`Balance before: ${ethers.formatUnits(balBefore, 8)} WzkLTC`);

  console.log("Minting...");
  const tx = await token.adminMint(deployer.address, AMOUNT);
  console.log(`Tx hash: ${tx.hash}`);
  await tx.wait();

  const balAfter = await token.balanceOf(deployer.address);
  console.log(`Balance after : ${ethers.formatUnits(balAfter, 8)} WzkLTC`);
  console.log("\n✅ Done");
}

main().catch((e) => { console.error(e); process.exit(1); });
