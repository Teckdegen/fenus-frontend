import { ethers } from "hardhat";

async function main() {
  const newRegistry = "0xB08985233e33eAB99469022ddd32129821F1c0f9"; // LATEST
  const oldRegistry = "0xC9D4038Eda399Ebf02C0EB3E166B9391E4CB83B6"; // Second attempt

  console.log("🔍 Checking Registry Addresses...\n");

  // Check NEW registry
  console.log("📋 NEW Registry:", newRegistry);
  const newReg = await ethers.getContractAt("AddressesRegistry", newRegistry);
  const newAddrs = await newReg.addresses();
  console.log("BorrowerOperations:", newAddrs.borrowerOperations);
  console.log("TroveManager:      ", newAddrs.troveManager);
  console.log("Is Frozen:         ", await newReg.isInitialized());

  console.log("\n📋 OLD Registry:", oldRegistry);
  const oldReg = await ethers.getContractAt("AddressesRegistry", oldRegistry);
  const oldAddrs = await oldReg.addresses();
  console.log("BorrowerOperations:", oldAddrs.borrowerOperations);
  console.log("TroveManager:      ", oldAddrs.troveManager);
  console.log("Is Frozen:         ", await oldReg.isInitialized());

  console.log("\n🆕 NEW NFT Contracts (should be in new registry):");
  console.log("TroveNFT:           0xF7F75243f53a963E09836f758d7C032681be698C");
  console.log("TroveManager:       0x17a41A0154441Bb7d6FCb35c123A5bD2973DF755");
  console.log("BorrowerOperations: 0xAa915955893125A22351EeFfdCA4Ad59a85EC05B");

  console.log("\n⚠️ ISSUE DETECTED:");
  if (newAddrs.borrowerOperations !== "0xAa915955893125A22351EeFfdCA4Ad59a85EC05B") {
    console.log("❌ New registry has WRONG BorrowerOperations address!");
    console.log("   Expected: 0xAa915955893125A22351EeFfdCA4Ad59a85EC05B");
    console.log("   Got:      ", newAddrs.borrowerOperations);
  }
  if (newAddrs.troveManager !== "0x17a41A0154441Bb7d6FCb35c123A5bD2973DF755") {
    console.log("❌ New registry has WRONG TroveManager address!");
    console.log("   Expected: 0x17a41A0154441Bb7d6FCb35c123A5bD2973DF755");
    console.log("   Got:      ", newAddrs.troveManager);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
