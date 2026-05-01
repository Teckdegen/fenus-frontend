// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ICollSurplusPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// CollSurplusPool holds excess collateral owed to users after partial redemption
// or full liquidation that left residual coll. Users pull via BorrowerOperations.claimCollateral.
contract CollSurplusPool is ICollSurplusPool {
 using SafeERC20 for IERC20;

 IAddressesRegistry public immutable registry;
 IERC20 public immutable collateralToken;

 uint256 public collateral;
 mapping(address => uint256) public balances;

 error NotAuthorized();
 error NoBalance();

 constructor(IAddressesRegistry _registry, IERC20 _collateralToken) {
 registry = _registry;
 collateralToken = _collateralToken;
 }

 modifier onlyAuthorized() {
 IAddressesRegistry.Addresses memory a = registry.addresses();
 if (
 msg.sender != a.troveManager
 && msg.sender != a.borrowerOperations
 && msg.sender != a.redemptionHelper
 && msg.sender != a.activePool
 ) revert NotAuthorized();
 _;
 }

 function getCollateral() external view returns (uint256) { return collateral; }
 function getUserBalance(address user) external view returns (uint256) { return balances[user]; }

 function accountSurplus(address account, uint256 amount) external onlyAuthorized {
 balances[account] += amount;
 }

 function creditCollateral(uint256 amount) external onlyAuthorized {
 collateral += amount;
 }

 function claim(address account) external {
 if (msg.sender != registry.addresses().borrowerOperations) revert NotAuthorized();
 uint256 bal = balances[account];
 if (bal == 0) revert NoBalance();
 balances[account] = 0;
 collateral -= bal;
 collateralToken.safeTransfer(account, bal);
 }
}
