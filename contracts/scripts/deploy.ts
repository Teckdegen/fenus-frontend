import { ethers, network } from "hardhat";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import "dotenv/config";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n══════════════════════════════════════════");
  console.log("  FENUS Protocol Deployment");
  console.log("══════════════════════════════════════════");
  console.log(`  Network  : ${network.name} (chainId ${network.config.chainId})`);
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} zkLTC`);
  console.log("══════════════════════════════════════════\n");

  const primaryOracle  = process.env.PRIMARY_ORACLE  || "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29";
  const fallbackOracle = process.env.FALLBACK_ORACLE || ethers.ZeroAddress;
  const treasury       = process.env.TREASURY        || deployer.address;

  console.log(`  Treasury : ${treasury}`);
  console.log(`  DIA Feed : ${primaryOracle} (LTC/USD)\n`);

  // ── 1. AddressesRegistry ──────────────────────────────────────────────────
  const Registry = await ethers.getContractFactory("AddressesRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log(`✅ AddressesRegistry  : ${await registry.getAddress()}`);

  // ── 2. WzkLTC ─────────────────────────────────────────────────────────────
  const WzkLTC = await ethers.getContractFactory("WzkLTC");
  const wzkLTC = await WzkLTC.deploy(deployer.address);
  await wzkLTC.waitForDeployment();
  console.log(`✅ WzkLTC             : ${await wzkLTC.getAddress()}`);

  // ── 3. FnUSD ──────────────────────────────────────────────────────────────
  const FnUSD = await ethers.getContractFactory("FnUSD");
  const fnUSD = await FnUSD.deploy(await registry.getAddress());
  await fnUSD.waitForDeployment();
  console.log(`✅ FnUSD              : ${await fnUSD.getAddress()}`);

  // ── 4. PriceFeed ──────────────────────────────────────────────────────────
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy(primaryOracle, fallbackOracle);
  await priceFeed.waitForDeployment();
  console.log(`✅ PriceFeed          : ${await priceFeed.getAddress()}`);

  // ── 5. Pools ──────────────────────────────────────────────────────────────
  const ActivePool = await ethers.getContractFactory("ActivePool");
  const activePool = await ActivePool.deploy(
    await registry.getAddress(),
    await wzkLTC.getAddress()
  );
  await activePool.waitForDeployment();
  console.log(`✅ ActivePool         : ${await activePool.getAddress()}`);

  const DefaultPool = await ethers.getContractFactory("DefaultPool");
  const defaultPool = await DefaultPool.deploy(
    await registry.getAddress(),
    await wzkLTC.getAddress()
  );
  await defaultPool.waitForDeployment();
  console.log(`✅ DefaultPool        : ${await defaultPool.getAddress()}`);

  const CollSurplusPool = await ethers.getContractFactory("CollSurplusPool");
  const collSurplusPool = await CollSurplusPool.deploy(
    await registry.getAddress(),
    await wzkLTC.getAddress()
  );
  await collSurplusPool.waitForDeployment();
  console.log(`✅ CollSurplusPool    : ${await collSurplusPool.getAddress()}`);

  const GasPool = await ethers.getContractFactory("GasPool");
  const gasPool = await GasPool.deploy(await registry.getAddress());
  await gasPool.waitForDeployment();
  console.log(`✅ GasPool            : ${await gasPool.getAddress()}`);

  // ── 6. SortedTroves ───────────────────────────────────────────────────────
  const SortedTroves = await ethers.getContractFactory("SortedTroves");
  const sortedTroves = await SortedTroves.deploy(await registry.getAddress());
  await sortedTroves.waitForDeployment();
  console.log(`✅ SortedTroves       : ${await sortedTroves.getAddress()}`);

  // ── 7. Core logic ─────────────────────────────────────────────────────────
  const TroveManager = await ethers.getContractFactory("TroveManager");
  const troveManager = await TroveManager.deploy(await registry.getAddress());
  await troveManager.waitForDeployment();
  console.log(`✅ TroveManager       : ${await troveManager.getAddress()}`);

  const BorrowerOperations = await ethers.getContractFactory("BorrowerOperations");
  const borrowerOps = await BorrowerOperations.deploy(await registry.getAddress());
  await borrowerOps.waitForDeployment();
  console.log(`✅ BorrowerOperations : ${await borrowerOps.getAddress()}`);

  const RedemptionHelper = await ethers.getContractFactory("RedemptionHelper");
  const redemptionHelper = await RedemptionHelper.deploy(await registry.getAddress());
  await redemptionHelper.waitForDeployment();
  console.log(`✅ RedemptionHelper   : ${await redemptionHelper.getAddress()}`);

  // ── 8. Helpers ────────────────────────────────────────────────────────────
  const HintHelpers = await ethers.getContractFactory("HintHelpers");
  const hintHelpers = await HintHelpers.deploy(await registry.getAddress());
  await hintHelpers.waitForDeployment();
  console.log(`✅ HintHelpers        : ${await hintHelpers.getAddress()}`);

  const CollateralRegistry = await ethers.getContractFactory("CollateralRegistry");
  const collateralRegistry = await CollateralRegistry.deploy(deployer.address);
  await collateralRegistry.waitForDeployment();
  console.log(`✅ CollateralRegistry : ${await collateralRegistry.getAddress()}`);

  // ── 9. Freeze the registry ────────────────────────────────────────────────
  console.log("\n🔒 Freezing AddressesRegistry...");
  const tx = await registry.setAddresses({
    collateralToken:    await wzkLTC.getAddress(),
    fnUSD:              await fnUSD.getAddress(),
    priceFeed:          await priceFeed.getAddress(),
    borrowerOperations: await borrowerOps.getAddress(),
    troveManager:       await troveManager.getAddress(),
    sortedTroves:       await sortedTroves.getAddress(),
    activePool:         await activePool.getAddress(),
    defaultPool:        await defaultPool.getAddress(),
    collSurplusPool:    await collSurplusPool.getAddress(),
    gasPool:            await gasPool.getAddress(),
    treasury:           treasury,
    redemptionHelper:   await redemptionHelper.getAddress(),
    hintHelpers:        await hintHelpers.getAddress(),
    collateralRegistry: await collateralRegistry.getAddress(),
  });
  await tx.wait();
  console.log("✅ Registry frozen — addresses immutable");

  // ── 10. Register WzkLTC in CollateralRegistry ─────────────────────────────
  const MCR = ethers.parseEther("1.3"); // 130%
  await (await collateralRegistry.addCollateral(
    await wzkLTC.getAddress(),
    MCR,
    await registry.getAddress()
  )).wait();
  console.log("✅ WzkLTC registered as collateral @ 130% MCR");

  // ── 11. Build deployment output ───────────────────────────────────────────
  const addresses = {
    network:            network.name,
    chainId:            network.config.chainId,
    deployedAt:         new Date().toISOString(),
    deployer:           deployer.address,
    treasury,
    AddressesRegistry:  await registry.getAddress(),
    WzkLTC:             await wzkLTC.getAddress(),
    FnUSD:              await fnUSD.getAddress(),
    PriceFeed:          await priceFeed.getAddress(),
    ActivePool:         await activePool.getAddress(),
    DefaultPool:        await defaultPool.getAddress(),
    CollSurplusPool:    await collSurplusPool.getAddress(),
    GasPool:            await gasPool.getAddress(),
    SortedTroves:       await sortedTroves.getAddress(),
    TroveManager:       await troveManager.getAddress(),
    BorrowerOperations: await borrowerOps.getAddress(),
    RedemptionHelper:   await redemptionHelper.getAddress(),
    HintHelpers:        await hintHelpers.getAddress(),
    CollateralRegistry: await collateralRegistry.getAddress(),
  };

  // Write to contracts/deployments/<network>.json
  const deploymentsDir = join(__dirname, "..", "deployments");
  if (!existsSync(deploymentsDir)) mkdirSync(deploymentsDir);
  const outPath = join(deploymentsDir, `${network.name}.json`);
  writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log(`\n📄 Addresses saved → contracts/deployments/${network.name}.json`);

  // Also write to frontend src/lib/contracts.ts so the UI picks them up
  const frontendPath = join(__dirname, "..", "..", "src", "lib", "contracts.ts");
  const frontendContent = `// Auto-generated by deploy script — do not edit manually
// Network: ${network.name} | ChainId: ${network.config.chainId}
// Deployed: ${new Date().toISOString()}

export const CONTRACTS = ${JSON.stringify(addresses, null, 2)} as const;

export type ContractName = keyof typeof CONTRACTS;
`;
  writeFileSync(frontendPath, frontendContent);
  console.log(`📄 Frontend contracts → src/lib/contracts.ts`);

  console.log("\n══════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
