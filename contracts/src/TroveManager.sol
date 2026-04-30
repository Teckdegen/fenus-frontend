// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {IActivePool, IDefaultPool, ICollSurplusPool, IGasPool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {Constants} from "./Constants.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";
import {Decimals} from "./libraries/Decimals.sol";

// TroveManager — core accounting engine for all Troves.
//
// Responsibilities:
//   - Stores every Trove's debt, collateral, stake, interest rate, and status
//   - Tracks redistribution running totals (L_coll, L_debt) for the error-correction
//     snapshot mechanism — each Trove lazily absorbs its share of redistributed
//     assets on its next interaction
//   - Accrues per-Trove interest continuously based on annualInterestRate
//   - Executes liquidations: seizes collateral, cancels debt, distributes surplus
//   - Executes batch liquidations in a single tx
//   - Exposes view functions used by SortedTroves, the bot, and the frontend
//
// Liquidation distribution (per Constants.sol):
//   debtValue of coll → split 50/50 FnUSD+zkLTC to Addax LP (via treasury routing)
//   surplus coll      → 60% treasury, 40% redistributed to active Trove holders
//
// Interest model:
//   Each Trove has a user-set annualInterestRate (0.5%–250%).
//   Interest accrues continuously: pendingInterest = debt × rate × timeElapsed / SECONDS_PER_YEAR
//   Interest is added to the Trove's recorded debt on every interaction.
//   Accrued interest is minted as new FnUSD and sent to the treasury.
contract TroveManager is ITroveManager {
    IAddressesRegistry public immutable registry;

    // ─── Trove storage ────────────────────────────────────────────────────────

    struct TroveData {
        uint256 debt;               // 18-dec recorded debt (principal + accrued interest)
        uint256 coll;               // 18-dec collateral
        uint256 stake;              // proportional stake for redistribution
        uint256 annualInterestRate; // 18-dec, user-set
        uint256 lastInterestTime;   // timestamp of last interest accrual
        // Redistribution snapshots — used to compute pending gains lazily
        uint256 rewardSnapColl;     // L_coll at time of last snapshot
        uint256 rewardSnapDebt;     // L_debt at time of last snapshot
        Status  status;
    }

    mapping(address => TroveData) public troves;
    address[] public troveOwners;

    // ─── Redistribution running totals ────────────────────────────────────────
    // L_coll and L_debt are per-unit-of-stake running sums.
    // When a Trove is redistributed into, all active Troves gain:
    //   pendingCollGain = stake × (L_coll - rewardSnapColl)
    //   pendingDebtGain = stake × (L_debt - rewardSnapDebt)
    uint256 public L_coll;
    uint256 public L_debt;

    // Total active stake — sum of all Trove stakes
    uint256 public totalStakes;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TroveOpened(address indexed owner, uint256 debt, uint256 coll, uint256 annualRate);
    event TroveUpdated(address indexed owner, uint256 debt, uint256 coll, uint256 stake, uint8 operation);
    event TroveLiquidated(address indexed owner, uint256 debt, uint256 coll, uint8 liquidationMode);
    event TroveClosed(address indexed owner, Status status);
    event Liquidation(uint256 liquidatedDebt, uint256 liquidatedColl, uint256 surplusColl);
    event InterestAccrued(address indexed owner, uint256 interest);
    event RedemptionApplied(address indexed owner, uint256 debtReduced, uint256 collReduced);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotAuthorized();
    error TroveNotActive();
    error TroveAlreadyExists();
    error ICRAboveMCR();
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

    modifier onlyBOorTM() {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (msg.sender != a.borrowerOperations && msg.sender != address(this)) revert NotAuthorized();
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
    ) external override onlyBO {
        if (troves[owner].status == Status.Active) revert TroveAlreadyExists();

        TroveData storage t = troves[owner];
        t.debt               = debt;
        t.coll               = coll;
        t.annualInterestRate = Constants.ANNUAL_INTEREST_RATE; // fixed 1%
        t.lastInterestTime   = block.timestamp;
        t.status             = Status.Active;
        t.rewardSnapColl     = L_coll;
        t.rewardSnapDebt     = L_debt;

        uint256 stake = _computeStake(coll);
        t.stake      = stake;
        totalStakes  += stake;

        troveOwners.push(owner);

        emit TroveOpened(owner, debt, coll, Constants.ANNUAL_INTEREST_RATE);
        emit TroveUpdated(owner, debt, coll, stake, 0);
    }

    function adjustTrove(
        address owner,
        int256 collDelta,
        int256 debtDelta
    ) external override {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (msg.sender != a.borrowerOperations && msg.sender != a.redemptionHelper) {
            revert NotAuthorized();
        }

        TroveData storage t = troves[owner];
        if (t.status != Status.Active) revert TroveNotActive();

        // Accrue interest before adjusting
        _accrueInterest(owner, a);

        // Apply pending redistribution gains
        _applyPendingRewards(owner);

        // Apply deltas
        if (collDelta > 0) t.coll += uint256(collDelta);
        else if (collDelta < 0) t.coll -= uint256(-collDelta);

        if (debtDelta > 0) t.debt += uint256(debtDelta);
        else if (debtDelta < 0) t.debt -= uint256(-debtDelta);

        // Update stake
        totalStakes -= t.stake;
        t.stake      = _computeStake(t.coll);
        totalStakes += t.stake;

        // Update snapshots
        t.rewardSnapColl = L_coll;
        t.rewardSnapDebt = L_debt;

        emit TroveUpdated(owner, t.debt, t.coll, t.stake, 1);
    }

    function closeTrove(address owner) external override {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (msg.sender != a.borrowerOperations && msg.sender != a.redemptionHelper) {
            revert NotAuthorized();
        }

        TroveData storage t = troves[owner];
        if (t.status != Status.Active) revert TroveNotActive();

        // Accrue final interest
        _accrueInterest(owner, a);

        // Remove stake
        totalStakes -= t.stake;
        t.stake      = 0;

        t.status = (msg.sender == a.redemptionHelper)
            ? Status.ClosedByRedemption
            : Status.ClosedByOwner;

        _removeTroveOwner(owner);

        emit TroveClosed(owner, t.status);
        emit TroveUpdated(owner, 0, 0, 0, 2);
    }

    // ─── Liquidation ──────────────────────────────────────────────────────────

    function liquidate(address owner) external override {
        address[] memory batch = new address[](1);
        batch[0] = owner;
        _batchLiquidate(batch);
    }

    function batchLiquidate(address[] calldata owners) external override {
        _batchLiquidate(owners);
    }

    function _batchLiquidate(address[] memory owners) internal {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        IPriceFeed priceFeed = IPriceFeed(a.priceFeed);

        (uint256 price,) = priceFeed.fetchPrice();

        uint256 totalLiquidatedDebt;
        uint256 totalLiquidatedColl;
        uint256 totalSurplus;

        bool liquidatedAny = false;

        for (uint256 i = 0; i < owners.length; i++) {
            address owner = owners[i];
            TroveData storage t = troves[owner];

            if (t.status != Status.Active) continue;

            // Accrue interest before checking ICR
            _accrueInterest(owner, a);
            _applyPendingRewards(owner);

            uint256 icr = LiquityMath._computeCR(t.coll, t.debt, price);
            if (icr >= Constants.MCR) continue; // not eligible

            uint256 debt = t.debt;
            uint256 coll = t.coll;

            // ── Liquidation math ──────────────────────────────────────────────
            // debtValueInColl = debt / price (collateral worth exactly the debt)
            uint256 debtValueInColl = (debt * Constants.DECIMAL_PRECISION) / price;

            uint256 surplusColl;
            uint256 collForLP;
            uint256 collForTreasury;
            uint256 collForHolders;

            if (debtValueInColl <= coll) {
                surplusColl = coll - debtValueInColl;

                // Debt portion: goes to Addax LP (via treasury as routing address)
                collForLP = debtValueInColl;

                // Surplus split: 60% treasury, 40% redistributed to Trove holders
                collForTreasury = (surplusColl * Constants.LIQUIDATION_TREASURY_SHARE)
                    / Constants.DECIMAL_PRECISION;
                collForHolders  = surplusColl - collForTreasury;
            } else {
                // Coll < debt value (deep underwater) — all coll goes to LP
                collForLP       = coll;
                collForTreasury = 0;
                collForHolders  = 0;
                surplusColl     = 0;
            }

            // ── Remove Trove ──────────────────────────────────────────────────
            totalStakes -= t.stake;
            t.stake      = 0;
            t.status     = Status.ClosedByLiquidation;
            _removeTroveOwner(owner);

            // ── Redistribute holder share via DefaultPool ─────────────────────
            if (collForHolders > 0 && totalStakes > 0) {
                IActivePool  activePool  = IActivePool(a.activePool);
                IDefaultPool defaultPool = IDefaultPool(a.defaultPool);

                // Move collateral from ActivePool to DefaultPool
                activePool.sendCollateral(a.defaultPool, collForHolders);
                defaultPool.creditCollateral(collForHolders);
                defaultPool.increaseDebt(debt);

                // Update running totals (per-unit-of-stake)
                L_coll += (collForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
                L_debt += (debt          * Constants.DECIMAL_PRECISION) / totalStakes;
            }

            // ── Send LP portion to treasury (treasury routes to Addax) ────────
            if (collForLP > 0) {
                IActivePool(a.activePool).sendCollateral(a.treasury, collForLP);
            }

            // ── Send treasury surplus ─────────────────────────────────────────
            if (collForTreasury > 0) {
                IActivePool(a.activePool).sendCollateral(a.treasury, collForTreasury);
            }

            // ── Burn the debt ─────────────────────────────────────────────────
            IFnUSD(a.fnUSD).burn(a.gasPool, debt);

            // ── Pay gas compensation to liquidation bot ───────────────────────
            IGasPool(a.gasPool).payLiquidator(msg.sender, GasPool(a.gasPool).GAS_COMPENSATION());

            totalLiquidatedDebt += debt;
            totalLiquidatedColl += coll;
            totalSurplus        += surplusColl;
            liquidatedAny        = true;

            emit TroveLiquidated(owner, debt, coll, 0);
            emit TroveUpdated(owner, 0, 0, 0, 4);
        }

        if (!liquidatedAny) revert NothingToLiquidate();

        emit Liquidation(totalLiquidatedDebt, totalLiquidatedColl, totalSurplus);
    }

    // ─── Redemption (called by RedemptionHelper) ──────────────────────────────

    // RedemptionHelper calls adjustTrove / closeTrove directly.
    // This stub satisfies the ITroveManager interface for any external callers.
    function redeem(
        uint256 fnUSDAmount18,
        address firstHint,
        uint256 maxIterations
    ) external override onlyRedemptionHelper returns (uint256 collOut) {
        // Actual redemption logic lives in RedemptionHelper.
        // TroveManager exposes adjustTrove/closeTrove which RedemptionHelper calls per-Trove.
        revert NotAuthorized();
    }

    // ─── Fee rate views (delegates to RedemptionHelper) ───────────────────────

    function baseRate() external view override returns (uint256) { return 0; }

    function getRedemptionFeeRate() external view override returns (uint256) {
        return Constants.REDEMPTION_FEE_FLOOR;
    }

    function getRedemptionRateWithDecay() external view override returns (uint256) {
        return Constants.REDEMPTION_FEE_FLOOR;
    }

    // ─── Interest accrual ─────────────────────────────────────────────────────

    function _accrueInterest(
        address owner,
        IAddressesRegistry.Addresses memory a
    ) internal {
        TroveData storage t = troves[owner];
        if (t.status != Status.Active) return;

        uint256 elapsed = block.timestamp - t.lastInterestTime;
        if (elapsed == 0) return;

        // interest = debt × rate × elapsed / SECONDS_PER_YEAR
        uint256 interest = (t.debt * t.annualInterestRate * elapsed)
            / (Constants.DECIMAL_PRECISION * Constants.SECONDS_PER_YEAR);

        if (interest == 0) return;

        t.debt             += interest;
        t.lastInterestTime  = block.timestamp;

        // Mint accrued interest as new FnUSD to treasury
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

        // Move the coll from DefaultPool back to ActivePool
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (pendingColl > 0) {
            IDefaultPool(a.defaultPool).sendCollateralToActivePool(pendingColl);
            IDefaultPool(a.defaultPool).decreaseDebt(pendingDebt);
        }
    }

    // ─── Stake computation ────────────────────────────────────────────────────

    // Stake is proportional to collateral. Simple 1:1 for now.
    function _computeStake(uint256 coll) internal pure returns (uint256) {
        return coll;
    }

    // ─── Owner array management ───────────────────────────────────────────────

    function _removeTroveOwner(address owner) internal {
        uint256 len = troveOwners.length;
        for (uint256 i = 0; i < len; i++) {
            if (troveOwners[i] == owner) {
                troveOwners[i] = troveOwners[len - 1];
                troveOwners.pop();
                return;
            }
        }
    }

    // ─── Internal view ────────────────────────────────────────────────────────

    function _getEntireDebtAndColl(address owner)
        internal view
        returns (uint256 debt, uint256 coll, uint256 pendingInterest)
    {
        TroveData storage t = troves[owner];

        // Pending redistribution gains
        uint256 pendingColl = (t.stake * (L_coll - t.rewardSnapColl)) / Constants.DECIMAL_PRECISION;
        uint256 pendingDebt = (t.stake * (L_debt - t.rewardSnapDebt)) / Constants.DECIMAL_PRECISION;

        // Pending interest (not yet accrued)
        uint256 elapsed = block.timestamp - t.lastInterestTime;
        pendingInterest = (t.debt * t.annualInterestRate * elapsed)
            / (Constants.DECIMAL_PRECISION * Constants.SECONDS_PER_YEAR);

        debt = t.debt + pendingDebt + pendingInterest;
        coll = t.coll + pendingColl;
    }
}

// Minimal interface to read GAS_COMPENSATION from GasPool
interface GasPool {
    function GAS_COMPENSATION() external view returns (uint256);
}
