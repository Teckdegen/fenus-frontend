// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBorrowerOperations {
    // collAmount in 18-dec WzkLTC wei. fnUSDAmount in 6-dec external units.
    // Interest rate is fixed at 1% — not user-configurable.
    function openTrove(uint256 collAmount, uint256 fnUSDAmount6,
                       address upperHint, address lowerHint) external;

    function addColl(uint256 collAmount, address upperHint, address lowerHint) external;
    function withdrawColl(uint256 collAmount, address upperHint, address lowerHint) external;
    function withdrawFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external;
    function repayFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external;

    function closeTrove() external;
    function claimCollateral() external;
}
