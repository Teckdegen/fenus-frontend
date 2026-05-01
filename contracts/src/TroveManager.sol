// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {IActivePool, IDefaultPool, ICollSurplusPool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {Constants} from "./Constants.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";
import {Decimals} from "./libraries/Decimals.sol";

// TroveManager core accounting engine for all Troves.
//
// Security hardening applied:
// [1] ReentrancyGuard on all state-changing external functions
// [2] O(1) Trove owner removal via index mapping (no linear scan)
// [3] Interest accrual capped at MAX_INTEREST_PER_PERIOD to prevent
// unbounded minting from stale Troves
// [4] DefaultPool debt tracking fixed only redistributed debt (not full
// liquidated debt) is recorded, matching the collateral actually sent
// [5] SortedTroves re-insertion after redemption adjustments
// [6] Price manipulation protection minimum collateral ratio enforced
// with a 5% buffer above MCR on new positions
contract TroveManager is ITroveManager, ReentrancyGuard {
 IAddressesRegistry public immutable registry;

 // ─── Trove storage ────────────────────────────────────────────────────────

 struct TroveData {
 uint256 debt; // 18-dec recorded debt (principal + accrued interest)
 uint256 coll; // 18-dec collateral
 uint256 stake; // proportional stake for redistribution
 uint256 annualInterestRate; // 18-dec fixed rate
 uint256 lastInterestTime; // timestamp of last interest accrual
 uint256 rewardSnapColl; // L_coll snapshot at last interaction
 uint256 rewardSnapDebt; // L_debt snapshot at last interaction
 Status status;
 }

 mapping(address => TroveData) public troves;

 // FIX [2]: O(1) owner removal store index alongside the array
 address[] public troveOwners;
 mapping(address => uint256) private _troveIndex; // owner → index in troveOwners

 // ─── Redistribution running totals ────────────────────────────────────────

 uint256 public L_coll;
 uint256 public L_debt;
 uint256 public totalStakes;

 // FIX [3]: Cap interest accrual to 10 years worth in a single call.
 // Prevents a Trove untouched for decades from minting enormous FnUSD.
 uint256 private constant MAX_INTEREST_PERIOD = 10 * 365 days;

 // ─── Events ───────────────────────────────────────────────────────────────

 event TroveOpened(address indexed owner, uint256 debt, uint256 coll, uint256 annualRate);
 event TroveUpdated(address indexed owner, uint256 debt, uint256 coll, uint256 stake, uint8 operation);
 event TroveLiquidated(address indexed owner, uint256 debt, uint256 coll, uint8 liquidationMode);
 event TroveClosed(address indexed owner, Status status);
 event Liquidation(uint256 liquidatedDebt, uint256 liquidatedColl, uint256 surplusColl);
 event InterestAccrued(address indexed owner, uint256 interest);

 // ─── Errors ───────────────────────────────────────────────────────────────

 error NotAuthorized();
 error TroveNotActive();
 error TroveAlreadyExists();
 error NothingToLiquidate();

 // ─── Constructor ──────────────────────────────────────────────────────────

 constructor(IAddressesRegistry _registry) {
 registry = _registry;
 }

 // ─── Auth ─────────────────────────────────────────────────────────────────

 modifier onlyBO() {
 if (msg.sender != registry.addresses().borrowerOperations) revert NotAuthorized();
 _;
 }

 modifier onlyBOorRH() {
 IAddressesRegistry.Addresses memory a = registry.addresses();
 if (msg.sender != a.borrowerOperations && msg.sender != a.redemptionHelper) {
 revert NotAuthorized();
 }
 _;
 }

 modifier onlyRedemptionHelper() {
 if (msg.sender != registry.addresses().redemptionHelper) revert NotAuthorized();
 _;
 }

 // ─── View functions ───────────────────────────────────────────────────────

 function getTroveOwnersCount() external view override returns (uint256) {
 return troveOwners.length;
 }

 function getTroveStatus(address owner) external view override returns (Status) {
 return troves[owner].status;
 }

 function getTroveColl(address owner) external view override returns (uint256) {
 return troves[owner].coll;
 }

 function getTroveDebt(address owner) external view override returns (uint256) {
 return troves[owner].debt;
 }

 function getTroveAnnualInterestRate(address owner) external view override returns (uint256) {
 return troves[owner].annualInterestRate;
 }

 function getCurrentICR(address owner, uint256 price) external view override returns (uint256) {
 (uint256 debt, uint256 coll,) = _getEntireDebtAndColl(owner);
 return LiquityMath._computeCR(coll, debt, price);
 }

 function getNominalICR(address owner) external view override returns (uint256) {
 (uint256 debt, uint256 coll,) = _getEntireDebtAndColl(owner);
 return LiquityMath._computeNominalCR(coll, debt);
 }

 function getEntireDebtAndColl(address owner)
 external view override
 returns (uint256 debt, uint256 coll, uint256 pendingInterest)
 {
 return _getEntireDebtAndColl(owner);
 }

 // ─── BorrowerOperations callbacks ─────────────────────────────────────────

 function openTrove(
 address owner,
 uint256 coll,
 uint256 debt
 ) external override onlyBO nonReentrant {
 if (troves[owner].status == Status.Active) revert TroveAlreadyExists();

 TroveData storage t = troves[owner];
 t.debt = debt;
 t.coll = coll;
 t.annualInterestRate = Constants.ANNUAL_INTEREST_RATE;
 t.lastInterestTime = block.timestamp;
 t.status = Status.Active;
 t.rewardSnapColl = L_coll;
 t.rewardSnapDebt = L_debt;

 uint256 stake = _computeStake(coll);
 t.stake = stake;
 totalStakes += stake;

 // FIX [2]: record index before pushing
 _troveIndex[owner] = troveOwners.length;
 troveOwners.push(owner);

 emit TroveOpened(owner, debt, coll, Constants.ANNUAL_INTEREST_RATE);
 emit TroveUpdated(owner, debt, coll, stake, 0);
 }

 function adjustTrove(
 address owner,
 int256 collDelta,
 int256 debtDelta
 ) external override onlyBOorRH nonReentrant {
 IAddressesRegistry.Addresses memory a = registry.addresses();

 TroveData storage t = troves[owner];
 if (t.status != Status.Active) revert TroveNotActive();

 _accrueInterest(owner, a);
 _applyPendingRewards(owner);

 if (collDelta > 0) t.coll += uint256(collDelta);
 else if (collDelta < 0) t.coll -= uint256(-collDelta);

 if (debtDelta > 0) t.debt += uint256(debtDelta);
 else if (debtDelta < 0) t.debt -= uint256(-debtDelta);

 totalStakes -= t.stake;
 t.stake = _computeStake(t.coll);
 totalStakes += t.stake;

 t.rewardSnapColl = L_coll;
 t.rewardSnapDebt = L_debt;

 // FIX [5]: re-insert in SortedTroves after redemption adjusts debt/coll
 if (msg.sender == a.redemptionHelper) {
 uint256 newNICR = LiquityMath._computeNominalCR(t.coll, t.debt);
 ISortedTroves(a.sortedTroves).reInsert(owner, newNICR, address(0), address(0));
 }

 emit TroveUpdated(owner, t.debt, t.coll, t.stake, 1);
 }

 function closeTrove(address owner) external override onlyBOorRH nonReentrant {
 IAddressesRegistry.Addresses memory a = registry.addresses();

 TroveData storage t = troves[owner];
 if (t.status != Status.Active) revert TroveNotActive();

 _accrueInterest(owner, a);

 totalStakes -= t.stake;
 t.stake = 0;

 t.status = (msg.sender == a.redemptionHelper)
 ? Status.ClosedByRedemption
 : Status.ClosedByOwner;

 _removeTroveOwner(owner); // FIX [2]: O(1)

 emit TroveClosed(owner, t.status);
 emit TroveUpdated(owner, 0, 0, 0, 2);
 }

 // ─── Liquidation ──────────────────────────────────────────────────────────

 function liquidate(address owner) external override nonReentrant {
 address[] memory batch = new address[](1);
 batch[0] = owner;
 _batchLiquidate(batch);
 }

 function batchLiquidate(address[] calldata owners) external override nonReentrant {
 _batchLiquidate(owners);
 }

 function _batchLiquidate(address[] memory owners) internal {
 IAddressesRegistry.Addresses memory a = registry.addresses();
 (uint256 price,) = IPriceFeed(a.priceFeed).fetchPrice();

 uint256 totalLiquidatedDebt;
 uint256 totalLiquidatedColl;
 uint256 totalSurplus;
 bool liquidatedAny;

 for (uint256 i = 0; i < owners.length; i++) {
 address owner = owners[i];
 TroveData storage t = troves[owner];
 if (t.status != Status.Active) continue;

 _accrueInterest(owner, a);
 _applyPendingRewards(owner);

 uint256 icr = LiquityMath._computeCR(t.coll, t.debt, price);
 if (icr >= Constants.MCR) continue;

 uint256 debt = t.debt;
 uint256 coll = t.coll;

 // debtValueInColl = how much collateral covers the debt at current price
 uint256 debtValueInColl = (debt * Constants.DECIMAL_PRECISION) / price;

 uint256 surplusColl;
 uint256 collForLP;
 uint256 collForTreasury;
 uint256 collForHolders;

<<<<<<< HEAD
 if (debtValueInColl <= coll) {
 surplusColl = coll - debtValueInColl;
 collForLP = debtValueInColl;
 collForTreasury = (surplusColl * Constants.LIQUIDATION_TREASURY_SHARE)
 / Constants.DECIMAL_PRECISION;
 collForHolders = surplusColl - collForTreasury;
 } else {
 collForLP = coll;
 collForTreasury = 0;
 collForHolders = 0;
 surplusColl = 0;
 }
=======
            if (debtValueInColl <= coll) {
                surplusColl     = coll - debtValueInColl;
                // Debt-equivalent coll → Addax LP as FnUSD supply (not burned)
                collForLP       = debtValueInColl;
                // Surplus: 80% treasury, 20% Trove holders
                collForTreasury = (surplusColl * Constants.LIQUIDATION_TREASURY_SHARE)
                                  / Constants.DECIMAL_PRECISION;
                collForHolders  = surplusColl - collForTreasury;
            } else {
                // Deep underwater — all coll goes to LP
                collForLP       = coll;
                collForTreasury = 0;
                collForHolders  = 0;
                surplusColl     = 0;
            }
>>>>>>> 93a6f9d (jejej)

 // Remove Trove O(1) FIX [2]
 totalStakes -= t.stake;
 t.stake = 0;
 t.status = Status.ClosedByLiquidation;
 _removeTroveOwner(owner);

<<<<<<< HEAD
 // FIX [4]: redistribute only the holder share of collateral,
 // and only the proportional debt that corresponds to that collateral.
 // debtForHolders = debt × (collForHolders / coll)
 if (collForHolders > 0 && totalStakes > 0) {
 uint256 debtForHolders = (debt * collForHolders) / coll;
=======
            // Redistribute 20% holder share via DefaultPool
            if (collForHolders > 0 && totalStakes > 0) {
                uint256 debtForHolders = (debt * collForHolders) / coll;
>>>>>>> 93a6f9d (jejej)

 IActivePool(a.activePool).sendCollateral(a.defaultPool, collForHolders);
 IDefaultPool(a.defaultPool).creditCollateral(collForHolders);
 IDefaultPool(a.defaultPool).increaseDebt(debtForHolders);

<<<<<<< HEAD
 L_coll += (collForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
 L_debt += (debtForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
 }

 // LP portion + treasury surplus → treasury (routes to Addax)
 uint256 toTreasury = collForLP + collForTreasury;
 if (toTreasury > 0) {
 IActivePool(a.activePool).sendCollateral(a.treasury, toTreasury);
 }

 // Burn the debt
 IFnUSD(a.fnUSD).burn(a.gasPool, debt);

 // Pay gas compensation to bot
 IGasPool(a.gasPool).payLiquidator(msg.sender, GasPool(a.gasPool).GAS_COMPENSATION());
=======
                L_coll += (collForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
                L_debt += (debtForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
            }

            // LP portion + 80% treasury surplus → treasury
            // Treasury routes LP portion to Addax as FnUSD liquidity supply
            uint256 toTreasury = collForLP + collForTreasury;
            if (toTreasury > 0) {
                IActivePool(a.activePool).sendCollateral(a.treasury, toTreasury);
            }

            // No burn — FnUSD debt is absorbed by the LP supply sent to Addax.
            // No bot payment — liquidation caller receives no compensation.
            // The protocol keeps everything.
>>>>>>> 93a6f9d (jejej)

 totalLiquidatedDebt += debt;
 totalLiquidatedColl += coll;
 totalSurplus += surplusColl;
 liquidatedAny = true;

 emit TroveLiquidated(owner, debt, coll, 0);
 emit TroveUpdated(owner, 0, 0, 0, 4);
 }

 if (!liquidatedAny) revert NothingToLiquidate();
 emit Liquidation(totalLiquidatedDebt, totalLiquidatedColl, totalSurplus);
 }

 // ─── Redemption stub ──────────────────────────────────────────────────────

 function redeem(uint256, address, uint256) external override onlyRedemptionHelper returns (uint256) {
 revert NotAuthorized(); // logic lives in RedemptionHelper
 }

 // ─── Fee views ────────────────────────────────────────────────────────────

 function baseRate() external pure override returns (uint256) { return 0; }
 function getRedemptionFeeRate() external pure override returns (uint256) { return Constants.REDEMPTION_FEE_FLOOR; }
 function getRedemptionRateWithDecay() external pure override returns (uint256) { return Constants.REDEMPTION_FEE_FLOOR; }

 // ─── Interest accrual ─────────────────────────────────────────────────────

 function _accrueInterest(address owner, IAddressesRegistry.Addresses memory a) internal {
 TroveData storage t = troves[owner];
 if (t.status != Status.Active) return;

 // FIX [3]: cap elapsed time to prevent unbounded minting
 uint256 elapsed = block.timestamp - t.lastInterestTime;
 if (elapsed == 0) return;
 if (elapsed > MAX_INTEREST_PERIOD) elapsed = MAX_INTEREST_PERIOD;

 uint256 interest = (t.debt * t.annualInterestRate * elapsed)
 / (Constants.DECIMAL_PRECISION * Constants.SECONDS_PER_YEAR);

 if (interest == 0) return;

 t.debt += interest;
 t.lastInterestTime = block.timestamp;

 IFnUSD(a.fnUSD).mint(a.treasury, interest);
 emit InterestAccrued(owner, interest);
 }

 // ─── Redistribution reward application ────────────────────────────────────

 function _applyPendingRewards(address owner) internal {
 TroveData storage t = troves[owner];
 if (t.status != Status.Active) return;

 uint256 pendingColl = (t.stake * (L_coll - t.rewardSnapColl)) / Constants.DECIMAL_PRECISION;
 uint256 pendingDebt = (t.stake * (L_debt - t.rewardSnapDebt)) / Constants.DECIMAL_PRECISION;

 if (pendingColl == 0 && pendingDebt == 0) return;

 t.coll += pendingColl;
 t.debt += pendingDebt;
 t.rewardSnapColl = L_coll;
 t.rewardSnapDebt = L_debt;

 IAddressesRegistry.Addresses memory a = registry.addresses();
 if (pendingColl > 0) {
 IDefaultPool(a.defaultPool).sendCollateralToActivePool(pendingColl);
 IDefaultPool(a.defaultPool).decreaseDebt(pendingDebt);
 }
 }

 // ─── Stake ────────────────────────────────────────────────────────────────

 function _computeStake(uint256 coll) internal pure returns (uint256) {
 return coll;
 }

 // ─── FIX [2]: O(1) owner removal using swap-and-pop with index map ────────

 function _removeTroveOwner(address owner) internal {
 uint256 idx = _troveIndex[owner];
 uint256 lastIdx = troveOwners.length - 1;
 address lastOwner = troveOwners[lastIdx];

 troveOwners[idx] = lastOwner;
 _troveIndex[lastOwner] = idx;

 troveOwners.pop();
 delete _troveIndex[owner];
 }

 // ─── Internal view ────────────────────────────────────────────────────────

 function _getEntireDebtAndColl(address owner)
 internal view
 returns (uint256 debt, uint256 coll, uint256 pendingInterest)
 {
 TroveData storage t = troves[owner];

 uint256 pendingColl = (t.stake * (L_coll - t.rewardSnapColl)) / Constants.DECIMAL_PRECISION;
 uint256 pendingDebt = (t.stake * (L_debt - t.rewardSnapDebt)) / Constants.DECIMAL_PRECISION;

 uint256 elapsed = block.timestamp - t.lastInterestTime;
 if (elapsed > MAX_INTEREST_PERIOD) elapsed = MAX_INTEREST_PERIOD;

 pendingInterest = (t.debt * t.annualInterestRate * elapsed)
 / (Constants.DECIMAL_PRECISION * Constants.SECONDS_PER_YEAR);

 debt = t.debt + pendingDebt + pendingInterest;
 coll = t.coll + pendingColl;
 }
}

<<<<<<< HEAD
// Minimal interface to read GAS_COMPENSATION from GasPool
interface GasPool {
 function GAS_COMPENSATION() external view returns (uint256);
}
=======
// Minimal interface to read GAS_COMPENSATION from GasPool — unused, kept for reference
// interface GasPool { function GAS_COMPENSATION() external view returns (uint256); }
>>>>>>> 93a6f9d (jejej)
