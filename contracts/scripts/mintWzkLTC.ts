import { ethers } from "hardhat";

async function main() {
  console.log("🪙 Minting WzkLTC to admin wallet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Admin wallet:", deployer.address);

  const wzkLTCAddress = "0xb474BcBAAdB14109937d20f826BE51f36318DC16";
  const WzkLTC = await ethers.getContractAt("WzkLTC", wzkLTCAddress);

  const amount = ethers.parseUnits("100000000", 8); // 100,000,000 wzkLTC (8 decimals)
  
  console.log("Minting 100,000,000 wzkLTC...");
  const tx = await WzkLTC.adminMint(deployer.address, amount);
  await tx.wait();

  console.log("✅ Minted successfully!");
  console.log("Transaction:", tx.hash);
  
  const balance = await WzkLTC.balanceOf(deployer.address);
  console.log("\nNew balance:", ethers.formatUnits(balance, 8), "wzkLTC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
