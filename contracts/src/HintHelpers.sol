// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {ITroveManager} from "./interfaces/ITroveManager.sol";
import {ISortedTroves} from "./interfaces/ISortedTroves.sol";
import {LiquityMath} from "./libraries/LiquityMath.sol";

// HintHelpers — off-chain helper for computing SortedTroves insertion hints.
//
// When a user opens or adjusts a Trove, they must supply (upperHint, lowerHint)
// so BorrowerOperations can insert them into the sorted list efficiently without
// walking the entire list on-chain. This contract provides the hint computation
// so the frontend/bot can call getApproxHint() off-chain (eth_call) before
// submitting the transaction.
//
// getApproxHint uses a random walk through the list to find a node close to the
// target NICR. The frontend then refines it with SortedTroves.findInsertPosition().
contract HintHelpers {
    IAddressesRegistry public immutable registry;

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    // Returns the NICR a Trove would have after a hypothetical open/adjust.
    // Used by the frontend to compute the hint before submitting a tx.
    function computeNominalCR(uint256 coll, uint256 debt) external pure returns (uint256) {
        return LiquityMath._computeNominalCR(coll, debt);
    }

    // Returns the ICR a Trove would have at a given price.
    function computeCR(uint256 coll, uint256 debt, uint256 price) external pure returns (uint256) {
        return LiquityMath._computeCR(coll, debt, price);
    }

    // getApproxHint — random-walk approximation for SortedTroves insertion.
    //
    // Samples `numTrials` random nodes from the list and returns the one whose
    // NICR is closest to `targetNICR`. The caller then passes this as a hint to
    // SortedTroves.findInsertPosition() which does the precise walk.
    //
    // `inputRandomSeed` — any uint256 from the caller (e.g. block.timestamp off-chain).
    // More trials = better hint = less on-chain gas for the actual insert.
    // Recommended: numTrials = sqrt(listSize) * 15.
    function getApproxHint(
        uint256 targetNICR,
        uint256 numTrials,
        uint256 inputRandomSeed
    ) external view returns (address hintAddress, uint256 diff, uint256 latestRandomSeed) {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        ISortedTroves sortedTroves = ISortedTroves(a.sortedTroves);
        ITroveManager troveManager = ITroveManager(a.troveManager);

        uint256 listSize = sortedTroves.getSize();
        if (listSize == 0 || numTrials == 0) {
            return (address(0), 0, inputRandomSeed);
        }

        hintAddress = sortedTroves.getLast();
        diff = _absDiff(troveManager.getNominalICR(hintAddress), targetNICR);
        latestRandomSeed = inputRandomSeed;

        uint256 i = 0;
        while (i < numTrials) {
            latestRandomSeed = uint256(keccak256(abi.encodePacked(latestRandomSeed)));
            uint256 arrayIndex = latestRandomSeed % listSize;

            // Walk from head to the sampled index
            address currentAddress = sortedTroves.getFirst();
            for (uint256 j = 0; j < arrayIndex; j++) {
                currentAddress = sortedTroves.getNext(currentAddress);
                if (currentAddress == address(0)) break;
            }

            if (currentAddress == address(0)) {
                i++;
                continue;
            }

            uint256 currentNICR = troveManager.getNominalICR(currentAddress);
            uint256 currentDiff = _absDiff(currentNICR, targetNICR);

            if (currentDiff < diff) {
                diff = currentDiff;
                hintAddress = currentAddress;
            }

            i++;
        }
    }

    // Returns the address of the Trove that would be just above the given NICR
    // in the sorted list — useful for computing the upper hint directly.
    function getInsertPosition(
        uint256 nicr,
        address prevHint,
        address nextHint
    ) external view returns (address upperHint, address lowerHint) {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        ISortedTroves sortedTroves = ISortedTroves(a.sortedTroves);
        return sortedTroves.findInsertPosition(nicr, prevHint, nextHint);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _absDiff(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a - b : b - a;
    }
}
