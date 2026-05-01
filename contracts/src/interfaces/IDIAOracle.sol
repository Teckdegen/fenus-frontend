// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// IDIAOracle — DIA oracle interface.
// getValue(key) returns (price, timestamp)
// price is 8-decimal fixed point (same as Chainlink).
// key is the asset pair string e.g. "LTC/USD"
interface IDIAOracle {
    function getValue(string memory key)
        external
        view
        returns (uint128 price, uint128 timestamp);
}
