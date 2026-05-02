import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying New AddressesRegistry with NFT System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Existing contract addresses (from deployment)
  const addresses = {
    collateralToken: "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec", // WzkLTC
    fnUSD: "0x39d3861C1E60823b95f545f41dD3cb45f1f529AD",
    priceFeed: "0x0B3c8318327a775Bc8d67cF6B996408DBae1b62D",
    borrowerOperations: "0xC4b78665883C72a0C88cAE0157502CCCbB78DeFF", // NEW NFT-based
    troveManager: "0x7886a09D9D004Bc0a9cc167f769bCA582c3FFe15", // NEW NFT-based
    sortedTroves: "0xD12Eb5F67C3823a15A722d629E6EB79a0f045Ce6",
    activePool: "0x60cebB7639eF69a1889602d1b8441390fAF59A56",
    defaultPool: "0x3ca147c8f183468EFC6b67A783A71d2c12f094d3",
    collSurplusPool: "0x042c42e51006E49dbBb1A42061868CC64B0469a0",
    gasPool: "0xb50b0F1Fb8299Fd51aC3C84b3841C8177dF708D5",
    treasury: "0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df",
    redemptionHelper: "0x39EF4E7412f9220435016A0B51F048FFa7424473",
    hintHelpers: "0xCa4D74D08AB440529f4fa1c10B552F3242C6aFD7",
    collateralRegistry: "0x240d8A34C4E9350Cf23f4145191e8312D62e1fA0",
  };

  // 1. Deploy new AddressesRegistry
  console.log("1️⃣ Deploying AddressesRegistry...");
  const AddressesRegistry = await ethers.getContractFactory("AddressesRegistry");
  const registry = await AddressesRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ AddressesRegistry deployed to:", registryAddress);

  // 2. Set addresses and freeze
  console.log("\n2️⃣ Setting addresses and freezing registry...");
  const tx = await registry.setAddresses(addresses);
  await tx.wait();
  console.log("✅ Addresses set and registry FROZEN");

  // 3. Verify it's frozen
  console.log("\n3️⃣ Verifying registry is frozen...");
  const isInitialized = await registry.isInitialized();
  console.log("Initialized (Frozen):", isInitialized ? "✅ YES" : "❌ NO");

  // 4. Try to modify (should fail)
  console.log("\n4️⃣ Testing immutability...");
  try {
    await registry.setAddresses.staticCall(addresses);
    console.log("❌ ERROR: Registry can still be modified!");
  } catch (error: any) {
    if (error.message.includes("AlreadyInitialized")) {
      console.log("✅ CONFIRMED: Registry is permanently frozen");
    } else {
      console.log("⚠️ Unexpected error:", error.message);
    }
  }

  // 5. Display all addresses
  console.log("\n📋 Registered Addresses:");
  const storedAddresses = await registry.addresses();
  console.log("CollateralToken (WzkLTC):", storedAddresses.collateralToken);
  console.log("FnUSD:                   ", storedAddresses.fnUSD);
  console.log("PriceFeed:               ", storedAddresses.priceFeed);
  console.log("BorrowerOperations:      ", storedAddresses.borrowerOperations, "← NFT-based");
  console.log("TroveManager:            ", storedAddresses.troveManager, "← NFT-based");
  console.log("SortedTroves:            ", storedAddresses.sortedTroves);
  console.log("ActivePool:              ", storedAddresses.activePool);
  console.log("DefaultPool:             ", storedAddresses.defaultPool);
  console.log("CollSurplusPool:         ", storedAddresses.collSurplusPool);
  console.log("GasPool:                 ", storedAddresses.gasPool);
  console.log("Treasury:                ", storedAddresses.treasury);
  console.log("RedemptionHelper:        ", storedAddresses.redemptionHelper);
  console.log("HintHelpers:             ", storedAddresses.hintHelpers);
  console.log("CollateralRegistry:      ", storedAddresses.collateralRegistry);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Registry Deployed and FROZEN!");
  console.log("=".repeat(60));
  
  console.log("\n🔒 Security Status:");
  console.log("✅ Registry is permanently frozen");
  console.log("✅ No further modifications possible");
  console.log("✅ All addresses are immutable");
  console.log("✅ NFT-based contracts registered");

  console.log("\n💾 Update your .env:");
  console.log(`ADDRESSES_REGISTRY=${registryAddress}`);

  console.log("\n⚠️ IMPORTANT NEXT STEPS:");
  console.log("1. Update .env with new ADDRESSES_REGISTRY address");
  console.log("2. Update frontend contracts.ts with new registry address");
  console.log("3. Redeploy TroveNFT with new registry address");
  console.log("4. Redeploy TroveManager with new registry address");
  console.log("5. Redeploy BorrowerOperations with new registry address");
  console.log("6. Update all contracts to use new registry");
  console.log("7. Test thoroughly before going live");

  console.log("\n📝 New Registry Address:");
  console.log(registryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
