// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAddressesRegistry {
    struct Addresses {
        address collateralToken;     // WzkLTC
        address fnUSD;
        address priceFeed;
        address borrowerOperations;
        address troveManager;
        address stabilityPool;
        address sortedTroves;
        address activePool;
        address defaultPool;
        address collSurplusPool;
        address gasPool;
        address redemptionHelper;
        address hintHelpers;
        address collateralRegistry;
    }

    function addresses() external view returns (Addresses memory);
    function setAddresses(Addresses calldata) external;
    function isInitialized() external view returns (bool);
}
