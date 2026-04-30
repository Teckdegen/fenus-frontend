// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IActivePool {
    function getCollateral() external view returns (uint256);
    function getDebt() external view returns (uint256);

    function increaseDebt(uint256 amount) external;
    function decreaseDebt(uint256 amount) external;

    function receiveCollateral(uint256 amount) external;       // pulls via transferFrom(msg.sender)
    function creditCollateral(uint256 amount) external;        // bookkeeping only; caller has already transferred
    function sendCollateral(address to, uint256 amount) external;
}

interface IDefaultPool {
    function getCollateral() external view returns (uint256);
    function getDebt() external view returns (uint256);

    function increaseDebt(uint256 amount) external;
    function decreaseDebt(uint256 amount) external;

    function creditCollateral(uint256 amount) external;        // called by ActivePool after sending tokens
    function sendCollateralToActivePool(uint256 amount) external;
}

interface ICollSurplusPool {
    function getCollateral() external view returns (uint256);
    function getUserBalance(address) external view returns (uint256);

    function accountSurplus(address account, uint256 amount) external;
    function claim(address account) external;
    function creditCollateral(uint256 amount) external;
}

interface IGasPool {
    function fund(uint256 amount18) external;
    function payLiquidator(address liquidator, uint256 amount18) external;
}
