// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IActivePool, IDefaultPool, ICollSurplusPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// ActivePool — holds collateral and tracks debt for all active Troves.
//
// Decimal boundary:
//   collateral (state var) = 18-dec internal units
//   WzkLTC ERC20 token     = 8-dec
//   COLL_SCALE = 1e10 converts 18-dec → 8-dec for actual token transfers
contract ActivePool is IActivePool {
    using SafeERC20 for IERC20;

    // WzkLTC is 8 decimals; protocol tracks collateral in 18-dec internally.
    uint256 private constant COLL_SCALE = 1e10;

    IAddressesRegistry public immutable registry;
    IERC20 public immutable collateralToken;

    uint256 public collateral; // 18-dec internal
    uint256 public debt;       // 18-dec internal

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
    function getDebt()       external view returns (uint256) { return debt; }

    function increaseDebt(uint256 amount) external onlyAuthorized { debt += amount; }
    function decreaseDebt(uint256 amount) external onlyAuthorized { debt -= amount; }

    // receiveCollateral — pulls 8-dec tokens from caller, credits 18-dec internally.
    // Used when BorrowerOperations deposits collateral directly.
    function receiveCollateral(uint256 amount8) external onlyAuthorized {
        collateral += amount8 * COLL_SCALE;
        collateralToken.safeTransferFrom(msg.sender, address(this), amount8);
    }

    // creditCollateral — bookkeeping only; tokens already arrived.
    // amount is 18-dec (caller already scaled).
    function creditCollateral(uint256 amount18) external onlyAuthorized {
        collateral += amount18;
    }

    // sendCollateral — amount is 18-dec internally; scales to 8-dec for the token transfer.
    function sendCollateral(address to, uint256 amount18) external onlyAuthorized {
        collateral -= amount18;
        collateralToken.safeTransfer(to, amount18 / COLL_SCALE);
    }
}
