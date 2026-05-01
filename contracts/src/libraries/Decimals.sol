// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Constants} from "../Constants.sol";

// Decimals.sol Hard boundary between FnUSD's external 6-decimal ERC20 surface
// and the protocol's internal 18-decimal accounting. All math elsewhere assumes 18.
library Decimals {
 function to18(uint256 amount6) internal pure returns (uint256) {
 return amount6 * Constants.FNUSD_SCALE;
 }

 function from18(uint256 amount18) internal pure returns (uint256) {
 return amount18 / Constants.FNUSD_SCALE;
 }

 // Truncating from18 with rounding-up, used when burning to ensure debt is fully cleared.
 function from18RoundUp(uint256 amount18) internal pure returns (uint256) {
 return (amount18 + Constants.FNUSD_SCALE - 1) / Constants.FNUSD_SCALE;
 }
}
