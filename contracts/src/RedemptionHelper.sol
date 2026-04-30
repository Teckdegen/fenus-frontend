// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {IActivePool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {Constants} from "./Constants.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";
import {Decimals} from "./libraries/Decimals.sol";

// RedemptionHelper — lets any FnUSD holder burn their FnUSD 1:1 against the
// current oracle price of zkLTC, receiving zkLTC collateral from the riskiest
// (lowest ICR) Troves first. A redemption fee is charged and sent to the
// treasury as protocol revenue.
//
// Fee model (mirrors Liquity v1):
//   redemptionFee = max(REDEMPTION_FEE_FLOOR, baseRate) * collateralOut
//   baseRate decays over time and spikes on each redemption proportional to
//   the fraction of total FnUSD supply redeemed.
//
// Revenue flow:
//   - Redemption fee  → treasury (protocol revenue)
//   - Liquidation bonus (10%) → liquidator (incentive for calling liquidate())
//   - Origination fee (0.5%) → treasury (charged at openTrove)
//
// One-way only: FnUSD → zkLTC. There is no reverse path here.
contract RedemptionHelper {
    using SafeERC20 for IERC20;

    IAddressesRegistry public immutable registry;

    // baseRate: 18-decimal, decays toward zero between redemptions.
    uint256 public baseRate;
    uint256 public lastFeeOperationTime;

    event Redemption(
        address indexed redeemer,
        uint256 fnUSDAmount18,
        uint256 collateralSent,
        uint256 feePaid,
        uint256 newBaseRate
    );
    event BaseRateUpdated(uint256 newBaseRate);
    event LastFeeOpTimeUpdated(uint256 timestamp);

    error ZeroAmount();
    error InsufficientFnUSDBalance();
    error NoRedeemableTroves();
    error PriceFeedDown();
    error BelowMinRedemption();

    // Minimum redemption: 100 FnUSD (18-dec internal)
    uint256 private constant MIN_REDEMPTION = 100e18;

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
        lastFeeOperationTime = block.timestamp;
    }

    // ─── External ────────────────────────────────────────────────────────────

    // redeem — burn `fnUSDAmount6` (6-dec external units) of FnUSD, receive zkLTC.
    // `firstHint` is the address of the Trove to start redemption from (lowest ICR).
    // Pass address(0) to start from the tail of SortedTroves automatically.
    // `maxIterations` caps how many Troves to touch (gas safety); 0 = no cap.
    function redeem(
        uint256 fnUSDAmount6,
        address firstHint,
        uint256 maxIterations
    ) external returns (uint256 collateralOut) {
        if (fnUSDAmount6 == 0) revert ZeroAmount();

        uint256 amount18 = Decimals.to18(fnUSDAmount6);
        if (amount18 < MIN_REDEMPTION) revert BelowMinRedemption();

        IAddressesRegistry.Addresses memory a = registry.addresses();
        IFnUSD fnUSD = IFnUSD(a.fnUSD);
        IPriceFeed priceFeed = IPriceFeed(a.priceFeed);
        ISortedTroves sortedTroves = ISortedTroves(a.sortedTroves);
        ITroveManager troveManager = ITroveManager(a.troveManager);
        IActivePool activePool = IActivePool(a.activePool);
        IERC20 collToken = IERC20(a.collateralToken);

        // Check caller has enough FnUSD (6-dec balance).
        if (fnUSD.balanceOf(msg.sender) < fnUSDAmount6) revert InsufficientFnUSDBalance();

        // Fetch price — must be live.
        (uint256 price, bool isLive) = priceFeed.fetchPrice();
        if (!isLive) revert PriceFeedDown();

        // Decay baseRate and update fee timestamp.
        _decayBaseRate();

        // Compute fee rate and fee amount (in collateral).
        uint256 feeRate = _getRedemptionFeeRate();
        // collateralGross = fnUSDAmount18 / price  (both 18-dec → result 18-dec coll)
        uint256 collateralGross = (amount18 * Constants.DECIMAL_PRECISION) / price;
        uint256 fee = (collateralGross * feeRate) / Constants.DECIMAL_PRECISION;
        collateralOut = collateralGross - fee;

        // Walk Troves from riskiest (tail) and redeem against them.
        address current = firstHint != address(0) ? firstHint : sortedTroves.getLast();
        if (current == address(0)) revert NoRedeemableTroves();

        uint256 remaining18 = amount18;
        uint256 iterations = 0;

        while (remaining18 > 0 && current != address(0)) {
            if (maxIterations != 0 && iterations >= maxIterations) break;

            address next = sortedTroves.getPrev(current); // move toward head (safer)

            uint256 troveColl = troveManager.getTroveColl(current);
            uint256 troveDebt = troveManager.getTroveDebt(current);

            if (troveDebt == 0) {
                current = next;
                continue;
            }

            uint256 redeemDebt = LiquityMath._min(remaining18, troveDebt);
            uint256 redeemColl = (redeemDebt * Constants.DECIMAL_PRECISION) / price;

            if (redeemColl > troveColl) {
                redeemColl = troveColl;
                redeemDebt = (redeemColl * price) / Constants.DECIMAL_PRECISION;
            }

            // Apply redemption to this Trove via TroveManager.
            troveManager.adjustTrove(current, -int256(redeemColl), -int256(redeemDebt));

            // If Trove is now fully redeemed, close it.
            if (troveDebt - redeemDebt == 0) {
                troveManager.closeTrove(current);
            }

            remaining18 -= redeemDebt;
            current = next;
            iterations++;
        }

        // The actual FnUSD redeemed is amount18 - remaining18 (may be less if Troves ran out).
        uint256 actualRedeemed18 = amount18 - remaining18;
        if (actualRedeemed18 == 0) revert NoRedeemableTroves();

        // Recalculate collateral out based on what was actually redeemed.
        uint256 actualCollGross = (actualRedeemed18 * Constants.DECIMAL_PRECISION) / price;
        fee = (actualCollGross * feeRate) / Constants.DECIMAL_PRECISION;
        collateralOut = actualCollGross - fee;

        // Update baseRate based on fraction of supply redeemed.
        _updateBaseRateFromRedemption(actualRedeemed18, price, fnUSD.totalSupply());

        // Burn the redeemed FnUSD from caller (6-dec).
        uint256 actualRedeemed6 = Decimals.from18(actualRedeemed18);
        fnUSD.burn(msg.sender, actualRedeemed18);

        // Send fee to treasury.
        if (fee > 0) {
            activePool.sendCollateral(a.treasury, fee);
        }

        // Send collateral to redeemer.
        activePool.sendCollateral(msg.sender, collateralOut);

        emit Redemption(msg.sender, actualRedeemed18, collateralOut, fee, baseRate);
    }

    // ─── Fee views ───────────────────────────────────────────────────────────

    function getRedemptionFeeRate() external view returns (uint256) {
        return _getRedemptionFeeRate();
    }

    function getRedemptionRateWithDecay() external view returns (uint256) {
        return _calcDecayedBaseRate();
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _getRedemptionFeeRate() internal view returns (uint256) {
        return LiquityMath._max(Constants.REDEMPTION_FEE_FLOOR, baseRate);
    }

    function _decayBaseRate() internal {
        uint256 decayed = _calcDecayedBaseRate();
        baseRate = decayed;
        lastFeeOperationTime = block.timestamp;
        emit BaseRateUpdated(decayed);
        emit LastFeeOpTimeUpdated(block.timestamp);
    }

    function _calcDecayedBaseRate() internal view returns (uint256) {
        uint256 minutesPassed = (block.timestamp - lastFeeOperationTime) / 60;
        uint256 decayFactor = LiquityMath._decPow(Constants.MINUTE_DECAY_FACTOR, minutesPassed);
        return (baseRate * decayFactor) / Constants.DECIMAL_PRECISION;
    }

    function _updateBaseRateFromRedemption(
        uint256 redeemedFnUSD18,
        uint256 price,
        uint256 totalFnUSDSupply6
    ) internal {
        // Convert total supply from 6-dec ERC20 to 18-dec internal.
        uint256 totalSupply18 = Decimals.to18(totalFnUSDSupply6);
        if (totalSupply18 == 0) return;

        // fraction = redeemedFnUSD / totalSupply (18-dec)
        uint256 redeemedFraction = (redeemedFnUSD18 * Constants.DECIMAL_PRECISION) / totalSupply18;

        uint256 newBaseRate = baseRate + (redeemedFraction / Constants.BETA);
        // Cap at 100%.
        if (newBaseRate > Constants.ONE_HUNDRED_PCT) newBaseRate = Constants.ONE_HUNDRED_PCT;

        baseRate = newBaseRate;
        emit BaseRateUpdated(newBaseRate);
    }
}
