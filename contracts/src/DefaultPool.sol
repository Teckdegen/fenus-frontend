// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IDefaultPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// DefaultPool holds the collateral and debt that has been redistributed from
// liquidated Troves. When a Trove is liquidated and the Stability Pool cannot
// fully absorb its debt, the remaining debt and a proportional share of collateral
// are spread across all remaining active Troves via the redistribution mechanism.
//
// Redistribution accounting:
// - TroveManager calls `creditCollateral` + `increaseDebt` when it pushes
// liquidated assets here.
// - TroveManager calls `sendCollateralToActivePool` when a Trove "absorbs" its
// pending redistribution share (on any subsequent adjustment or liquidation).
//
// The DefaultPool never holds tokens on behalf of individual users it is a
// protocol-level buffer. Individual Trove pending gains are tracked in TroveManager
// via per-snapshot error-correction (L_coll / L_debt running totals).
contract DefaultPool is IDefaultPool {
 using SafeERC20 for IERC20;

 IAddressesRegistry public immutable registry;
 IERC20 public immutable collateralToken;

 uint256 public collateral;
 uint256 public debt;

 event DefaultPoolDebtUpdated(uint256 debt);
 event DefaultPoolCollateralUpdated(uint256 collateral);
 event CollateralSentToActivePool(uint256 amount);

 error NotAuthorized();

 constructor(IAddressesRegistry _registry, IERC20 _collateralToken) {
 registry = _registry;
 collateralToken = _collateralToken;
 }

 modifier onlyTroveManager() {
 if (msg.sender != registry.addresses().troveManager) revert NotAuthorized();
 _;
 }

 modifier onlyTMorActivePool() {
 IAddressesRegistry.Addresses memory a = registry.addresses();
 if (msg.sender != a.troveManager && msg.sender != a.activePool) revert NotAuthorized();
 _;
 }

 // ─── View ────────────────────────────────────────────────────────────────

 function getCollateral() external view override returns (uint256) {
 return collateral;
 }

 function getDebt() external view override returns (uint256) {
 return debt;
 }

 // ─── Debt accounting ─────────────────────────────────────────────────────

 // Called by TroveManager when redistributing a liquidated Trove's debt.
 function increaseDebt(uint256 amount) external override onlyTroveManager {
 debt += amount;
 emit DefaultPoolDebtUpdated(debt);
 }

 // Called by TroveManager when an active Trove absorbs its pending debt share.
 function decreaseDebt(uint256 amount) external override onlyTroveManager {
 debt -= amount;
 emit DefaultPoolDebtUpdated(debt);
 }

 // ─── Collateral accounting ────────────────────────────────────────────────

 // Called by ActivePool after it has already transferred tokens here.
 // Purely a bookkeeping credit no token transfer occurs.
 function creditCollateral(uint256 amount) external override onlyTMorActivePool {
 collateral += amount;
 emit DefaultPoolCollateralUpdated(collateral);
 }

 // Called by TroveManager when an active Trove absorbs its pending collateral
 // share. Transfers tokens back to ActivePool and updates bookkeeping.
 function sendCollateralToActivePool(uint256 amount) external override onlyTroveManager {
 IAddressesRegistry.Addresses memory a = registry.addresses();
 collateral -= amount;
 emit DefaultPoolCollateralUpdated(collateral);
 emit CollateralSentToActivePool(amount);
 collateralToken.safeTransfer(a.activePool, amount);
 }
}
