// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBorrowerOperations {
    // collAmount in 8-dec WzkLTC units. fnUSDAmount in 6-dec external units.
    // No interest rate — all Troves are 0% APR.
    function openTrove(uint256 collAmount, uint256 fnUSDAmount6,
                       address upperHint, address lowerHint) external;

    function addColl(uint256 collAmount, address upperHint, address lowerHint) external;
    function withdrawColl(uint256 collAmount, address upperHint, address lowerHint) external;
    function withdrawFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external;
    function repayFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external;

    function closeTrove() external;
    function claimCollateral() external;
}
