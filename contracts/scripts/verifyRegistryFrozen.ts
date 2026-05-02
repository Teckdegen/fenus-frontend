import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying AddressesRegistry Status...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Checking with account:", deployer.address);

  const addressesRegistryAddress = process.env.ADDRESSES_REGISTRY || "";
  if (!addressesRegistryAddress) {
    throw new Error("ADDRESSES_REGISTRY not set in .env");
  }

  console.log("Registry Address:", addressesRegistryAddress);

  const AddressesRegistry = await ethers.getContractAt("AddressesRegistry", addressesRegistryAddress);

  // Check if initialized (frozen)
  const isInitialized = await AddressesRegistry.isInitialized();
  console.log("\n📊 Registry Status:");
  console.log("Initialized (Frozen):", isInitialized ? "✅ YES - FROZEN" : "❌ NO - NOT FROZEN");

  // Get deployer address
  const registryDeployer = await AddressesRegistry.deployer();
  console.log("Registry Deployer:", registryDeployer);
  console.log("Current Signer:", deployer.address);
  console.log("Is Deployer:", registryDeployer.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO");

  // Get all addresses
  console.log("\n📋 Registered Addresses:");
  const addresses = await AddressesRegistry.addresses();
  console.log("CollateralToken (WzkLTC):", addresses.collateralToken);
  console.log("FnUSD:                   ", addresses.fnUSD);
  console.log("PriceFeed:               ", addresses.priceFeed);
  console.log("BorrowerOperations:      ", addresses.borrowerOperations);
  console.log("TroveManager:            ", addresses.troveManager);
  console.log("SortedTroves:            ", addresses.sortedTroves);
  console.log("ActivePool:              ", addresses.activePool);
  console.log("DefaultPool:             ", addresses.defaultPool);
  console.log("CollSurplusPool:         ", addresses.collSurplusPool);
  console.log("GasPool:                 ", addresses.gasPool);
  console.log("Treasury:                ", addresses.treasury);
  console.log("RedemptionHelper:        ", addresses.redemptionHelper);
  console.log("HintHelpers:             ", addresses.hintHelpers);
  console.log("CollateralRegistry:      ", addresses.collateralRegistry);

  if (isInitialized) {
    console.log("\n✅ SUCCESS: AddressesRegistry is FROZEN");
    console.log("No further modifications are possible.");
    console.log("The protocol addresses are now immutable.");
  } else {
    console.log("\n⚠️ WARNING: AddressesRegistry is NOT frozen");
    console.log("Call setAddresses() to freeze it permanently.");
  }

  // Try to modify (should fail if frozen)
  if (isInitialized) {
    console.log("\n🧪 Testing immutability...");
    try {
      await AddressesRegistry.setAddresses.staticCall(addresses);
      console.log("❌ ERROR: Registry can still be modified!");
    } catch (error: any) {
      if (error.message.includes("AlreadyInitialized")) {
        console.log("✅ CONFIRMED: Registry is immutable (AlreadyInitialized error)");
      } else {
        console.log("⚠️ Unexpected error:", error.message);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔒 Registry Verification Complete");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
