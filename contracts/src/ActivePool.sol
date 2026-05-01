// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IActivePool, IDefaultPool, ICollSurplusPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// ActivePool holds collateral and tracks debt for all active Troves.
contract ActivePool is IActivePool {
 using SafeERC20 for IERC20;

 IAddressesRegistry public immutable registry;
 IERC20 public immutable collateralToken;

 uint256 public collateral;
 uint256 public debt;

 error NotAuthorized();

 constructor(IAddressesRegistry _registry, IERC20 _collateralToken) {
 registry = _registry;
 collateralToken = _collateralToken;
 }

 modifier onlyAuthorized() {
 IAddressesRegistry.Addresses memory a = registry.addresses();
 if (
 msg.sender != a.borrowerOperations
 && msg.sender != a.troveManager
 && msg.sender != a.defaultPool
 && msg.sender != a.redemptionHelper
 && msg.sender != a.collSurplusPool
 ) revert NotAuthorized();
 _;
 }

 function getCollateral() external view returns (uint256) { return collateral; }
 function getDebt() external view returns (uint256) { return debt; }

 function increaseDebt(uint256 amount) external onlyAuthorized { debt += amount; }
 function decreaseDebt(uint256 amount) external onlyAuthorized { debt -= amount; }

 // Pulls tokens from msg.sender (used by BorrowerOperations on deposit).
 function receiveCollateral(uint256 amount) external onlyAuthorized {
 collateral += amount;
 collateralToken.safeTransferFrom(msg.sender, address(this), amount);
 }

 // Bookkeeping only caller has already pushed tokens to this contract.
 function creditCollateral(uint256 amount) external onlyAuthorized {
 collateral += amount;
 }

 function sendCollateral(address to, uint256 amount) external onlyAuthorized {
 collateral -= amount;
 collateralToken.safeTransfer(to, amount);
 }
}
