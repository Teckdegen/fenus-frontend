/**
 * Run if deploy.ts stopped after registry freeze (RPC timeout).
 * Registers WzkLTC on CollateralRegistry and seeds PriceFeed.
 *
 *   npx hardhat run scripts/finishDeploy.ts --network liteforge
 */
import { ethers, network } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

async function main() {
  const path = join(__dirname, "..", "deployments", `${network.name}.json`);
  const dep = JSON.parse(readFileSync(path, "utf8")) as Record<string, string>;
  const [signer] = await ethers.getSigners();

  const CR_ABI = [
    "function addCollateral(address token, uint256 mcr, address registry) external",
  ];
  const cr = new ethers.Contract(dep.CollateralRegistry, CR_ABI, signer);
  const MCR = ethers.parseEther("1.3");

  try {
    const tx = await cr.addCollateral(dep.WzkLTC, MCR, dep.AddressesRegistry);
    console.log("addCollateral tx:", tx.hash);
    await tx.wait(2);
    console.log("✅ Collateral registered");
  } catch (e: any) {
    console.log("addCollateral:", e.shortMessage || e.message);
  }

  const PF_ABI = ["function fetchPrice() external returns (uint256, bool)"];
  const pf = new ethers.Contract(dep.PriceFeed, PF_ABI, signer);
  try {
    const tx2 = await pf.fetchPrice();
    console.log("fetchPrice tx:", tx2.hash);
    await tx2.wait(2);
    console.log("✅ PriceFeed seeded");
  } catch (e: any) {
    console.log("fetchPrice:", e.shortMessage || e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
