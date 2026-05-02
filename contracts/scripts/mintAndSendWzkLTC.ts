import { ethers } from "hardhat";

async function main() {
  console.log("🪙 Minting and sending WzkLTC...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Admin wallet:", deployer.address);

  const wzkLTCAddress = "0xb474BcBAAdB14109937d20f826BE51f36318DC16";
  const recipientAddress = "0x0F5ddCFA6b2BbD7E24f8B98a3634273A4B5a834C";
  
  const WzkLTC = await ethers.getContractAt("WzkLTC", wzkLTCAddress);

  const amount = ethers.parseUnits("100000000", 8); // 100,000,000 wzkLTC (8 decimals)
  
  // Step 1: Mint to admin
  console.log("Step 1: Minting 100,000,000 wzkLTC to admin...");
  const mintTx = await WzkLTC.adminMint(deployer.address, amount);
  await mintTx.wait();
  console.log("✅ Minted successfully!");
  console.log("Mint transaction:", mintTx.hash);

  // Step 2: Transfer to recipient
  console.log("\nStep 2: Sending 100,000,000 wzkLTC to", recipientAddress);
  const transferTx = await WzkLTC.transfer(recipientAddress, amount);
  await transferTx.wait();
  console.log("✅ Sent successfully!");
  console.log("Transfer transaction:", transferTx.hash);
  
  // Verify balances
  const adminBalance = await WzkLTC.balanceOf(deployer.address);
  const recipientBalance = await WzkLTC.balanceOf(recipientAddress);
  
  console.log("\n📊 Final Balances:");
  console.log("Admin balance:", ethers.formatUnits(adminBalance, 8), "wzkLTC");
  console.log("Recipient balance:", ethers.formatUnits(recipientBalance, 8), "wzkLTC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
