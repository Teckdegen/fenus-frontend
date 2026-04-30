// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Constants.sol — All protocol parameters in one place.
library Constants {
    uint256 internal constant DECIMAL_PRECISION = 1e18;
    uint256 internal constant ONE_HUNDRED_PCT = 1e18;

    uint256 internal constant SECONDS_PER_YEAR = 365 days;

    // Decimal scaling: FnUSD external = 6 decimals, internal = 18.
    uint256 internal constant FNUSD_EXTERNAL_DECIMALS = 6;
    uint256 internal constant FNUSD_INTERNAL_DECIMALS = 18;
    uint256 internal constant FNUSD_SCALE = 1e12; // 1e18 / 1e6

    // Collateral ratio thresholds (18 decimals where 1e18 = 100%).
    uint256 internal constant MCR = 135e16; // 135%

    // Debt floors / minimums (internal 18-decimal terms).
    uint256 internal constant MIN_NET_DEBT = 500e18; // 500 FnUSD

    // Interest rate bounds (annual, 18-decimal where 1e18 = 100%).
    uint256 internal constant INTEREST_RATE_MIN = 5e15;   // 0.5%
    uint256 internal constant INTEREST_RATE_MAX = 25e17;  // 250%

    // Liquidation.
    uint256 internal constant LIQUIDATION_PENALTY = 5e16; // 5%

    // Gas compensation paid to liquidators in FnUSD (internal 18-dec).
    // Flat fee + percentage of debt are both captured here at openTrove.
    uint256 internal constant GAS_COMPENSATION = 10e18; // 10 FnUSD flat
    uint256 internal constant GAS_COMP_PCT_OF_DEBT = 5e15; // 0.5% of debt

    // Origination fee charged at openTrove (added to debt, paid to SP).
    uint256 internal constant ORIGINATION_FEE = 5e15; // 0.5%

    // Redemption fee floor; max is uncapped (dynamic baseRate decay).
    uint256 internal constant REDEMPTION_FEE_FLOOR = 5e15; // 0.5%
    uint256 internal constant MINUTE_DECAY_FACTOR = 999037758833783000; // half-life ~12h

    // Per-Trove cooldown for changing the annual interest rate.
    uint256 internal constant MIN_INTEREST_RATE_ADJUSTMENT_TIME = 7 days;

    // Oracle staleness window before fallback / shutdown is considered.
    uint256 internal constant PRICE_STALENESS_THRESHOLD = 1 hours;
    // After both feeds have been unavailable this long, system enters shutdown.
    uint256 internal constant SHUTDOWN_GRACE_PERIOD = 1 hours;
}
