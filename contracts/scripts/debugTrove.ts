// Debug script — checks the state of the protocol after a trove open attempt
import { ethers } from "hardhat";
import "dotenv/config";

const ADDRESSES = {
  WzkLTC:             "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec",
  FnUSD:              "0x8Ed0987b36655AF304c65DFea3c5eb55478f3B95",
  BorrowerOperations: "0xECd7164FE6147d697c6846b5Ee6A29CA0E83F3fE",
  TroveManager:       "0xeD76DA416B3684Bb79839BC71C2F68782AAcff39",
  ActivePool:         "0xF3499196F8bd6E6d499a5A68dbeD30C78137e940",
  PriceFeed:          "0x00081D91D90c2D980793543f9ED67124229dAeE2",
  AddressesRegistry:  "0xC84D1e9C9Acc23254E7202a0a549e6c93D1bE6dB",
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];
const TM_ABI = [
  "function getTroveStatus(address) view returns (uint8)",
  "function getTroveColl(address) view returns (uint256)",
  "function getTroveDebt(address) view returns (uint256)",
  "function getTroveOwnersCount() view returns (uint256)",
];
const AP_ABI = [
  "function getCollateral() view returns (uint256)",
  "function getDebt() view returns (uint256)",
];
const PF_ABI = [
  "function getLastGoodPrice() view returns (uint256)",
  "function status() view returns (uint8)",
];
const REG_ABI = [
  "function isInitialized() view returns (bool)",
  "function addresses() view returns (tuple(address collateralToken,address fnUSD,address priceFeed,address borrowerOperations,address troveManager,address sortedTroves,address activePool,address defaultPool,address collSurplusPool,address gasPool,address treasury,address redemptionHelper,address hintHelpers,address collateralRegistry))",
];
const BO_ABI = [
  "function openTrove(uint256 collAmount, uint256 fnUSDAmount6, address upperHint, address lowerHint) external",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const user = signer.address;

  console.log("\n══════════════════════════════════════════");
  console.log("  FENUS Protocol Debug");
  console.log("══════════════════════════════════════════");
  console.log(`  Wallet: ${user}`);

  const wzkLTC = new ethers.Contract(ADDRESSES.WzkLTC, ERC20_ABI, signer);
  const fnUSD  = new ethers.Contract(ADDRESSES.FnUSD,  ERC20_ABI, signer);
  const tm     = new ethers.Contract(ADDRESSES.TroveManager, TM_ABI, signer);
  const ap     = new ethers.Contract(ADDRESSES.ActivePool, AP_ABI, signer);
  const pf     = new ethers.Contract(ADDRESSES.PriceFeed, PF_ABI, signer);
  const reg    = new ethers.Contract(ADDRESSES.AddressesRegistry, REG_ABI, signer);

  // ── Balances ──────────────────────────────────────────────────────────────
  console.log("\n── Balances ──");
  const wzkBal  = await wzkLTC.balanceOf(user);
  const fnBal   = await fnUSD.balanceOf(user);
  const allowance = await wzkLTC.allowance(user, ADDRESSES.BorrowerOperations);
  console.log(`  WzkLTC balance    : ${ethers.formatUnits(wzkBal, 8)} WzkLTC`);
  console.log(`  FnUSD balance     : ${ethers.formatUnits(fnBal, 6)} FnUSD`);
  console.log(`  WzkLTC allowance  : ${ethers.formatUnits(allowance, 8)} WzkLTC (for BorrowerOps)`);

  // ── Registry ──────────────────────────────────────────────────────────────
  console.log("\n── Registry ──");
  const initialized = await reg.isInitialized();
  console.log(`  Initialized: ${initialized}`);
  if (initialized) {
    const addrs = await reg.addresses();
    console.log(`  collateralToken : ${addrs.collateralToken}`);
    console.log(`  fnUSD           : ${addrs.fnUSD}`);
    console.log(`  troveManager    : ${addrs.troveManager}`);
    console.log(`  borrowerOps     : ${addrs.borrowerOperations}`);
    console.log(`  activePool      : ${addrs.activePool}`);
    console.log(`  priceFeed       : ${addrs.priceFeed}`);
  }

  // ── Price feed ────────────────────────────────────────────────────────────
  console.log("\n── Price Feed ──");
  const lastPrice = await pf.getLastGoodPrice();
  const pfStatus  = await pf.status();
  console.log(`  lastGoodPrice : ${ethers.formatEther(lastPrice)} USD`);
  console.log(`  status        : ${pfStatus} (0=Live, 1=ShutdownGrace, 2=Shutdown)`);

  // ── Trove state ───────────────────────────────────────────────────────────
  console.log("\n── Trove State ──");
  const troveStatus = await tm.getTroveStatus(user);
  const troveColl   = await tm.getTroveColl(user);
  const troveDebt   = await tm.getTroveDebt(user);
  const troveCount  = await tm.getTroveOwnersCount();
  console.log(`  Status        : ${troveStatus} (0=NonExistent, 1=Active, 2=ClosedByOwner, 3=ClosedByLiq, 4=ClosedByRedemption)`);
  console.log(`  Collateral    : ${ethers.formatUnits(troveColl, 18)} (18-dec internal)`);
  console.log(`  Debt          : ${ethers.formatUnits(troveDebt, 18)} FnUSD (18-dec internal)`);
  console.log(`  Total Troves  : ${troveCount}`);

  // ── Active Pool ───────────────────────────────────────────────────────────
  console.log("\n── Active Pool ──");
  const apColl = await ap.getCollateral();
  const apDebt = await ap.getDebt();
  console.log(`  Collateral : ${ethers.formatUnits(apColl, 18)}`);
  console.log(`  Debt       : ${ethers.formatUnits(apDebt, 18)}`);

  // ── Simulate openTrove ────────────────────────────────────────────────────
  console.log("\n── Simulate openTrove(1 WzkLTC, 10 FnUSD) ──");
  const bo = new ethers.Contract(ADDRESSES.BorrowerOperations, BO_ABI, signer);
  // WzkLTC is 8 dec, so 1 WzkLTC = 1e8
  // FnUSD external is 6 dec, so 10 FnUSD = 10e6
  const testColl  = ethers.parseUnits("1", 8);
  const testFnUSD = ethers.parseUnits("10", 6);
  try {
    await bo.openTrove.staticCall(testColl, testFnUSD,
      ethers.ZeroAddress, ethers.ZeroAddress);
    console.log("  ✅ staticCall succeeded — openTrove would work");
  } catch (e: any) {
    console.log(`  ❌ staticCall failed: ${e.message}`);
    // Try to decode the revert reason
    if (e.data) console.log(`  Revert data: ${e.data}`);
  }

  console.log("\n══════════════════════════════════════════\n");
}

main().catch(e => { console.error(e); process.exit(1); });
