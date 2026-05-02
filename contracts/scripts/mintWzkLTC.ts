import { ethers } from "hardhat";
import "dotenv/config";

const WZKLITECOIN = "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec";
const AMOUNT      = ethers.parseUnits("100000000", 8); // 100,000,000 WzkLTC (8 decimals)

const ABI = [
  "function adminMint(address to, uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const token = new ethers.Contract(WZKLITECOIN, ABI, deployer);

  console.log("\n══════════════════════════════════════════");
  console.log("  Mint WzkLTC — LitVM LiteForge");
  console.log("══════════════════════════════════════════");
  console.log(`  To      : ${deployer.address}`);
  console.log(`  Amount  : 100,000,000 WzkLTC`);

  const before = await token.balanceOf(deployer.address);
  console.log(`  Balance before: ${ethers.formatUnits(before, 8)} WzkLTC`);

  const tx = await token.adminMint(deployer.address, AMOUNT);
  console.log(`  Tx: ${tx.hash}`);
  await tx.wait();

  const after = await token.balanceOf(deployer.address);
  console.log(`  Balance after : ${ethers.formatUnits(after, 8)} WzkLTC`);
  console.log("  ✅ Done");
  console.log("══════════════════════════════════════════\n");
}

main().catch(e => { console.error(e); process.exit(1); });
