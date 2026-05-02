import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 FRESH COMPLETE SYSTEM DEPLOYMENT\n");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const treasury = deployer.address;
  const primaryOracle = "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29";
  const fallbackOracle = "0x0000000000000000000000000000000000000000";

  console.log("📦 Deploying all contracts...\n");

  // 1. WzkLTC
  const WzkLTC = await ethers.getContractFactory("WzkLTC");
  const wzkLTC = await WzkLTC.deploy(deployer.address);
  await wzkLTC.waitForDeployment();
  const wzkLTCAddr = await wzkLTC.getAddress();
  console.log("1️⃣  WzkLTC:", wzkLTCAddr);

  // 2. AddressesRegistry (empty, will freeze later)
  const AddressesRegistry = await ethers.getContractFactory("AddressesRegistry");
  const registry = await AddressesRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("2️⃣  AddressesRegistry:", registryAddr);

  // 3. FnUSD
  const FnUSD = await ethers.getContractFactory("FnUSD");
  const fnUSD = await FnUSD.deploy(registryAddr);
  await fnUSD.waitForDeployment();
  const fnUSDAddr = await fnUSD.getAddress();
  console.log("3️⃣  FnUSD:", fnUSDAddr);

  // 4. PriceFeed
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy(primaryOracle, fallbackOracle);
  await priceFeed.waitForDeployment();
  const priceFeedAddr = await priceFeed.getAddress();
  console.log("4️⃣  PriceFeed:", priceFeedAddr);

  // 5. ActivePool
  const ActivePool = await ethers.getContractFactory("ActivePool");
  const activePool = await ActivePool.deploy(registryAddr, wzkLTCAddr);
  await activePool.waitForDeployment();
  const activePoolAddr = await activePool.getAddress();
  console.log("5️⃣  ActivePool:", activePoolAddr);

  // 6. DefaultPool
  const DefaultPool = await ethers.getContractFactory("DefaultPool");
  const defaultPool = await DefaultPool.deploy(registryAddr, wzkLTCAddr);
  await defaultPool.waitForDeployment();
  const defaultPoolAddr = await defaultPool.getAddress();
  console.log("6️⃣  DefaultPool:", defaultPoolAddr);

  // 7. CollSurplusPool
  const CollSurplusPool = await ethers.getContractFactory("CollSurplusPool");
  const collSurplusPool = await CollSurplusPool.deploy(registryAddr, wzkLTCAddr);
  await collSurplusPool.waitForDeployment();
  const collSurplusPoolAddr = await collSurplusPool.getAddress();
  console.log("7️⃣  CollSurplusPool:", collSurplusPoolAddr);

  // 8. GasPool
  const GasPool = await ethers.getContractFactory("GasPool");
  const gasPool = await GasPool.deploy(registryAddr);
  await gasPool.waitForDeployment();
  const gasPoolAddr = await gasPool.getAddress();
  console.log("8️⃣  GasPool:", gasPoolAddr);

  // 9. SortedTroves
  const SortedTroves = await ethers.getContractFactory("SortedTroves");
  const sortedTroves = await SortedTroves.deploy(registryAddr);
  await sortedTroves.waitForDeployment();
  const sortedTrovesAddr = await sortedTroves.getAddress();
  console.log("9️⃣  SortedTroves:", sortedTrovesAddr);

  // 10. CollateralRegistry
  const CollateralRegistry = await ethers.getContractFactory("CollateralRegistry");
  const collateralRegistry = await CollateralRegistry.deploy(deployer.address);
  await collateralRegistry.waitForDeployment();
  const collateralRegistryAddr = await collateralRegistry.getAddress();
  console.log("🔟 CollateralRegistry:", collateralRegistryAddr);

  // 11. TroveNFT
  const TroveNFT = await ethers.getContractFactory("TroveNFT");
  const troveNFT = await TroveNFT.deploy(registryAddr);
  await troveNFT.waitForDeployment();
  const troveNFTAddr = await troveNFT.getAddress();
  console.log("1️⃣1️⃣ TroveNFT:", troveNFTAddr);

  // 12. TroveManager
  const TroveManager = await ethers.getContractFactory("TroveManager");
  const troveManager = await TroveManager.deploy(registryAddr);
  await troveManager.waitForDeployment();
  const troveManagerAddr = await troveManager.getAddress();
  console.log("1️⃣2️⃣ TroveManager:", troveManagerAddr);

  // 13. BorrowerOperations
  const BorrowerOperations = await ethers.getContractFactory("BorrowerOperations");
  const borrowerOps = await BorrowerOperations.deploy(registryAddr, troveNFTAddr);
  await borrowerOps.waitForDeployment();
  const borrowerOpsAddr = await borrowerOps.getAddress();
  console.log("1️⃣3️⃣ BorrowerOperations:", borrowerOpsAddr);

  // 14. RedemptionHelper
  const RedemptionHelper = await ethers.getContractFactory("RedemptionHelper");
  const redemptionHelper = await RedemptionHelper.deploy(registryAddr);
  await redemptionHelper.waitForDeployment();
  const redemptionHelperAddr = await redemptionHelper.getAddress();
  console.log("1️⃣4️⃣ RedemptionHelper:", redemptionHelperAddr);

  // 15. HintHelpers
  const HintHelpers = await ethers.getContractFactory("HintHelpers");
  const hintHelpers = await HintHelpers.deploy(registryAddr);
  await hintHelpers.waitForDeployment();
  const hintHelpersAddr = await hintHelpers.getAddress();
  console.log("1️⃣5️⃣ HintHelpers:", hintHelpersAddr);

  // FREEZE REGISTRY
  console.log("\n🔒 Freezing AddressesRegistry...");
  const addresses = {
    collateralToken: wzkLTCAddr,
    fnUSD: fnUSDAddr,
    priceFeed: priceFeedAddr,
    borrowerOperations: borrowerOpsAddr,
    troveManager: troveManagerAddr,
    troveNFT: troveNFTAddr,
    sortedTroves: sortedTrovesAddr,
    activePool: activePoolAddr,
    defaultPool: defaultPoolAddr,
    collSurplusPool: collSurplusPoolAddr,
    gasPool: gasPoolAddr,
    treasury: treasury,
    redemptionHelper: redemptionHelperAddr,
    hintHelpers: hintHelpersAddr,
    collateralRegistry: collateralRegistryAddr,
  };

  await (await registry.setAddresses(addresses)).wait();
  console.log("✅ Registry FROZEN - immutable forever!");

  // UPDATE FRONTEND
  console.log("\n📝 Updating frontend...");
  const contractsTs = `// Auto-generated — do not edit manually
// Network: liteforge | ChainId: 4441
// Deployed: ${new Date().toISOString()}
// AddressesRegistry: FROZEN (immutable)

export const CONTRACTS = {
  "network": "liteforge",
  "chainId": 4441,
  "deployedAt": "${new Date().toISOString()}",
  "deployer": "${deployer.address}",
  "treasury": "${treasury}",
  "AddressesRegistry": "${registryAddr}",
  "WzkLTC": "${wzkLTCAddr}",
  "FnUSD": "${fnUSDAddr}",
  "PriceFeed": "${priceFeedAddr}",
  "ActivePool": "${activePoolAddr}",
  "DefaultPool": "${defaultPoolAddr}",
  "CollSurplusPool": "${collSurplusPoolAddr}",
  "GasPool": "${gasPoolAddr}",
  "SortedTroves": "${sortedTrovesAddr}",
  "TroveManager": "${troveManagerAddr}",
  "TroveNFT": "${troveNFTAddr}",
  "BorrowerOperations": "${borrowerOpsAddr}",
  "RedemptionHelper": "${redemptionHelperAddr}",
  "HintHelpers": "${hintHelpersAddr}",
  "CollateralRegistry": "${collateralRegistryAddr}"
} as const;

export type ContractName = keyof typeof CONTRACTS;
`;

  fs.writeFileSync(path.join(__dirname, "../../src/lib/contracts.ts"), contractsTs);
  console.log("✅ Frontend updated!");

  // UPDATE .ENV
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(/ADDRESSES_REGISTRY=.*/g, `ADDRESSES_REGISTRY=${registryAddr}`);
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env updated!");

  // SUMMARY
  console.log("\n" + "=".repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(70));
  console.log("\n📋 ALL ADDRESSES:");
  console.log("AddressesRegistry:  ", registryAddr, "🔒 FROZEN");
  console.log("WzkLTC:             ", wzkLTCAddr);
  console.log("FnUSD:              ", fnUSDAddr);
  console.log("PriceFeed:          ", priceFeedAddr);
  console.log("ActivePool:         ", activePoolAddr);
  console.log("DefaultPool:        ", defaultPoolAddr);
  console.log("CollSurplusPool:    ", collSurplusPoolAddr);
  console.log("GasPool:            ", gasPoolAddr);
  console.log("SortedTroves:       ", sortedTrovesAddr);
  console.log("TroveNFT:           ", troveNFTAddr);
  console.log("TroveManager:       ", troveManagerAddr);
  console.log("BorrowerOperations: ", borrowerOpsAddr);
  console.log("RedemptionHelper:   ", redemptionHelperAddr);
  console.log("HintHelpers:        ", hintHelpersAddr);
  console.log("CollateralRegistry: ", collateralRegistryAddr);
  console.log("\n✅ All contracts deployed");
  console.log("✅ Registry frozen (immutable)");
  console.log("✅ Frontend synchronized");
  console.log("✅ Ready for production!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
