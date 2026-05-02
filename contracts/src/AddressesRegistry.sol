// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// AddressesRegistry single source of truth for protocol addresses. Two-phase init:
// deployer sets all addresses once via setAddresses, after which the registry is frozen.
// All other contracts read from it during their own init and cache addresses immutably.
contract AddressesRegistry is IAddressesRegistry {
 address public immutable deployer;
 Addresses private _addresses;
 bool private _initialized;

 error AlreadyInitialized();
 error NotDeployer();
 error ZeroAddress();

 constructor() {
 deployer = msg.sender;
 }

 function setAddresses(Addresses calldata a) external override {
 if (msg.sender != deployer) revert NotDeployer();
 if (_initialized) revert AlreadyInitialized();

 if (a.collateralToken == address(0)) revert ZeroAddress();
 if (a.fnUSD == address(0)) revert ZeroAddress();
 if (a.priceFeed == address(0)) revert ZeroAddress();
 if (a.borrowerOperations == address(0)) revert ZeroAddress();
 if (a.troveManager == address(0)) revert ZeroAddress();
 if (a.troveNFT == address(0)) revert ZeroAddress();
 if (a.sortedTroves == address(0)) revert ZeroAddress();
 if (a.activePool == address(0)) revert ZeroAddress();
 if (a.defaultPool == address(0)) revert ZeroAddress();
 if (a.collSurplusPool == address(0)) revert ZeroAddress();
 if (a.gasPool == address(0)) revert ZeroAddress();
 if (a.treasury == address(0)) revert ZeroAddress();
 if (a.redemptionHelper == address(0)) revert ZeroAddress();
 if (a.hintHelpers == address(0)) revert ZeroAddress();
 if (a.collateralRegistry == address(0)) revert ZeroAddress();

 _addresses = a;
 _initialized = true;
 }

 function addresses() external view override returns (Addresses memory) {
 return _addresses;
 }

 function isInitialized() external view override returns (bool) {
 return _initialized;
 }
}
