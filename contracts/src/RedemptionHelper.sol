// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
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

// RedemptionHelper FnUSD → zkLTC one-way redemption.
//
// Security hardening:
// [1] ReentrancyGuard prevents re-entry via token callbacks
// [5] SortedTroves re-insertion handled by TroveManager.adjustTrove
// (TroveManager detects redemptionHelper caller and re-inserts)
// [6] Price manipulation protection redemptions blocked if oracle is not live.
// Additionally, redemptions only touch Troves from the riskiest end of the
// list, so a manipulated price cannot be used to drain a healthy Trove.
contract RedemptionHelper is ReentrancyGuard {
 using SafeERC20 for IERC20;

 IAddressesRegistry public immutable registry;

 uint256 public baseRate;
 uint256 public lastFeeOperationTime;

 // Minimum redemption: 100 FnUSD (18-dec internal)
 uint256 private constant MIN_REDEMPTION = 100e18;

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

 constructor(IAddressesRegistry _registry) {
 registry = _registry;
 lastFeeOperationTime = block.timestamp;
 }

 // ─── redeem ───────────────────────────────────────────────────────────────

 function redeem(
 uint256 fnUSDAmount6,
 address firstHint,
 uint256 maxIterations
 ) external nonReentrant returns (uint256 collateralOut) {
 if (fnUSDAmount6 == 0) revert ZeroAmount();

 uint256 amount18 = Decimals.to18(fnUSDAmount6);
 if (amount18 < MIN_REDEMPTION) revert BelowMinRedemption();

 IAddressesRegistry.Addresses memory a = registry.addresses();
 IFnUSD fnUSD = IFnUSD(a.fnUSD);
 ISortedTroves sortedTroves = ISortedTroves(a.sortedTroves);
 ITroveManager troveManager = ITroveManager(a.troveManager);
 IActivePool activePool = IActivePool(a.activePool);

 if (fnUSD.balanceOf(msg.sender) < fnUSDAmount6) revert InsufficientFnUSDBalance();

 // FIX [6]: block redemptions on stale/down oracle
 (uint256 price, bool isLive) = IPriceFeed(a.priceFeed).fetchPrice();
 if (!isLive) revert PriceFeedDown();

 _decayBaseRate();

 uint256 feeRate = _getRedemptionFeeRate();

 // Walk Troves from riskiest (tail) toward head
 address current = firstHint != address(0) ? firstHint : sortedTroves.getLast();
 if (current == address(0)) revert NoRedeemableTroves();

 uint256 remaining18 = amount18;
 uint256 iterations = 0;

 while (remaining18 > 0 && current != address(0)) {
 if (maxIterations != 0 && iterations >= maxIterations) break;

 // Read next before adjusting (adjustTrove re-inserts, changing list)
 address next = sortedTroves.getPrev(current);

 uint256 troveColl = troveManager.getTroveColl(current);
 uint256 troveDebt = troveManager.getTroveDebt(current);

 if (troveDebt == 0) { current = next; continue; }

 uint256 redeemDebt = LiquityMath._min(remaining18, troveDebt);
 uint256 redeemColl = (redeemDebt * Constants.DECIMAL_PRECISION) / price;

 if (redeemColl > troveColl) {
 redeemColl = troveColl;
 redeemDebt = (redeemColl * price) / Constants.DECIMAL_PRECISION;
 }

 // adjustTrove also re-inserts in SortedTroves (FIX [5])
 troveManager.adjustTrove(current, -int256(redeemColl), -int256(redeemDebt));

 if (troveDebt - redeemDebt == 0) {
 troveManager.closeTrove(current);
 }

 remaining18 -= redeemDebt;
 current = next;
 iterations++;
 }

 uint256 actualRedeemed18 = amount18 - remaining18;
 if (actualRedeemed18 == 0) revert NoRedeemableTroves();

 uint256 actualCollGross = (actualRedeemed18 * Constants.DECIMAL_PRECISION) / price;
 uint256 fee = (actualCollGross * feeRate) / Constants.DECIMAL_PRECISION;
 collateralOut = actualCollGross - fee;

 _updateBaseRateFromRedemption(actualRedeemed18, fnUSD.totalSupply());

 // Burn FnUSD state change before external calls (CEI)
 fnUSD.burn(msg.sender, actualRedeemed18);

 // Send fee to treasury, collateral to redeemer
 if (fee > 0) activePool.sendCollateral(a.treasury, fee);
 activePool.sendCollateral(msg.sender, collateralOut);

 emit Redemption(msg.sender, actualRedeemed18, collateralOut, fee, baseRate);
 }

 // ─── Fee views ────────────────────────────────────────────────────────────

 function getRedemptionFeeRate() external view returns (uint256) {
 return _getRedemptionFeeRate();
 }

 function getRedemptionRateWithDecay() external view returns (uint256) {
 return _calcDecayedBaseRate();
 }

 // ─── Internal ─────────────────────────────────────────────────────────────

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
 uint256 totalFnUSDSupply6
 ) internal {
 uint256 totalSupply18 = Decimals.to18(totalFnUSDSupply6);
 if (totalSupply18 == 0) return;

 uint256 redeemedFraction = (redeemedFnUSD18 * Constants.DECIMAL_PRECISION) / totalSupply18;
 uint256 newBaseRate = baseRate + (redeemedFraction / Constants.BETA);
 if (newBaseRate > Constants.ONE_HUNDRED_PCT) newBaseRate = Constants.ONE_HUNDRED_PCT;

 baseRate = newBaseRate;
 emit BaseRateUpdated(newBaseRate);
 }
}
