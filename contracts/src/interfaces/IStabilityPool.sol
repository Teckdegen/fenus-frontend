// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IStabilityPool {
    function provideToSP(uint256 fnUSDAmount6) external;
    function withdrawFromSP(uint256 fnUSDAmount6) external;
    function claimGains() external;

    function getTotalFnUSDDeposits() external view returns (uint256);
    function getCollateralGain(address) external view returns (uint256);
    function getCompoundedDeposit(address) external view returns (uint256);

    // Called by TroveManager during liquidation: burn `debtToOffset` of FnUSD,
    // credit `collGained` (18-dec) to the pool.
    function offset(uint256 debtToOffset, uint256 collGained) external;

    // Called by TroveManager / BorrowerOperations to distribute origination fees / interest.
    function distributeYield(uint256 fnUSDAmount18) external;
}
