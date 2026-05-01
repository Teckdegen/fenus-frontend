// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {Constants} from "./Constants.sol";

// Chainlink AggregatorV3 adapter interface — used by DIA on LitVM
interface IAdapter {
    function latestRoundData() external view returns (
        uint80  roundId,
        int256  answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80  answeredInRound
    );
    function decimals() external view returns (uint8);
}

// PriceFeed — wraps the DIA Chainlink-adapter oracle for LTC/USD on LitVM LiteForge.
//
// Oracle address : 0x45dDa5d881BD2C917976CCfde74fFd6f6412da29
// Interface      : Chainlink AggregatorV3 adapter (latestRoundData)
// Decimals       : 18 (DIA LitVM adapters return 18-decimal prices)
// Heartbeat      : 1 hour
contract PriceFeed is IPriceFeed {

    IAdapter public immutable primary;
    IAdapter public immutable fallbackOracle;

    // Max single-update price deviation: 20%
    uint256 private constant MAX_DEVIATION = 20e16;

    uint256 public lastGoodPrice;
    uint256 public outageStart;
    Status  public status;

    event PriceUpdated(uint256 price18, address source);
    event OutageStarted(uint256 timestamp);
    event ShutdownEntered(uint256 timestamp);
    event PriceDeviationRejected(uint256 newPrice, uint256 lastGoodPrice, uint256 deviation);

    error InvalidOracle();
    error NoLastGoodPrice();

    constructor(address _primary, address _fallback) {
        if (_primary == address(0)) revert InvalidOracle();
        primary        = IAdapter(_primary);
        fallbackOracle = IAdapter(_fallback);
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

        (uint256 p, bool ok) = _readAdapter(primary);
        if (ok && _deviationOk(p)) {
            lastGoodPrice = p;
            outageStart   = 0;
            status        = Status.Live;
            emit PriceUpdated(p, address(primary));
            return (p, true);
        }

        if (address(fallbackOracle) != address(0)) {
            (uint256 fp, bool fok) = _readAdapter(fallbackOracle);
            if (fok && _deviationOk(fp)) {
                lastGoodPrice = fp;
                outageStart   = 0;
                status        = Status.Live;
                emit PriceUpdated(fp, address(fallbackOracle));
                return (fp, true);
            }
        }

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

    function _readAdapter(IAdapter adapter)
        internal view
        returns (uint256 price18, bool ok)
    {
        try adapter.latestRoundData() returns (
            uint80, int256 answer, uint256, uint256 updatedAt, uint80
        ) {
            if (answer <= 0)  return (0, false);
            if (updatedAt == 0) return (0, false);
            if (block.timestamp - updatedAt > Constants.PRICE_STALENESS_THRESHOLD) return (0, false);

            // DIA LitVM adapters return 18-decimal prices directly
            price18 = uint256(answer);
            ok      = price18 > 0;
        } catch {
            return (0, false);
        }
    }

    function _deviationOk(uint256 newPrice) internal returns (bool) {
        if (lastGoodPrice == 0) return true;

        uint256 deviation;
        if (newPrice >= lastGoodPrice) {
            deviation = ((newPrice - lastGoodPrice) * Constants.DECIMAL_PRECISION) / lastGoodPrice;
        } else {
            deviation = ((lastGoodPrice - newPrice) * Constants.DECIMAL_PRECISION) / lastGoodPrice;
        }

        if (deviation > MAX_DEVIATION) {
            emit PriceDeviationRejected(newPrice, lastGoodPrice, deviation);
            return false;
        }
        return true;
    }
}
