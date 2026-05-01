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

    // No minimum debt — users can deposit and borrow any amount.

    // Fixed annual interest rate — all Troves pay 1%. Not user-configurable.
    uint256 internal constant ANNUAL_INTEREST_RATE = 1e16; // 1%

    // Liquidation collateral distribution.
    // When a Trove is liquidated:
    //   1. The debt-equivalent collateral goes to Addax LP as supply — not burned.
    //   2. The surplus (coll - debt value) is split only if it exists:
    //      80% → protocol treasury
    //      20% → redistributed proportionally to active Trove holders
    uint256 internal constant LIQUIDATION_TREASURY_SHARE = 80e16; // 80% of surplus
    uint256 internal constant LIQUIDATION_HOLDER_SHARE   = 20e16; // 20% of surplus

    // One-time origination fee added to trove debt at openTrove. Routes to Treasury.
    uint256 internal constant ORIGINATION_FEE = 5e15; // 0.5%

    // Redemption: dynamic baseRate floor + decay.
    uint256 internal constant REDEMPTION_FEE_FLOOR = 5e15; // 0.5%
    uint256 internal constant MINUTE_DECAY_FACTOR = 999037758833783000; // half-life ~12h
    uint256 internal constant BETA = 2;

    // Oracle freshness windows.
    uint256 internal constant PRICE_STALENESS_THRESHOLD = 1 hours;
    uint256 internal constant SHUTDOWN_GRACE_PERIOD = 1 hours;
}
