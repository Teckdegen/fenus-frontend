// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFnUSD is IERC20 {
    // Mint amount in 18-decimal internal terms; contract converts down to 6-dec ERC20 balance.
    function mint(address to, uint256 amount18) external;
    function burn(address from, uint256 amount18) external;
    function authorizedSender() external view returns (address);
}
