import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const logFile = path.join(__dirname, "../deployment.log");
fs.writeFileSync(logFile, `Deployment started at ${new Date().toISOString()}\n`);

function log(...args: any[]) {
  const message = args.join(" ");
  process.stdout.write(message + "\n");
  fs.appendFileSync(logFile, message + "\n");
}

async function main() {
  log("🚀 COMPLETE SYSTEM DEPLOYMENT - Fresh Start\n");
  log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  log("Deploying with account:", deployer.address);
  log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const treasury = process.env.TREASURY || deployer.address;
  const primaryOracle = process.env.PRIMARY_ORACLE || "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29";
  const fallbackOracle = process.env.FALLBACK_ORACLE || "0x0000000000000000000000000000000000000000";

  // Step 1: Use existing WzkLTC (DO NOT REDEPLOY)
  const wzkLTCAddress = "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec";
  log("\n1️⃣ Using existing WzkLTC:", wzkLTCAddress, "✅ (NOT redeployed)");

  // Step 2: Deploy AddressesRegistry
  log("\n2️⃣ Deploying AddressesRegistry...");
  const AddressesRegistry = await ethers.getContractFactory("AddressesRegistry");
  const addressesRegistry = await AddressesRegistry.deploy();
  await addressesRegistry.waitForDeployment();
  const addressesRegistryAddress = await addressesRegistry.getAddress();
  log("✅ AddressesRegistry:", addressesRegistryAddress);

  // Step 3: Deploy FnUSD (needs registry)
  log("\n3️⃣ Deploying FnUSD...");
  const FnUSD = await ethers.getContractFactory("FnUSD");
  const fnUSD = await FnUSD.deploy(addressesRegistryAddress);
  await fnUSD.waitForDeployment();
  const fnUSDAddress = await fnUSD.getAddress();
  log("✅ FnUSD:", fnUSDAddress);

  // Step 4: Deploy PriceFeed
  log("\n4️⃣ Deploying PriceFeed...");
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy(primaryOracle, fallbackOracle);
  await priceFeed.waitForDeployment();
  const priceFeedAddress = await priceFeed.getAddress();
  log("✅ PriceFeed:", priceFeedAddress);

  // Step 5: Deploy Pools
  log("\n5️⃣ Deploying ActivePool...");
  const ActivePool = await ethers.getContractFactory("ActivePool");
  const activePool = await ActivePool.deploy(addressesRegistryAddress, wzkLTCAddress);
  await activePool.waitForDeployment();
  const activePoolAddress = await activePool.getAddress();
  log("✅ ActivePool:", activePoolAddress);

  log("\n6️⃣ Deploying DefaultPool...");
  const DefaultPool = await ethers.getContractFactory("DefaultPool");
  const defaultPool = await DefaultPool.deploy(addressesRegistryAddress, wzkLTCAddress);
  await defaultPool.waitForDeployment();
  const defaultPoolAddress = await defaultPool.getAddress();
  log("✅ DefaultPool:", defaultPoolAddress);

  log("\n7️⃣ Deploying CollSurplusPool...");
  const CollSurplusPool = await ethers.getContractFactory("CollSurplusPool");
  const collSurplusPool = await CollSurplusPool.deploy(addressesRegistryAddress, wzkLTCAddress);
  await collSurplusPool.waitForDeployment();
  const collSurplusPoolAddress = await collSurplusPool.getAddress();
  log("✅ CollSurplusPool:", collSurplusPoolAddress);

  log("\n8️⃣ Deploying GasPool...");
  const GasPool = await ethers.getContractFactory("GasPool");
  const gasPool = await GasPool.deploy(addressesRegistryAddress);
  await gasPool.waitForDeployment();
  const gasPoolAddress = await gasPool.getAddress();
  log("✅ GasPool:", gasPoolAddress);

  // Step 6: Deploy SortedTroves
  log("\n9️⃣ Deploying SortedTroves...");
  const SortedTroves = await ethers.getContractFactory("SortedTroves");
  const sortedTroves = await SortedTroves.deploy(addressesRegistryAddress);
  await sortedTroves.waitForDeployment();
  const sortedTrovesAddress = await sortedTroves.getAddress();
  log("✅ SortedTroves:", sortedTrovesAddress);

  // Step 7: Deploy CollateralRegistry
  log("\n🔟 Deploying CollateralRegistry...");
  const CollateralRegistry = await ethers.getContractFactory("CollateralRegistry");
  const collateralRegistry = await CollateralRegistry.deploy(deployer.address);
  await collateralRegistry.waitForDeployment();
  const collateralRegistryAddress = await collateralRegistry.getAddress();
  log("✅ CollateralRegistry:", collateralRegistryAddress);

  // Step 8: Deploy TroveNFT
  log("\n1️⃣1️⃣ Deploying TroveNFT...");
  const TroveNFT = await ethers.getContractFactory("TroveNFT");
  const troveNFT = await TroveNFT.deploy(addressesRegistryAddress);
  await troveNFT.waitForDeployment();
  const troveNFTAddress = await troveNFT.getAddress();
  log("✅ TroveNFT:", troveNFTAddress);

  // Step 9: Deploy TroveManager
  log("\n1️⃣2️⃣ Deploying TroveManager...");
  const TroveManager = await ethers.getContractFactory("TroveManager");
  const troveManager = await TroveManager.deploy(addressesRegistryAddress);
  await troveManager.waitForDeployment();
  const troveManagerAddress = await troveManager.getAddress();
  log("✅ TroveManager:", troveManagerAddress);

  // Step 10: Deploy BorrowerOperations
  log("\n1️⃣3️⃣ Deploying BorrowerOperations...");
  const BorrowerOperations = await ethers.getContractFactory("BorrowerOperations");
  const borrowerOperations = await BorrowerOperations.deploy(addressesRegistryAddress, troveNFTAddress);
  await borrowerOperations.waitForDeployment();
  const borrowerOperationsAddress = await borrowerOperations.getAddress();
  log("✅ BorrowerOperations:", borrowerOperationsAddress);

  // Step 11: Deploy Helpers
  log("\n1️⃣4️⃣ Deploying RedemptionHelper...");
  const RedemptionHelper = await ethers.getContractFactory("RedemptionHelper");
  const redemptionHelper = await RedemptionHelper.deploy(addressesRegistryAddress);
  await redemptionHelper.waitForDeployment();
  const redemptionHelperAddress = await redemptionHelper.getAddress();
  log("✅ RedemptionHelper:", redemptionHelperAddress);

  log("\n1️⃣5️⃣ Deploying HintHelpers...");
  const HintHelpers = await ethers.getContractFactory("HintHelpers");
  const hintHelpers = await HintHelpers.deploy(addressesRegistryAddress);
  await hintHelpers.waitForDeployment();
  const hintHelpersAddress = await hintHelpers.getAddress();
  log("✅ HintHelpers:", hintHelpersAddress);

  // Step 12: Freeze AddressesRegistry
  log("\n🔒 FREEZING AddressesRegistry...");
  const addresses = {
    collateralToken: wzkLTCAddress,
    fnUSD: fnUSDAddress,
    priceFeed: priceFeedAddress,
    borrowerOperations: borrowerOperationsAddress,
    troveManager: troveManagerAddress,
    troveNFT: troveNFTAddress,
    sortedTroves: sortedTrovesAddress,
    activePool: activePoolAddress,
    defaultPool: defaultPoolAddress,
    collSurplusPool: collSurplusPoolAddress,
    gasPool: gasPoolAddress,
    treasury: treasury,
    redemptionHelper: redemptionHelperAddress,
    hintHelpers: hintHelpersAddress,
    collateralRegistry: collateralRegistryAddress,
  };

  log("Addresses to freeze:", JSON.stringify(addresses, null, 2));
  const freezeTx = await addressesRegistry.setAddresses(addresses);
  await freezeTx.wait();
  log("✅ AddressesRegistry FROZEN!");

  // Step 13: Register WzkLTC as collateral
  log("\n⚙️ Registering WzkLTC as collateral...");
  const MCR = ethers.parseEther("1.3"); // 130%
  await (await collateralRegistry.addCollateral(wzkLTCAddress, MCR, addressesRegistryAddress)).wait();
  log("✅ WzkLTC registered as collateral!");

  // Step 14: Update frontend
  log("\n📝 Updating frontend...");
  const contractsTs = `// Auto-generated by deploy script — do not edit manually
// Network: liteforge | ChainId: 4441
// Deployed: ${new Date().toISOString()}
// AddressesRegistry: FROZEN (immutable)

export const CONTRACTS = {
  "network": "liteforge",
  "chainId": 4441,
  "deployedAt": "${new Date().toISOString()}",
  "deployer": "${deployer.address}",
  "treasury": "${treasury}",
  "AddressesRegistry": "${addressesRegistryAddress}",
  "WzkLTC": "${wzkLTCAddress}",
  "FnUSD": "${fnUSDAddress}",
  "PriceFeed": "${priceFeedAddress}",
  "ActivePool": "${activePoolAddress}",
  "DefaultPool": "${defaultPoolAddress}",
  "CollSurplusPool": "${collSurplusPoolAddress}",
  "GasPool": "${gasPoolAddress}",
  "SortedTroves": "${sortedTrovesAddress}",
  "TroveManager": "${troveManagerAddress}",
  "TroveNFT": "${troveNFTAddress}",
  "BorrowerOperations": "${borrowerOperationsAddress}",
  "RedemptionHelper": "${redemptionHelperAddress}",
  "HintHelpers": "${hintHelpersAddress}",
  "CollateralRegistry": "${collateralRegistryAddress}"
} as const;

export type ContractName = keyof typeof CONTRACTS;
`;

  const frontendPath = path.join(__dirname, "../../src/lib/contracts.ts");
  fs.writeFileSync(frontendPath, contractsTs);
  log("✅ Frontend updated!");

  // Update .env
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(/ADDRESSES_REGISTRY=.*/g, `ADDRESSES_REGISTRY=${addressesRegistryAddress}`);
  fs.writeFileSync(envPath, envContent);
  log("✅ .env updated!");

  // Summary
  log("\n" + "=".repeat(60));
  log("🎉 DEPLOYMENT COMPLETE!");
  log("=".repeat(60));
  log("\n📋 CONTRACT ADDRESSES:");
  log("AddressesRegistry:  ", addressesRegistryAddress, "🔒 FROZEN");
  log("WzkLTC:             ", wzkLTCAddress);
  log("FnUSD:              ", fnUSDAddress);
  log("PriceFeed:          ", priceFeedAddress);
  log("ActivePool:         ", activePoolAddress);
  log("DefaultPool:        ", defaultPoolAddress);
  log("CollSurplusPool:    ", collSurplusPoolAddress);
  log("GasPool:            ", gasPoolAddress);
  log("SortedTroves:       ", sortedTrovesAddress);
  log("TroveNFT:           ", troveNFTAddress);
  log("TroveManager:       ", troveManagerAddress);
  log("BorrowerOperations: ", borrowerOperationsAddress);
  log("RedemptionHelper:   ", redemptionHelperAddress);
  log("HintHelpers:        ", hintHelpersAddress);
  log("CollateralRegistry: ", collateralRegistryAddress);
  log("\n✅ Registry is FROZEN - immutable forever!");
  log("✅ Frontend synchronized!");
  log("✅ Ready for production!\n");
}

main()
  .then(() => {
    log("\n✅ Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
