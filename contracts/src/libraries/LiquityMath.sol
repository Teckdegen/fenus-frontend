// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Constants} from "../Constants.sol";

library LiquityMath {
    uint256 internal constant NICR_PRECISION = 1e20;

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function _max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    // Exponentiation by squaring on a 1e18 fixed-point base. Used for baseRate decay.
    function _decPow(uint256 base, uint256 exp) internal pure returns (uint256) {
        if (exp == 0) return Constants.DECIMAL_PRECISION;

        uint256 y = Constants.DECIMAL_PRECISION;
        uint256 x = base;
        uint256 n = exp;

        while (n > 1) {
            if (n % 2 == 0) {
                x = (x * x) / Constants.DECIMAL_PRECISION;
                n = n / 2;
            } else {
                y = (x * y) / Constants.DECIMAL_PRECISION;
                x = (x * x) / Constants.DECIMAL_PRECISION;
                n = (n - 1) / 2;
            }
        }
        return (x * y) / Constants.DECIMAL_PRECISION;
    }

    // ICR = coll * price / debt (all 1e18). Returns max uint if debt is zero.
    function _computeCR(uint256 coll, uint256 debt, uint256 price) internal pure returns (uint256) {
        if (debt == 0) return type(uint256).max;
        return (coll * price) / debt;
    }

    // NICR = coll * 1e20 / debt — price-independent ranking for SortedTroves.
    function _computeNominalCR(uint256 coll, uint256 debt) internal pure returns (uint256) {
        if (debt == 0) return type(uint256).max;
        return (coll * NICR_PRECISION) / debt;
    }
}
