// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IBorrowerOperations} from "./interfaces/IBorrowerOperations.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {IActivePool, ICollSurplusPool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {TroveNFT} from "./TroveNFT.sol";
import {Constants} from "./Constants.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";
import {Decimals} from "./libraries/Decimals.sol";

// BorrowerOperations — NFT-based trove management.
// Gas savings: no address arrays, minimal storage writes.
contract BorrowerOperations is IBorrowerOperations, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IAddressesRegistry public immutable registry;
    TroveNFT public immutable troveNFT;

    uint256 private constant COLL_SCALE    = 1e10;
    uint256 private constant OPEN_ICR_BUFFER = 135e16; // 135%

    event TroveOpened(address indexed owner, uint256 indexed tokenId, uint256 coll18, uint256 debt18);
    event CollateralAdded(address indexed owner, uint256 amount18);
    event CollateralWithdrawn(address indexed owner, uint256 amount18);
    event FnUSDBorrowed(address indexed owner, uint256 amount18);
    event FnUSDRepaid(address indexed owner, uint256 amount18);
    event TroveClosed(address indexed owner, uint256 indexed tokenId);
    event CollateralClaimed(address indexed owner, uint256 amount);

    error TroveNotActive();
    error TroveAlreadyExists();
    error BelowOpenICR(uint256 icr, uint256 required);
    error BelowMCR(uint256 icr, uint256 mcr);
    error ZeroAmount();
    error InsufficientFnUSDBalance();
    error PriceFeedDown();

    constructor(IAddressesRegistry _registry, TroveNFT _troveNFT) {
        registry = _registry;
        troveNFT = _troveNFT;
    }

    // ─── openTrove ────────────────────────────────────────────────────────────

    function openTrove(
        uint256 collAmount,   // 8-dec
        uint256 fnUSDAmount6, // 6-dec
        address upperHint,
        address lowerHint
    ) external override nonReentrant {
        if (collAmount == 0) revert ZeroAmount();
        if (fnUSDAmount6 == 0) revert ZeroAmount();

        IAddressesRegistry.Addresses memory a = registry.addresses();
        ITroveManager tm = ITroveManager(a.troveManager);

        if (tm.getTroveStatus(msg.sender) == ITroveManager.Status.Active) {
            revert TroveAlreadyExists();
        }

        uint256 coll18 = collAmount * COLL_SCALE;

        uint256 fnUSDAmount18 = Decimals.to18(fnUSDAmount6);
        uint256 fee18         = (fnUSDAmount18 * Constants.ORIGINATION_FEE) / Constants.DECIMAL_PRECISION;
        uint256 netDebt       = fnUSDAmount18 + fee18;

        (uint256 price, bool isLive) = IPriceFeed(a.priceFeed).fetchPrice();
        if (!isLive) revert PriceFeedDown();

        uint256 icr = LiquityMath._computeCR(coll18, netDebt, price);
        if (icr < OPEN_ICR_BUFFER) revert BelowOpenICR(icr, OPEN_ICR_BUFFER);

        IERC20(a.collateralToken).safeTransferFrom(msg.sender, a.activePool, collAmount);
        IActivePool(a.activePool).creditCollateral(coll18);
        IActivePool(a.activePool).increaseDebt(netDebt);

        tm.openTrove(msg.sender, coll18, netDebt);

        uint256 nicr = LiquityMath._computeNominalCR(coll18, netDebt);
        ISortedTroves(a.sortedTroves).insert(msg.sender, nicr, upperHint, lowerHint);

        IFnUSD(a.fnUSD).mint(msg.sender, fnUSDAmount18);
        if (fee18 > 0) IFnUSD(a.fnUSD).mint(a.treasury, fee18);

        uint256 tokenId = troveNFT.ownerToTokenId(msg.sender);
        emit TroveOpened(msg.sender, tokenId, coll18, netDebt);
    }

    // ─── addColl ──────────────────────────────────────────────────────────────

    function addColl(
        uint256 collAmount,
        address upperHint,
        address lowerHint
    ) external override nonReentrant {
        if (collAmount == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        uint256 coll18 = collAmount * COLL_SCALE;

        IERC20(a.collateralToken).safeTransferFrom(msg.sender, a.activePool, collAmount);
        IActivePool(a.activePool).creditCollateral(coll18);
        ITroveManager(a.troveManager).adjustTrove(msg.sender, int256(coll18), 0);
        _reInsert(a, upperHint, lowerHint);

        emit CollateralAdded(msg.sender, coll18);
    }

    // ─── withdrawColl ─────────────────────────────────────────────────────────

    function withdrawColl(
        uint256 collAmount,
        address upperHint,
        address lowerHint
    ) external override nonReentrant {
        if (collAmount == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        uint256 coll18 = collAmount * COLL_SCALE;

        ITroveManager(a.troveManager).adjustTrove(msg.sender, -int256(coll18), 0);
        _requireICRAboveBuffer(a);

        IActivePool(a.activePool).sendCollateral(msg.sender, coll18);
        _reInsert(a, upperHint, lowerHint);

        emit CollateralWithdrawn(msg.sender, coll18);
    }

    // ─── withdrawFnUSD ────────────────────────────────────────────────────────

    function withdrawFnUSD(
        uint256 fnUSDAmount6,
        address upperHint,
        address lowerHint
    ) external override nonReentrant {
        if (fnUSDAmount6 == 0) revert ZeroAmount();
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        uint256 amount18 = Decimals.to18(fnUSDAmount6);
        uint256 fee18    = (amount18 * Constants.ORIGINATION_FEE) / Constants.DECIMAL_PRECISION;
        uint256 netNew   = amount18 + fee18;

        ITroveManager(a.troveManager).adjustTrove(msg.sender, 0, int256(netNew));
        _requireICRAboveBuffer(a);

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
    ) external override nonReentrant {
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

    function closeTrove() external override nonReentrant {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        _requireActive(a);

        ITroveManager tm = ITroveManager(a.troveManager);
        uint256 debt = tm.getTroveDebt(msg.sender);
        (, uint256 coll18) = tm.getEntireDebtAndColl(msg.sender);

        // Only require FnUSD if there's debt to repay
        if (debt > 0) {
            uint256 repay6 = Decimals.from18RoundUp(debt);
            if (IFnUSD(a.fnUSD).balanceOf(msg.sender) < repay6) revert InsufficientFnUSDBalance();
            IFnUSD(a.fnUSD).burn(msg.sender, debt);
            IActivePool(a.activePool).decreaseDebt(debt);
        }

        uint256 tokenId = troveNFT.ownerToTokenId(msg.sender);
        
        tm.closeTrove(msg.sender);
        ISortedTroves(a.sortedTroves).remove(msg.sender);
        IActivePool(a.activePool).sendCollateral(msg.sender, coll18);

        emit TroveClosed(msg.sender, tokenId);
    }

    // ─── claimCollateral ──────────────────────────────────────────────────────

    function claimCollateral() external override nonReentrant {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        ICollSurplusPool(a.collSurplusPool).claim(msg.sender);
        emit CollateralClaimed(msg.sender, 0);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _requireActive(IAddressesRegistry.Addresses memory a) internal view {
        if (ITroveManager(a.troveManager).getTroveStatus(msg.sender) != ITroveManager.Status.Active) {
            revert TroveNotActive();
        }
    }

    function _requireICRAboveBuffer(IAddressesRegistry.Addresses memory a) internal {
        (uint256 price,) = IPriceFeed(a.priceFeed).fetchPrice();
        uint256 icr = ITroveManager(a.troveManager).getCurrentICR(msg.sender, price);
        if (icr < OPEN_ICR_BUFFER) revert BelowOpenICR(icr, OPEN_ICR_BUFFER);
    }

    function _reInsert(
        IAddressesRegistry.Addresses memory a,
        address upperHint,
        address lowerHint
    ) internal {
        uint256 newNICR = ITroveManager(a.troveManager).getNominalICR(msg.sender);
        ISortedTroves(a.sortedTroves).reInsert(msg.sender, newNICR, upperHint, lowerHint);
    }
}
