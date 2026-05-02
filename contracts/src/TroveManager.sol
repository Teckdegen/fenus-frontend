// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {IActivePool, IDefaultPool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {TroveNFT} from "./TroveNFT.sol";
import {Constants} from "./Constants.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";

// TroveManager — NFT-based trove management (Uniswap V3 style).
// Storage is minimized: only debt/coll per tokenId, no arrays or complex mappings.
contract TroveManager is ITroveManager, ReentrancyGuard {
    IAddressesRegistry public immutable registry;
    TroveNFT public immutable troveNFT;

    struct TroveData {
        uint256 debt;
        uint256 coll;
        uint256 stake;
        uint256 rewardSnapColl;
        uint256 rewardSnapDebt;
        Status  status;
    }

    // Storage: tokenId → TroveData (much cheaper than address → TroveData + arrays)
    mapping(uint256 => TroveData) public troves;
    
    // Global redistribution tracking
    uint256 public L_coll;
    uint256 public L_debt;
    uint256 public totalStakes;
    
    // Lightweight tracking for liquidation iteration (optional)
    uint256[] private _activeTokenIds;
    mapping(uint256 => uint256) private _tokenIdIndex;

    event TroveOpened(address indexed owner, uint256 indexed tokenId, uint256 debt, uint256 coll);
    event TroveUpdated(uint256 indexed tokenId, uint256 debt, uint256 coll, uint256 stake, uint8 operation);
    event TroveLiquidated(uint256 indexed tokenId, uint256 debt, uint256 coll, uint8 liquidationMode);
    event TroveClosed(uint256 indexed tokenId, Status status);
    event Liquidation(uint256 liquidatedDebt, uint256 liquidatedColl, uint256 surplusColl);

    error NotAuthorized();
    error TroveNotActive();
    error TroveAlreadyExists();
    error NothingToLiquidate();

    constructor(IAddressesRegistry _registry, TroveNFT _troveNFT) {
        registry = _registry;
        troveNFT = _troveNFT;
    }

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

    // ─── View ─────────────────────────────────────────────────────────────────

    function getTroveOwnersCount() external view override returns (uint256) { 
        return _activeTokenIds.length; 
    }
    
    function getTroveStatus(address owner) external view override returns (Status) { 
        uint256 tokenId = troveNFT.ownerToTokenId(owner);
        return tokenId == 0 ? Status.NonExistent : troves[tokenId].status;
    }
    
    function getTroveColl(address owner) external view override returns (uint256) { 
        uint256 tokenId = troveNFT.ownerToTokenId(owner);
        return tokenId == 0 ? 0 : troves[tokenId].coll;
    }
    
    function getTroveDebt(address owner) external view override returns (uint256) { 
        uint256 tokenId = troveNFT.ownerToTokenId(owner);
        return tokenId == 0 ? 0 : troves[tokenId].debt;
    }

    function getCurrentICR(address owner, uint256 price) external view override returns (uint256) {
        (uint256 debt, uint256 coll) = _getEntireDebtAndColl(owner);
        return LiquityMath._computeCR(coll, debt, price);
    }

    function getNominalICR(address owner) external view override returns (uint256) {
        (uint256 debt, uint256 coll) = _getEntireDebtAndColl(owner);
        return LiquityMath._computeNominalCR(coll, debt);
    }

    function getEntireDebtAndColl(address owner)
        external view override
        returns (uint256 debt, uint256 coll)
    {
        return _getEntireDebtAndColl(owner);
    }

    // ─── BorrowerOperations callbacks ─────────────────────────────────────────

    function openTrove(address owner, uint256 coll, uint256 debt) external override onlyBO nonReentrant {
        if (troveNFT.hasTrove(owner)) revert TroveAlreadyExists();

        // Mint NFT for this position
        uint256 tokenId = troveNFT.mint(owner);
        
        TroveData storage t = troves[tokenId];
        t.debt           = debt;
        t.coll           = coll;
        t.status         = Status.Active;
        t.rewardSnapColl = L_coll;
        t.rewardSnapDebt = L_debt;

        uint256 stake = _computeStake(coll);
        t.stake      = stake;
        totalStakes += stake;

        _tokenIdIndex[tokenId] = _activeTokenIds.length;
        _activeTokenIds.push(tokenId);

        emit TroveOpened(owner, tokenId, debt, coll);
        emit TroveUpdated(tokenId, debt, coll, stake, 0);
    }

    function adjustTrove(address owner, int256 collDelta, int256 debtDelta)
        external override onlyBOorRH nonReentrant
    {
        uint256 tokenId = troveNFT.ownerToTokenId(owner);
        if (tokenId == 0) revert TroveNotActive();
        
        TroveData storage t = troves[tokenId];
        if (t.status != Status.Active) revert TroveNotActive();

        _applyPendingRewards(tokenId);

        if (collDelta > 0) t.coll += uint256(collDelta);
        else if (collDelta < 0) t.coll -= uint256(-collDelta);

        if (debtDelta > 0) t.debt += uint256(debtDelta);
        else if (debtDelta < 0) t.debt -= uint256(-debtDelta);

        totalStakes -= t.stake;
        t.stake      = _computeStake(t.coll);
        totalStakes += t.stake;

        t.rewardSnapColl = L_coll;
        t.rewardSnapDebt = L_debt;

        emit TroveUpdated(tokenId, t.debt, t.coll, t.stake, 1);
    }

    function closeTrove(address owner) external override onlyBOorRH nonReentrant {
        uint256 tokenId = troveNFT.ownerToTokenId(owner);
        if (tokenId == 0) revert TroveNotActive();
        
        TroveData storage t = troves[tokenId];
        if (t.status != Status.Active) revert TroveNotActive();

        totalStakes -= t.stake;
        t.stake      = 0;
        
        IAddressesRegistry.Addresses memory a = registry.addresses();
        t.status = (msg.sender == a.redemptionHelper)
            ? Status.ClosedByRedemption
            : Status.ClosedByOwner;

        _removeTokenId(tokenId);
        
        // Burn the NFT
        troveNFT.burn(tokenId);

        emit TroveClosed(tokenId, t.status);
        emit TroveUpdated(tokenId, 0, 0, 0, 2);
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
        bool    liquidatedAny;

        for (uint256 i = 0; i < owners.length; i++) {
            uint256 tokenId = troveNFT.ownerToTokenId(owners[i]);
            if (tokenId == 0) continue;
            
            TroveData storage t = troves[tokenId];
            if (t.status != Status.Active) continue;

            _applyPendingRewards(tokenId);

            uint256 icr = LiquityMath._computeCR(t.coll, t.debt, price);
            if (icr >= Constants.MCR) continue;

            uint256 debt = t.debt;
            uint256 coll = t.coll;

            uint256 debtValueInColl = (debt * Constants.DECIMAL_PRECISION) / price;

            uint256 surplusColl;
            uint256 collForLP;
            uint256 collForTreasury;
            uint256 collForHolders;

            if (debtValueInColl <= coll) {
                surplusColl     = coll - debtValueInColl;
                collForLP       = debtValueInColl;
                collForTreasury = (surplusColl * Constants.LIQUIDATION_TREASURY_SHARE)
                                  / Constants.DECIMAL_PRECISION;
                collForHolders  = surplusColl - collForTreasury;
            } else {
                collForLP       = coll;
                collForTreasury = 0;
                collForHolders  = 0;
                surplusColl     = 0;
            }

            totalStakes -= t.stake;
            t.stake      = 0;
            t.status     = Status.ClosedByLiquidation;
            _removeTokenId(tokenId);
            
            // Burn NFT
            troveNFT.burn(tokenId);

            if (collForHolders > 0 && totalStakes > 0) {
                uint256 debtForHolders = (debt * collForHolders) / coll;

                IActivePool(a.activePool).sendCollateral(a.defaultPool, collForHolders);
                IDefaultPool(a.defaultPool).creditCollateral(collForHolders);
                IDefaultPool(a.defaultPool).increaseDebt(debtForHolders);

                L_coll += (collForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
                L_debt += (debtForHolders * Constants.DECIMAL_PRECISION) / totalStakes;
            }

            uint256 toTreasury = collForLP + collForTreasury;
            if (toTreasury > 0) {
                IActivePool(a.activePool).sendCollateral(a.treasury, toTreasury);
            }

            totalLiquidatedDebt += debt;
            totalLiquidatedColl += coll;
            totalSurplus        += surplusColl;
            liquidatedAny        = true;

            emit TroveLiquidated(tokenId, debt, coll, 0);
            emit TroveUpdated(tokenId, 0, 0, 0, 4);
        }

        if (!liquidatedAny) revert NothingToLiquidate();
        emit Liquidation(totalLiquidatedDebt, totalLiquidatedColl, totalSurplus);
    }

    // ─── Redemption stub ──────────────────────────────────────────────────────

    function redeem(uint256, address, uint256) external override returns (uint256) {
        revert NotAuthorized();
    }

    // ─── Fee views ────────────────────────────────────────────────────────────

    function baseRate() external pure override returns (uint256) { return 0; }
    function getRedemptionFeeRate() external pure override returns (uint256) { return Constants.REDEMPTION_FEE_FLOOR; }
    function getRedemptionRateWithDecay() external pure override returns (uint256) { return Constants.REDEMPTION_FEE_FLOOR; }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _applyPendingRewards(uint256 tokenId) internal {
        TroveData storage t = troves[tokenId];
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

    function _computeStake(uint256 coll) internal pure returns (uint256) { return coll; }

    function _removeTokenId(uint256 tokenId) internal {
        uint256 idx       = _tokenIdIndex[tokenId];
        uint256 lastIdx   = _activeTokenIds.length - 1;
        uint256 lastToken = _activeTokenIds[lastIdx];

        _activeTokenIds[idx]     = lastToken;
        _tokenIdIndex[lastToken] = idx;

        _activeTokenIds.pop();
        delete _tokenIdIndex[tokenId];
    }

    function _getEntireDebtAndColl(address owner)
        internal view
        returns (uint256 debt, uint256 coll)
    {
        uint256 tokenId = troveNFT.ownerToTokenId(owner);
        if (tokenId == 0) return (0, 0);
        
        TroveData storage t = troves[tokenId];

        uint256 pendingColl = (t.stake * (L_coll - t.rewardSnapColl)) / Constants.DECIMAL_PRECISION;
        uint256 pendingDebt = (t.stake * (L_debt - t.rewardSnapDebt)) / Constants.DECIMAL_PRECISION;

        debt = t.debt + pendingDebt;
        coll = t.coll + pendingColl;
    }
}
