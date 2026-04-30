// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISortedTroves {
    function insert(address owner, uint256 nicr, address prevHint, address nextHint) external;
    function remove(address owner) external;
    function reInsert(address owner, uint256 newNICR, address prevHint, address nextHint) external;

    function contains(address owner) external view returns (bool);
    function isEmpty() external view returns (bool);
    function getSize() external view returns (uint256);
    function getFirst() external view returns (address);
    function getLast() external view returns (address);
    function getNext(address owner) external view returns (address);
    function getPrev(address owner) external view returns (address);

    function findInsertPosition(uint256 nicr, address prevHint, address nextHint)
        external view returns (address, address);
}
