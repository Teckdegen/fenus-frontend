// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// SortedTroves — doubly-linked list of Trove owners ordered by NICR descending
// (head = highest NICR / safest, tail = lowest NICR / riskiest). NICR is
// price-independent so the list does not require resorting on price changes.
contract SortedTroves is ISortedTroves {
    IAddressesRegistry public immutable registry;

    struct Node {
        bool exists;
        address next; // toward tail (lower NICR)
        address prev; // toward head (higher NICR)
    }

    address public head;
    address public tail;
    uint256 public size;
    mapping(address => Node) public nodes;

    error NotAuthorized();
    error AlreadyExists();
    error NotFound();
    error ZeroNICR();

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    modifier onlyTMorBO() {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (msg.sender != a.troveManager && msg.sender != a.borrowerOperations) revert NotAuthorized();
        _;
    }

    function contains(address owner) external view returns (bool) { return nodes[owner].exists; }
    function isEmpty() external view returns (bool) { return size == 0; }
    function getSize() external view returns (uint256) { return size; }
    function getFirst() external view returns (address) { return head; }
    function getLast() external view returns (address) { return tail; }
    function getNext(address owner) external view returns (address) { return nodes[owner].next; }
    function getPrev(address owner) external view returns (address) { return nodes[owner].prev; }

    function insert(address owner, uint256 nicr, address prevHint, address nextHint) external onlyTMorBO {
        _insert(owner, nicr, prevHint, nextHint);
    }

    function remove(address owner) external onlyTMorBO {
        _remove(owner);
    }

    function reInsert(address owner, uint256 newNICR, address prevHint, address nextHint) external onlyTMorBO {
        _remove(owner);
        _insert(owner, newNICR, prevHint, nextHint);
    }

    function findInsertPosition(uint256 nicr, address prevHint, address nextHint)
        external view returns (address, address)
    {
        return _findInsertPosition(nicr, prevHint, nextHint);
    }

    function _insert(address owner, uint256 nicr, address prevHint, address nextHint) internal {
        if (nodes[owner].exists) revert AlreadyExists();
        if (nicr == 0) revert ZeroNICR();

        (address prev, address next) = _findInsertPosition(nicr, prevHint, nextHint);
        nodes[owner] = Node({exists: true, prev: prev, next: next});

        if (prev == address(0)) head = owner;
        else nodes[prev].next = owner;

        if (next == address(0)) tail = owner;
        else nodes[next].prev = owner;

        size++;
    }

    function _remove(address owner) internal {
        Node memory n = nodes[owner];
        if (!n.exists) revert NotFound();

        if (n.prev != address(0)) nodes[n.prev].next = n.next;
        else head = n.next;

        if (n.next != address(0)) nodes[n.next].prev = n.prev;
        else tail = n.prev;

        delete nodes[owner];
        size--;
    }

    // Returns the (prev, next) pair around the slot where `nicr` should sit.
    // Invariant: NICR(prev) >= nicr >= NICR(next).
    function _findInsertPosition(uint256 nicr, address prevHint, address nextHint)
        internal view returns (address prev, address next)
    {
        if (size == 0) return (address(0), address(0));

        ITroveManager tm = ITroveManager(registry.addresses().troveManager);

        // Validate hints; drop them if they no longer hold the invariant.
        if (prevHint != address(0) && (!nodes[prevHint].exists || tm.getNominalICR(prevHint) < nicr)) {
            prevHint = address(0);
        }
        if (nextHint != address(0) && (!nodes[nextHint].exists || tm.getNominalICR(nextHint) > nicr)) {
            nextHint = address(0);
        }

        if (prevHint == address(0) && nextHint == address(0)) {
            return _walkFromHead(nicr, tm);
        } else if (prevHint != address(0)) {
            return _walkFromPrev(nicr, prevHint, tm);
        } else {
            return _walkFromNext(nicr, nextHint, tm);
        }
    }

    function _walkFromHead(uint256 nicr, ITroveManager tm) internal view returns (address, address) {
        address cur = head;
        while (cur != address(0) && tm.getNominalICR(cur) > nicr) {
            cur = nodes[cur].next;
        }
        // cur is the first node with NICR <= nicr (or 0). prev is its predecessor.
        return (cur == address(0) ? tail : nodes[cur].prev, cur);
    }

    function _walkFromPrev(uint256 nicr, address start, ITroveManager tm)
        internal view returns (address prev, address next)
    {
        prev = start;
        // Walk forward (toward tail) while next still has higher NICR than nicr.
        next = nodes[prev].next;
        while (next != address(0) && tm.getNominalICR(next) > nicr) {
            prev = next;
            next = nodes[next].next;
        }
    }

    function _walkFromNext(uint256 nicr, address start, ITroveManager tm)
        internal view returns (address prev, address next)
    {
        next = start;
        // Walk backward while prev has lower NICR than nicr.
        prev = nodes[next].prev;
        while (prev != address(0) && tm.getNominalICR(prev) < nicr) {
            next = prev;
            prev = nodes[prev].prev;
        }
    }
}
