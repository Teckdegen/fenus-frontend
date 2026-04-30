// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {Constants} from "./Constants.sol";

// PriceFeed — primary + fallback Chainlink-style oracles.
//
// Security hardening [6] — price manipulation protection:
//   - Staleness check: rejects prices older than 1 hour
//   - Deviation check: if the new price deviates more than MAX_PRICE_DEVIATION
//     (20%) from lastGoodPrice in a single update, the update is rejected and
//     the oracle falls back. This prevents a single manipulated round from
//     instantly moving the protocol price by a large amount.
//   - Both feeds must fail for more than SHUTDOWN_GRACE_PERIOD (1 hour) before
//     the protocol enters Shutdown — a brief outage does not freeze the system.
//   - No admin write path — nobody can manually set a price, ever.
contract PriceFeed is IPriceFeed {
    AggregatorV3Interface public immutable primary;
    AggregatorV3Interface public immutable fallbackOracle;

    uint256 public lastGoodPrice;
    uint256 public outageStart;
    Status  public status;

    // FIX [6]: max single-update price move — 20%.
    // A flash-loan attack that moves the oracle >20% in one block is rejected.
    uint256 private constant MAX_PRICE_DEVIATION = 20e16; // 20%

    event PriceUpdated(uint256 price18, address source);
    event OutageStarted(uint256 timestamp);
    event ShutdownEntered(uint256 timestamp);
    event PriceDeviationRejected(uint256 newPrice, uint256 lastGoodPrice, uint256 deviation);

    error InvalidOracle();
    error NoLastGoodPrice();

    constructor(address _primary, address _fallback) {
        if (_primary == address(0)) revert InvalidOracle();
        primary        = AggregatorV3Interface(_primary);
        fallbackOracle = AggregatorV3Interface(_fallback);
        status         = Status.Live;
    }

    function getLastGoodPrice() external view override returns (uint256) {
        return lastGoodPrice;
    }

    function fetchPrice() external override returns (uint256 price18, bool isLive) {
        if (status == Status.Shutdown) {
            if (lastGoodPrice == 0) revert NoLastGoodPrice();
            return (lastGoodPrice, false);
        }

        (uint256 p, bool ok) = _readOracle(primary);
        if (ok && _deviationAcceptable(p)) {
            lastGoodPrice = p;
            outageStart   = 0;
            status        = Status.Live;
            emit PriceUpdated(p, address(primary));
            return (p, true);
        }

        if (address(fallbackOracle) != address(0)) {
            (uint256 fp, bool fok) = _readOracle(fallbackOracle);
            if (fok && _deviationAcceptable(fp)) {
                lastGoodPrice = fp;
                outageStart   = 0;
                status        = Status.Live;
                emit PriceUpdated(fp, address(fallbackOracle));
                return (fp, true);
            }
        }

        // Both feeds bad or deviated too far
        if (outageStart == 0) {
            outageStart = block.timestamp;
            status      = Status.ShutdownGrace;
            emit OutageStarted(block.timestamp);
        } else if (block.timestamp - outageStart >= Constants.SHUTDOWN_GRACE_PERIOD) {
            status = Status.Shutdown;
            emit ShutdownEntered(block.timestamp);
        }

        if (lastGoodPrice == 0) revert NoLastGoodPrice();
        return (lastGoodPrice, false);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    // FIX [6]: reject price if it moves more than 20% from last known good price.
    // On first price (lastGoodPrice == 0) any price is accepted.
    function _deviationAcceptable(uint256 newPrice) internal view returns (bool) {
        if (lastGoodPrice == 0) return true;

        uint256 deviation;
        if (newPrice >= lastGoodPrice) {
            deviation = ((newPrice - lastGoodPrice) * Constants.DECIMAL_PRECISION) / lastGoodPrice;
        } else {
            deviation = ((lastGoodPrice - newPrice) * Constants.DECIMAL_PRECISION) / lastGoodPrice;
        }

        if (deviation > MAX_PRICE_DEVIATION) {
            emit PriceDeviationRejected(newPrice, lastGoodPrice, deviation);
            return false;
        }
        return true;
    }

    function _readOracle(AggregatorV3Interface oracle)
        internal view
        returns (uint256 price18, bool ok)
    {
        try oracle.decimals() returns (uint8 dec) {
            try oracle.latestRoundData() returns (
                uint80, int256 answer, uint256, uint256 updatedAt, uint80
            ) {
                if (answer <= 0) return (0, false);
                if (updatedAt == 0) return (0, false);
                if (block.timestamp - updatedAt > Constants.PRICE_STALENESS_THRESHOLD) return (0, false);

                uint256 raw = uint256(answer);
                if (dec < 18)      price18 = raw * (10 ** (18 - dec));
                else if (dec > 18) price18 = raw / (10 ** (dec - 18));
                else               price18 = raw;

                ok = price18 > 0;
            } catch { return (0, false); }
        } catch { return (0, false); }
    }
}
