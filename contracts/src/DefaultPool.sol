// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IDefaultPool, IActivePool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// DefaultPool — accumulates redistributed coll/debt from liquidations that
// the StabilityPool couldn't fully absorb. Other Troves inherit pro-rata.
contract DefaultPool is IDefaultPool {
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

    modifier onlyTroveManager() {
        if (msg.sender != registry.addresses().troveManager) revert NotAuthorized();
        _;
    }

    modifier onlyActivePool() {
        if (msg.sender != registry.addresses().activePool) revert NotAuthorized();
        _;
    }

    function getCollateral() external view returns (uint256) { return collateral; }
    function getDebt() external view returns (uint256) { return debt; }

    function increaseDebt(uint256 amount) external onlyTroveManager { debt += amount; }
    function decreaseDebt(uint256 amount) external onlyTroveManager { debt -= amount; }

    // Bookkeeping — caller (TroveManager) has already moved collateral here.
    function creditCollateral(uint256 amount) external onlyTroveManager {
        collateral += amount;
    }

    function sendCollateralToActivePool(uint256 amount) external onlyTroveManager {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        collateral -= amount;
        collateralToken.safeTransfer(a.activePool, amount);
        IActivePool(a.activePool).creditCollateral(amount);
    }
}
