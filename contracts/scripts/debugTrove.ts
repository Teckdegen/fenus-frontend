// Debug script — checks the state of the protocol after a trove open attempt
import { ethers } from "hardhat";
import "dotenv/config";

const ADDRESSES = {
  WzkLTC:             "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec",
  FnUSD:              "0x18133333D7d43CD651D2432C14Fa98D95D46b34c",
  BorrowerOperations: "0x804a416219c77559F4c0285C96Eaa9207BD27583",
  TroveManager:       "0x7Fdb194D18AfCc3B108779F56D0a2Cf5c3086F82",
  ActivePool:         "0xC05a0d9Edd9dEFa5e6821938837afFE1a4133AF8",
  PriceFeed:          "0x09E1D75E698d9Bc96829687e3d8d1908D4a8d077",
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
];
const TM_ABI = [
  "function getTroveStatus(address) view returns (uint8)",
  "function getTroveColl(address) view returns (uint256)",
  "function getTroveDebt(address) view returns (uint256)",
  "function getEntireDebtAndColl(address) view returns (uint256 debt, uint256 coll, uint256 pendingInterest)",
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
const BO_ABI = [
  "function closeTrove() external",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const user = signer.address;

  const wzkLTC = new ethers.Contract(ADDRESSES.WzkLTC, ERC20_ABI, signer);
  const fnUSD  = new ethers.Contract(ADDRESSES.FnUSD,  ERC20_ABI, signer);
  const tm     = new ethers.Contract(ADDRESSES.TroveManager, TM_ABI, signer);
  const ap     = new ethers.Contract(ADDRESSES.ActivePool, AP_ABI, signer);
  const pf     = new ethers.Contract(ADDRESSES.PriceFeed, PF_ABI, signer);
  const bo     = new ethers.Contract(ADDRESSES.BorrowerOperations, BO_ABI, signer);

  console.log("\n══════════════════════════════════════════");
  console.log("  FENUS Debug — Close Trove Investigation");
  console.log("══════════════════════════════════════════");
  console.log(`  Wallet: ${user}`);

  // ── Balances ──────────────────────────────────────────────────────────────
  const wzkBal  = await wzkLTC.balanceOf(user);
  const fnBal   = await fnUSD.balanceOf(user);
  console.log(`\n── Balances ──`);
  console.log(`  WzkLTC : ${ethers.formatUnits(wzkBal, 8)} WzkLTC`);
  console.log(`  FnUSD  : ${ethers.formatUnits(fnBal, 6)} FnUSD`);

  // ── Trove state ───────────────────────────────────────────────────────────
  const troveStatus = await tm.getTroveStatus(user);
  const troveColl   = await tm.getTroveColl(user);
  const troveDebt   = await tm.getTroveDebt(user);
  const [entireDebt, entireColl, pendingInterest] = await tm.getEntireDebtAndColl(user);
  const troveCount  = await tm.getTroveOwnersCount();

  console.log(`\n── Trove State ──`);
  console.log(`  Status          : ${troveStatus} (0=NonExistent, 1=Active, 2=ClosedByOwner)`);
  console.log(`  Recorded coll   : ${ethers.formatUnits(troveColl, 18)} (18-dec)`);
  console.log(`  Recorded debt   : ${ethers.formatUnits(troveDebt, 18)} FnUSD`);
  console.log(`  Entire debt     : ${ethers.formatUnits(entireDebt, 18)} FnUSD (incl. interest)`);
  console.log(`  Pending interest: ${ethers.formatUnits(pendingInterest, 18)} FnUSD`);
  console.log(`  Total Troves    : ${troveCount}`);

  // ── Active Pool ───────────────────────────────────────────────────────────
  const apColl = await ap.getCollateral();
  const apDebt = await ap.getDebt();
  console.log(`\n── Active Pool ──`);
  console.log(`  Collateral : ${ethers.formatUnits(apColl, 18)}`);
  console.log(`  Debt       : ${ethers.formatUnits(apDebt, 18)}`);

  // ── Price ─────────────────────────────────────────────────────────────────
  const price = await pf.getLastGoodPrice();
  console.log(`\n── Price ──`);
  console.log(`  LTC/USD : $${ethers.formatEther(price)}`);

  // ── Simulate closeTrove ───────────────────────────────────────────────────
  if (troveStatus === 1n) {
    console.log(`\n── Simulate closeTrove ──`);
    // Check if user has enough FnUSD
    const debtIn6 = entireDebt / BigInt(1e12); // 18-dec → 6-dec
    console.log(`  Need to repay : ${ethers.formatUnits(entireDebt, 18)} FnUSD`);
    console.log(`  FnUSD balance : ${ethers.formatUnits(fnBal, 6)} FnUSD`);
    if (fnBal >= debtIn6) {
      console.log(`  ✅ Have enough FnUSD to close`);
      try {
        await bo.closeTrove.staticCall();
        console.log(`  ✅ staticCall succeeded — closeTrove would work`);
      } catch (e: any) {
        console.log(`  ❌ staticCall failed: ${e.message}`);
        if (e.data) console.log(`  Revert data: ${e.data}`);
      }
    } else {
      const shortfall = debtIn6 - fnBal;
      console.log(`  ❌ Not enough FnUSD — short by ${ethers.formatUnits(shortfall, 6)} FnUSD`);
    }
  } else {
    console.log(`\n  No active Trove found for this wallet`);
  }

  console.log("\n══════════════════════════════════════════\n");
}

main().catch(e => { console.error(e); process.exit(1); });
