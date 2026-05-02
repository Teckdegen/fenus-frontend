import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 REDEPLOYING SYSTEM (KEEPING EXISTING WzkLTC)\n");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const treasury = deployer.address;
  const primaryOracle = "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29";
  const fallbackOracle = "0x0000000000000000000000000000000000000000";

  // KEEP EXISTING WzkLTC
  const wzkLTCAddr = "0xb474BcBAAdB14109937d20f826BE51f36318DC16";
  console.log("♻️  WzkLTC (EXISTING):", wzkLTCAddr);

  console.log("\n📦 Deploying new contracts...\n");

  // 1. AddressesRegistry (empty, will freeze later)
  const AddressesRegistry = await ethers.getContractFactory("AddressesRegistry");
  const registry = await AddressesRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("1️⃣  AddressesRegistry:", registryAddr);

  // 2. FnUSD
  const FnUSD = await ethers.getContractFactory("FnUSD");
  const fnUSD = await FnUSD.deploy(registryAddr);
  await fnUSD.waitForDeployment();
  const fnUSDAddr = await fnUSD.getAddress();
  console.log("2️⃣  FnUSD:", fnUSDAddr);

  // 3. PriceFeed
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy(primaryOracle, fallbackOracle);
  await priceFeed.waitForDeployment();
  const priceFeedAddr = await priceFeed.getAddress();
  console.log("3️⃣  PriceFeed:", priceFeedAddr);

  // 4. ActivePool
  const ActivePool = await ethers.getContractFactory("ActivePool");
  const activePool = await ActivePool.deploy(registryAddr, wzkLTCAddr);
  await activePool.waitForDeployment();
  const activePoolAddr = await activePool.getAddress();
  console.log("4️⃣  ActivePool:", activePoolAddr);

  // 5. DefaultPool
  const DefaultPool = await ethers.getContractFactory("DefaultPool");
  const defaultPool = await DefaultPool.deploy(registryAddr, wzkLTCAddr);
  await defaultPool.waitForDeployment();
  const defaultPoolAddr = await defaultPool.getAddress();
  console.log("5️⃣  DefaultPool:", defaultPoolAddr);

  // 6. CollSurplusPool
  const CollSurplusPool = await ethers.getContractFactory("CollSurplusPool");
  const collSurplusPool = await CollSurplusPool.deploy(registryAddr, wzkLTCAddr);
  await collSurplusPool.waitForDeployment();
  const collSurplusPoolAddr = await collSurplusPool.getAddress();
  console.log("6️⃣  CollSurplusPool:", collSurplusPoolAddr);

  // 7. GasPool
  const GasPool = await ethers.getContractFactory("GasPool");
  const gasPool = await GasPool.deploy(registryAddr);
  await gasPool.waitForDeployment();
  const gasPoolAddr = await gasPool.getAddress();
  console.log("7️⃣  GasPool:", gasPoolAddr);

  // 8. SortedTroves
  const SortedTroves = await ethers.getContractFactory("SortedTroves");
  const sortedTroves = await SortedTroves.deploy(registryAddr);
  await sortedTroves.waitForDeployment();
  const sortedTrovesAddr = await sortedTroves.getAddress();
  console.log("8️⃣  SortedTroves:", sortedTrovesAddr);

  // 9. CollateralRegistry
  const CollateralRegistry = await ethers.getContractFactory("CollateralRegistry");
  const collateralRegistry = await CollateralRegistry.deploy(deployer.address);
  await collateralRegistry.waitForDeployment();
  const collateralRegistryAddr = await collateralRegistry.getAddress();
  console.log("9️⃣  CollateralRegistry:", collateralRegistryAddr);

  // 10. TroveNFT
  const TroveNFT = await ethers.getContractFactory("TroveNFT");
  const troveNFT = await TroveNFT.deploy(registryAddr);
  await troveNFT.waitForDeployment();
  const troveNFTAddr = await troveNFT.getAddress();
  console.log("🔟 TroveNFT:", troveNFTAddr);

  // 11. TroveManager
  const TroveManager = await ethers.getContractFactory("TroveManager");
  const troveManager = await TroveManager.deploy(registryAddr);
  await troveManager.waitForDeployment();
  const troveManagerAddr = await troveManager.getAddress();
  console.log("1️⃣1️⃣ TroveManager:", troveManagerAddr);

  // 12. BorrowerOperations
  const BorrowerOperations = await ethers.getContractFactory("BorrowerOperations");
  const borrowerOps = await BorrowerOperations.deploy(registryAddr, troveNFTAddr);
  await borrowerOps.waitForDeployment();
  const borrowerOpsAddr = await borrowerOps.getAddress();
  console.log("1️⃣2️⃣ BorrowerOperations:", borrowerOpsAddr);

  // 13. RedemptionHelper
  const RedemptionHelper = await ethers.getContractFactory("RedemptionHelper");
  const redemptionHelper = await RedemptionHelper.deploy(registryAddr);
  await redemptionHelper.waitForDeployment();
  const redemptionHelperAddr = await redemptionHelper.getAddress();
  console.log("1️⃣3️⃣ RedemptionHelper:", redemptionHelperAddr);

  // 14. HintHelpers
  const HintHelpers = await ethers.getContractFactory("HintHelpers");
  const hintHelpers = await HintHelpers.deploy(registryAddr);
  await hintHelpers.waitForDeployment();
  const hintHelpersAddr = await hintHelpers.getAddress();
  console.log("1️⃣4️⃣ HintHelpers:", hintHelpersAddr);

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
  const contractsTs = `// Auto-generated - do not edit manually
// Network: liteforge | ChainId: 4441
// Deployed: ${new Date().toISOString()}
// AddressesRegistry: FROZEN (immutable)
// WzkLTC: KEPT FROM PREVIOUS DEPLOYMENT

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
  console.log("🎉 REDEPLOYMENT COMPLETE!");
  console.log("=".repeat(70));
  console.log("\n📋 ALL ADDRESSES:");
  console.log("AddressesRegistry:  ", registryAddr, "🔒 FROZEN");
  console.log("WzkLTC:             ", wzkLTCAddr, "♻️  KEPT");
  console.log("FnUSD:              ", fnUSDAddr, "🆕 NEW");
  console.log("PriceFeed:          ", priceFeedAddr, "🆕 NEW");
  console.log("ActivePool:         ", activePoolAddr, "🆕 NEW");
  console.log("DefaultPool:        ", defaultPoolAddr, "🆕 NEW");
  console.log("CollSurplusPool:    ", collSurplusPoolAddr, "🆕 NEW");
  console.log("GasPool:            ", gasPoolAddr, "🆕 NEW");
  console.log("SortedTroves:       ", sortedTrovesAddr, "🆕 NEW");
  console.log("TroveNFT:           ", troveNFTAddr, "🆕 NEW");
  console.log("TroveManager:       ", troveManagerAddr, "🆕 NEW");
  console.log("BorrowerOperations: ", borrowerOpsAddr, "🆕 NEW (FIXED FEE LOGIC)");
  console.log("RedemptionHelper:   ", redemptionHelperAddr, "🆕 NEW");
  console.log("HintHelpers:        ", hintHelpersAddr, "🆕 NEW");
  console.log("CollateralRegistry: ", collateralRegistryAddr, "🆕 NEW");
  console.log("\n✅ All contracts deployed (except WzkLTC - kept existing)");
  console.log("✅ Registry frozen (immutable)");
  console.log("✅ Frontend synchronized");
  console.log("✅ Fee logic fixed: debt = amount received, fee goes to treasury");
  console.log("✅ Ready for production!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
