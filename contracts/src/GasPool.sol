// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IGasPool} from "./interfaces/IPools.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {Decimals} from "./libraries/Decimals.sol";

// GasPool — FnUSD reserve used to pay liquidators. Funded at openTrove (the gas
// compensation amount is added to the borrower's debt and minted here).
contract GasPool is IGasPool {
    using SafeERC20 for IERC20;

    IAddressesRegistry public immutable registry;
    uint256 public balance18; // bookkeeping in 18-dec; ERC20 balance is in 6-dec.

    error NotAuthorized();
    error InsufficientBalance();

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    // Called by BorrowerOperations after minting FnUSD to this contract.
    function fund(uint256 amount18) external {
        if (msg.sender != registry.addresses().borrowerOperations) revert NotAuthorized();
        balance18 += amount18;
    }

    function payLiquidator(address liquidator, uint256 amount18) external {
        if (msg.sender != registry.addresses().troveManager) revert NotAuthorized();
        if (balance18 < amount18) revert InsufficientBalance();
        balance18 -= amount18;
        IERC20(registry.addresses().fnUSD).safeTransfer(liquidator, Decimals.from18(amount18));
    }
}
