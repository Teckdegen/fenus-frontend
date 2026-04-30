// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Constants.sol — All protocol parameters in one place.
library Constants {
    uint256 internal constant DECIMAL_PRECISION = 1e18;
    uint256 internal constant ONE_HUNDRED_PCT = 1e18;
    uint256 internal constant SECONDS_PER_YEAR = 365 days;

    // FnUSD: 6 decimals at the ERC20 surface, 18 decimals internally.
    uint256 internal constant FNUSD_EXTERNAL_DECIMALS = 6;
    uint256 internal constant FNUSD_INTERNAL_DECIMALS = 18;
    uint256 internal constant FNUSD_SCALE = 1e12;

    // Collateral ratios.
    uint256 internal constant MCR = 130e16; // 130% — minimum before liquidation

    // Debt floor (18-dec internal). Liquidators must be able to profitably clear this.
    uint256 internal constant MIN_NET_DEBT = 500e18; // 500 FnUSD

    // Per-Trove user-set interest rate bounds.
    uint256 internal constant INTEREST_RATE_MIN = 5e15;   // 0.5%
    uint256 internal constant INTEREST_RATE_MAX = 25e17;  // 250%

    // Liquidator bonus: liquidator pays the trove debt and receives debt * (1 + bonus)
    // worth of collateral. Trove owner gets any residual coll as surplus.
    uint256 internal constant LIQUIDATION_BONUS = 10e16; // 10%

    // One-time origination fee added to trove debt at openTrove. Routes to Treasury on close.
    uint256 internal constant ORIGINATION_FEE = 5e15; // 0.5%

    // Redemption: dynamic baseRate floor + decay. No upper cap.
    uint256 internal constant REDEMPTION_FEE_FLOOR = 5e15; // 0.5%
    uint256 internal constant MINUTE_DECAY_FACTOR = 999037758833783000; // half-life ~12h
    uint256 internal constant BETA = 2; // baseRate sensitivity to redemption volume

    // Per-Trove cooldown on changing the annual interest rate.
    uint256 internal constant MIN_INTEREST_RATE_ADJUSTMENT_TIME = 7 days;

    // Oracle freshness windows.
    uint256 internal constant PRICE_STALENESS_THRESHOLD = 1 hours;
    uint256 internal constant SHUTDOWN_GRACE_PERIOD = 1 hours;
}
