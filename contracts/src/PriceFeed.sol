// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IDIAOracle} from "./interfaces/IDIAOracle.sol";
import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {Constants} from "./Constants.sol";

// PriceFeed — wraps the DIA oracle at 0x45dDa5d881BD2C917976CCfde74fFd6f6412da29
// on LitVM LiteForge (chainId 4441).
//
// DIA returns prices with 8 decimals. This contract scales to 18 decimals
// for internal protocol use.
//
// Security:
//   - Staleness check: rejects prices older than 1 hour
//   - Deviation check: rejects any single update that moves >20% from
//     lastGoodPrice — blocks flash-loan oracle manipulation
//   - Fallback: optional second DIA feed. If primary fails, tries fallback.
//   - Grace period: both feeds must be down for 1 hour before Shutdown
//   - No admin write path: nobody can manually set a price
//
// Pair key: "LTC/USD" — DIA's identifier for Litecoin/USD
contract PriceFeed is IPriceFeed {
    IDIAOracle public immutable primary;
    IDIAOracle public immutable fallbackOracle; // address(0) = no fallback

    // The DIA key for the asset pair
    string public constant PAIR_KEY = "LTC/USD";

    // DIA returns 8-decimal prices — scale to 18 for protocol math
    uint256 private constant DIA_DECIMALS    = 8;
    uint256 private constant SCALE_TO_18     = 10 ** (18 - DIA_DECIMALS); // 1e10

    // Max single-update price deviation: 20%
    uint256 private constant MAX_DEVIATION   = 20e16;

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
        primary        = IDIAOracle(_primary);
        fallbackOracle = IDIAOracle(_fallback); // zero = no fallback
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

        // Try primary DIA feed
        (uint256 p, bool ok) = _readDIA(primary);
        if (ok && _deviationOk(p)) {
            lastGoodPrice = p;
            outageStart   = 0;
            status        = Status.Live;
            emit PriceUpdated(p, address(primary));
            return (p, true);
        }

        // Try fallback DIA feed
        if (address(fallbackOracle) != address(0)) {
            (uint256 fp, bool fok) = _readDIA(fallbackOracle);
            if (fok && _deviationOk(fp)) {
                lastGoodPrice = fp;
                outageStart   = 0;
                status        = Status.Live;
                emit PriceUpdated(fp, address(fallbackOracle));
                return (fp, true);
            }
        }

        // Both feeds bad — track outage clock
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

    function _readDIA(IDIAOracle oracle)
        internal
        view
        returns (uint256 price18, bool ok)
    {
        try oracle.getValue(PAIR_KEY) returns (uint128 price, uint128 timestamp) {
            if (price == 0)     return (0, false);
            if (timestamp == 0) return (0, false);
            // Staleness check
            if (block.timestamp - uint256(timestamp) > Constants.PRICE_STALENESS_THRESHOLD) {
                return (0, false);
            }
            // Scale 8-dec DIA price → 18-dec internal
            price18 = uint256(price) * SCALE_TO_18;
            ok      = price18 > 0;
        } catch {
            return (0, false);
        }
    }

    // Reject if new price moves >20% from last known good in one update
    function _deviationOk(uint256 newPrice) internal view returns (bool) {
        if (lastGoodPrice == 0) return true; // first price — accept anything

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
