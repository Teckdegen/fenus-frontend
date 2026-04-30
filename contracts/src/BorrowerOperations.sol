// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IBorrowerOperations} from "./interfaces/IBorrowerOperations.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {IActivePool, ICollSurplusPool, IGasPool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {Constants} from "./Constants.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";
import {Decimals} from "./libraries/Decimals.sol";

// BorrowerOperations — the user-facing entry point for all Trove management.
//
// Interest rate is fixed at 1% annually for all Troves — not user-configurable.
// Users interact only with this contract. It validates every operation,
// then delegates state changes to TroveManager, ActivePool, FnUSD, and SortedTroves.
//
// Operations:
//   openTrove       — deposit WzkLTC, mint FnUSD (1% fixed interest applied automatically)
//   addColl         — deposit more WzkLTC to an existing Trove
//   withdrawColl    — withdraw WzkLTC (must stay above MCR)
//   withdrawFnUSD   — borrow more FnUSD (must stay above MCR)
//   repayFnUSD      — repay FnUSD debt
//   closeTrove      — repay all debt, withdraw all collateral
//   claimCollateral — claim surplus collateral from CollSurplusPool
contract BorrowerOperations is IBorrowerOperations {
    using SafeERC20 for IERC20;

    IAddressesRegistry public immutable registry;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TroveOpened(address indexed owner, uint256 coll, uint256 debt);
    event CollateralAdded(address indexed owner, uint256 amount);
    event CollateralWithdrawn(address indexed owner, uint256 amount);
    event FnUSDBorrowed(address indexed owner, uint256 amount18);
    event FnUSDRepaid(address indexed owner, uint256 amount18);
    event TroveClosed(address indexed owner);
    event CollateralClaimed(address indexed owner, uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error TroveNotActive();
    error TroveAlreadyExists();
    error BelowMCR(uint256 icr, uint256 mcr);
    error BelowMinDebt(uint256 debt, uint256 minDebt);
    error ZeroAmount();
    error InsufficientFnUSDBalance();
    error PriceFeedDown();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    // ─── openTrove ────────────────────────────────────────────────────────────

    // Deposit `collAmount` WzkLTC, mint `fnUSDAmount6` FnUSD.
    // Interest is fixed at 1% — no rate parameter needed.
    function openTrove(
        uint256 collAmount,
        uint256 fnUSDAmount6,
        address upperHint,
        address lowerHint
    ) external override {
        if (collAmount == 0) revert ZeroAmount();
        if (fnUSDAmount6 == 0) revert ZeroAmount();

        IAddressesRegistry.Addresses memory a = registry.addresses();
        ITroveManager tm = ITroveManager(a.troveManager);

        if (tm.getTroveStatus(msg.sender) == ITroveManager.Status.Active) {
            revert TroveAlreadyExists();
        }

        uint256 fnUSDAmount18 = Decimals.to18(fnUSDAmount6);

        // Add origination fee to debt
        uint256 fee18   = (fnUSDAmount18 * Constants.ORIGINATION_FEE) / Constants.DECIMAL_PRECISION;
        uint256 netDebt = fnUSDAmount18 + fee18 + GasPool(a.gasPool).GAS_COMPENSATION();

        if (netDebt < Constants.MIN_NET_DEBT) revert BelowMinDebt(netDebt, Constants.MIN_NET_DEBT);

        (uint256 price, bool isLive) = IPriceFeed(a.priceFeed).fetchPrice();
        if (!isLive) revert PriceFeedDown();

        uint256 icr = LiquityMath._computeCR(collAmount, netDebt, price);
        if (icr < Constants.MCR) revert BelowMCR(icr, Constants.MCR);

        // Pull collateral from user into ActivePool
        IERC20(a.collateralToken).safeTransferFrom(msg.sender, a.activePool, collAmount);
        IActivePool(a.activePool).creditCollateral(collAmount);
        IActivePool(a.activePool).increaseDebt(netDebt);

        // Register Trove — fixed 1% rate passed internally
        tm.openTrove(msg.sender, collAmount, netDebt);

        // Insert into SortedTroves
        uint256 nicr = LiquityMath._computeNominalCR(collAmount, netDebt);
        ISortedTroves(a.sortedTroves).insert(msg.sender, nicr, upperHint, lowerHint);

        // Mint FnUSD to user
        IFnUSD(a.fnUSD).mint(msg.sender, fnUSDAmount18);

        // Mint origination fee to treasury
        if (fee18 > 0) IFnUSD(a.fnUSD).mint(a.treasury, fee18);

        // Fund gas pool
        IGasPool(a.gasPool).fund(GasPool(a.gasPool).GAS_COMPENSATION());

        emit TroveOpened(msg.sender, collAmount, netDebt);
    }

    // ─── addColl ──────────────────────────────────────────────────────────────

    function addColl(
        uint256 collAmount,
        address upperHint,
        address lowerHint
    ) external override {
        if (collAmount == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        IERC20(a.collateralToken).safeTransferFrom(msg.sender, a.activePool, collAmount);
        IActivePool(a.activePool).creditCollateral(collAmount);

        ITroveManager(a.troveManager).adjustTrove(msg.sender, int256(collAmount), 0);
        _reInsert(a, upperHint, lowerHint);

        emit CollateralAdded(msg.sender, collAmount);
    }

    // ─── withdrawColl ─────────────────────────────────────────────────────────

    function withdrawColl(
        uint256 collAmount,
        address upperHint,
        address lowerHint
    ) external override {
        if (collAmount == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        ITroveManager(a.troveManager).adjustTrove(msg.sender, -int256(collAmount), 0);

        // Check ICR after withdrawal
        _requireICRAboveMCR(a);

        IActivePool(a.activePool).sendCollateral(msg.sender, collAmount);
        IActivePool(a.activePool).decreaseDebt(0); // no debt change

        _reInsert(a, upperHint, lowerHint);

        emit CollateralWithdrawn(msg.sender, collAmount);
    }

    // ─── withdrawFnUSD ────────────────────────────────────────────────────────

    function withdrawFnUSD(
        uint256 fnUSDAmount6,
        address upperHint,
        address lowerHint
    ) external override {
        if (fnUSDAmount6 == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        uint256 amount18 = Decimals.to18(fnUSDAmount6);
        uint256 fee18    = (amount18 * Constants.ORIGINATION_FEE) / Constants.DECIMAL_PRECISION;
        uint256 netNew   = amount18 + fee18;

        ITroveManager(a.troveManager).adjustTrove(msg.sender, 0, int256(netNew));

        _requireICRAboveMCR(a);

        IActivePool(a.activePool).increaseDebt(netNew);
        IFnUSD(a.fnUSD).mint(msg.sender, amount18);
        if (fee18 > 0) IFnUSD(a.fnUSD).mint(a.treasury, fee18);

        _reInsert(a, upperHint, lowerHint);

        emit FnUSDBorrowed(msg.sender, amount18);
    }

    // ─── repayFnUSD ───────────────────────────────────────────────────────────

    function repayFnUSD(
        uint256 fnUSDAmount6,
        address upperHint,
        address lowerHint
    ) external override {
        if (fnUSDAmount6 == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        uint256 amount18 = Decimals.to18(fnUSDAmount6);

        if (IFnUSD(a.fnUSD).balanceOf(msg.sender) < fnUSDAmount6) {
            revert InsufficientFnUSDBalance();
        }

        IFnUSD(a.fnUSD).burn(msg.sender, amount18);
        IActivePool(a.activePool).decreaseDebt(amount18);
        ITroveManager(a.troveManager).adjustTrove(msg.sender, 0, -int256(amount18));

        _reInsert(a, upperHint, lowerHint);

        emit FnUSDRepaid(msg.sender, amount18);
    }

    // ─── closeTrove ───────────────────────────────────────────────────────────

    function closeTrove() external override {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        ITroveManager tm = ITroveManager(a.troveManager);
        (uint256 debt, uint256 coll,) = tm.getEntireDebtAndColl(msg.sender);

        // Debt includes gas compensation — user repays everything except gas comp
        uint256 gasComp   = GasPool(a.gasPool).GAS_COMPENSATION();
        uint256 repayable = debt - gasComp;
        uint256 repay6    = Decimals.from18(repayable);

        if (IFnUSD(a.fnUSD).balanceOf(msg.sender) < repay6) {
            revert InsufficientFnUSDBalance();
        }

        // Burn user's debt
        IFnUSD(a.fnUSD).burn(msg.sender, repayable);

        // Burn gas compensation from GasPool
        IFnUSD(a.fnUSD).burn(a.gasPool, gasComp);

        // Close Trove in TroveManager
        tm.closeTrove(msg.sender);

        // Remove from SortedTroves
        ISortedTroves(a.sortedTroves).remove(msg.sender);

        // Update ActivePool accounting
        IActivePool(a.activePool).decreaseDebt(debt);

        // Return collateral to user
        IActivePool(a.activePool).sendCollateral(msg.sender, coll);

        emit TroveClosed(msg.sender);
    }

    // ─── claimCollateral ──────────────────────────────────────────────────────

    function claimCollateral() external override {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        ICollSurplusPool(a.collSurplusPool).claim(msg.sender);
        emit CollateralClaimed(msg.sender, 0);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    function _requireActive(IAddressesRegistry.Addresses memory a) internal view {
        if (ITroveManager(a.troveManager).getTroveStatus(msg.sender) != ITroveManager.Status.Active) {
            revert TroveNotActive();
        }
    }

    function _requireICRAboveMCR(IAddressesRegistry.Addresses memory a) internal view {
        (uint256 price,) = IPriceFeed(a.priceFeed).fetchPrice();
        uint256 icr = ITroveManager(a.troveManager).getCurrentICR(msg.sender, price);
        if (icr < Constants.MCR) revert BelowMCR(icr, Constants.MCR);
    }

    function _reInsert(
        IAddressesRegistry.Addresses memory a,
        address upperHint,
        address lowerHint
    ) internal {
        ITroveManager tm = ITroveManager(a.troveManager);
        uint256 newNICR = tm.getNominalICR(msg.sender);
        ISortedTroves(a.sortedTroves).reInsert(msg.sender, newNICR, upperHint, lowerHint);
    }
}

// Minimal interface to read GAS_COMPENSATION from GasPool
interface GasPool {
    function GAS_COMPENSATION() external view returns (uint256);
}
