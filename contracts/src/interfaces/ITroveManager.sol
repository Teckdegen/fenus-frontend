// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITroveManager {
    enum Status { NonExistent, Active, ClosedByOwner, ClosedByLiquidation, ClosedByRedemption }

    struct Trove {
        uint256 debt; // 18-decimal recorded debt
        uint256 coll; // 18-decimal collateral
        uint256 stake;
        Status  status;
    }

    function getTroveOwnersCount() external view returns (uint256);
    function getTroveStatus(address) external view returns (Status);
    function getTroveColl(address) external view returns (uint256);
    function getTroveDebt(address) external view returns (uint256);
    function getCurrentICR(address owner, uint256 price) external view returns (uint256);
    function getNominalICR(address owner) external view returns (uint256);
    function getEntireDebtAndColl(address owner)
        external view returns (uint256 debt, uint256 coll);

    // BorrowerOperations callbacks. No interest rate — all Troves are 0%.
    function openTrove(address owner, uint256 coll, uint256 debt) external;
    function adjustTrove(address owner, int256 collDelta, int256 debtDelta) external;
    function closeTrove(address owner) external;

    // Liquidation / redemption.
    function liquidate(address owner) external;
    function batchLiquidate(address[] calldata owners) external;
    function redeem(uint256 fnUSDAmount18, address firstHint, uint256 maxIterations) external returns (uint256 collOut);

    function baseRate() external view returns (uint256);
    function getRedemptionFeeRate() external view returns (uint256);
    function getRedemptionRateWithDecay() external view returns (uint256);
}
