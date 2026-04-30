// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPriceFeed {
    enum Status { Live, ShutdownGrace, Shutdown }

    function fetchPrice() external returns (uint256 price18, bool isLive);
    function getLastGoodPrice() external view returns (uint256);
    function status() external view returns (Status);
}
