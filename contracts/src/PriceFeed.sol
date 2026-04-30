// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {Constants} from "./Constants.sol";

// PriceFeed — primary + fallback Chainlink-style oracles. Returns 18-decimal price.
// On primary failure, tries fallback. If both fail past the grace period, enters
// permanent Shutdown. Admin can never write a price.
contract PriceFeed is IPriceFeed {
    AggregatorV3Interface public immutable primary;
    AggregatorV3Interface public immutable fallbackOracle;

    uint256 public lastGoodPrice;
    uint256 public outageStart; // timestamp when both feeds first went bad; 0 = healthy
    Status public status;

    event PriceUpdated(uint256 price18, address source);
    event OutageStarted(uint256 timestamp);
    event ShutdownEntered(uint256 timestamp);

    error InvalidOracle();
    error NoLastGoodPrice();

    constructor(address _primary, address _fallback) {
        if (_primary == address(0)) revert InvalidOracle();
        primary = AggregatorV3Interface(_primary);
        fallbackOracle = AggregatorV3Interface(_fallback); // zero allowed = no fallback
        status = Status.Live;
    }

    function getLastGoodPrice() external view override returns (uint256) {
        return lastGoodPrice;
    }

    // fetchPrice — called by protocol contracts. Updates lastGoodPrice when fresh data
    // is available; tracks outage clock when both feeds are down.
    function fetchPrice() external override returns (uint256 price18, bool isLive) {
        if (status == Status.Shutdown) {
            if (lastGoodPrice == 0) revert NoLastGoodPrice();
            return (lastGoodPrice, false);
        }

        (uint256 p, bool ok) = _readOracle(primary);
        if (ok) {
            lastGoodPrice = p;
            outageStart = 0;
            status = Status.Live;
            emit PriceUpdated(p, address(primary));
            return (p, true);
        }

        if (address(fallbackOracle) != address(0)) {
            (uint256 fp, bool fok) = _readOracle(fallbackOracle);
            if (fok) {
                lastGoodPrice = fp;
                outageStart = 0;
                status = Status.Live;
                emit PriceUpdated(fp, address(fallbackOracle));
                return (fp, true);
            }
        }

        // Both feeds bad. Track outage.
        if (outageStart == 0) {
            outageStart = block.timestamp;
            status = Status.ShutdownGrace;
            emit OutageStarted(block.timestamp);
        } else if (block.timestamp - outageStart >= Constants.SHUTDOWN_GRACE_PERIOD) {
            status = Status.Shutdown;
            emit ShutdownEntered(block.timestamp);
        }

        if (lastGoodPrice == 0) revert NoLastGoodPrice();
        return (lastGoodPrice, false);
    }

    function _readOracle(AggregatorV3Interface oracle) internal view returns (uint256 price18, bool ok) {
        try oracle.decimals() returns (uint8 dec) {
            try oracle.latestRoundData() returns (
                uint80, int256 answer, uint256, uint256 updatedAt, uint80
            ) {
                if (answer <= 0) return (0, false);
                if (updatedAt == 0) return (0, false);
                if (block.timestamp - updatedAt > Constants.PRICE_STALENESS_THRESHOLD) return (0, false);

                uint256 raw = uint256(answer);
                if (dec < 18) {
                    price18 = raw * (10 ** (18 - dec));
                } else if (dec > 18) {
                    price18 = raw / (10 ** (dec - 18));
                } else {
                    price18 = raw;
                }
                ok = price18 > 0;
            } catch {
                return (0, false);
            }
        } catch {
            return (0, false);
        }
    }
}
