// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// CollateralRegistry canonical registry of accepted collateral tokens.
//
// Currently the protocol supports a single collateral: WzkLTC.
// This contract exists as the authoritative on-chain source for:
// - Which token is accepted as collateral
// - The minimum collateral ratio (MCR) for that token
// - The associated TroveManager and AddressesRegistry
//
// Designed to be extensible additional collateral types can be added in
// future versions by deploying a new AddressesRegistry + TroveManager pair
// and registering it here.
contract CollateralRegistry {
 struct CollateralInfo {
 IERC20 token;
 uint256 mcr; // 18-dec, e.g. 130e16 = 130%
 address addressesRegistry;
 bool active;
 }

 address public immutable owner;
 CollateralInfo[] public collaterals;

 event CollateralAdded(address indexed token, uint256 mcr, address registry);
 event CollateralStatusChanged(uint256 indexed index, bool active);

 error NotOwner();
 error ZeroAddress();
 error InvalidMCR();
 error CollateralNotFound();

 constructor(address _owner) {
 if (_owner == address(0)) revert ZeroAddress();
 owner = _owner;
 }

 modifier onlyOwner() {
 if (msg.sender != owner) revert NotOwner();
 _;
 }

 // ─── Admin ────────────────────────────────────────────────────────────────

 // Register a new collateral type. Called once at deployment for WzkLTC.
 function addCollateral(
 IERC20 token,
 uint256 mcr,
 address addressesRegistry
 ) external onlyOwner {
 if (address(token) == address(0)) revert ZeroAddress();
 if (addressesRegistry == address(0)) revert ZeroAddress();
 if (mcr < 1e18) revert InvalidMCR(); // MCR must be at least 100%

 collaterals.push(CollateralInfo({
 token: token,
 mcr: mcr,
 addressesRegistry: addressesRegistry,
 active: true
 }));

 emit CollateralAdded(address(token), mcr, addressesRegistry);
 }

 // Enable or disable a collateral (e.g. during deprecation).
 function setCollateralActive(uint256 index, bool active) external onlyOwner {
 collaterals[index].active = active;
 emit CollateralStatusChanged(index, active);
 }

 // ─── View ─────────────────────────────────────────────────────────────────

 function getCollateralCount() external view returns (uint256) {
 return collaterals.length;
 }

 function getCollateral(uint256 index) external view returns (CollateralInfo memory) {
 return collaterals[index];
 }

 // Returns the CollateralInfo for a given token address.
 function getCollateralByToken(address token) external view returns (CollateralInfo memory, uint256 index) {
 for (uint256 i = 0; i < collaterals.length; i++) {
 if (address(collaterals[i].token) == token) {
 return (collaterals[i], i);
 }
 }
 revert CollateralNotFound();
 }

 // Returns true if the token is an active accepted collateral.
 function isAccepted(address token) external view returns (bool) {
 for (uint256 i = 0; i < collaterals.length; i++) {
 if (address(collaterals[i].token) == token && collaterals[i].active) {
 return true;
 }
 }
 return false;
 }
}
