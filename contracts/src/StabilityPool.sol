// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStabilityPool} from "./interfaces/IStabilityPool.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {Constants} from "./Constants.sol";
import {Decimals} from "./libraries/Decimals.sol";

// StabilityPool — depositors stake FnUSD which is burned on Trove liquidation in
// exchange for the trove's collateral (at a 5% bonus). The pool also receives
// FnUSD yield from origination fees and accrued Trove interest, distributed
// pro-rata to depositors.
//
// Math: three running accumulators per Liquity V1 pattern.
//   P  — running product, multiplies down on each offset.
//   S  — sum of collateral gained per unit of compounded deposit.
//   Y  — sum of FnUSD yield gained per unit of compounded deposit.
// Each depositor stores a snapshot of (P, S, Y) at deposit/claim time.
contract StabilityPool is IStabilityPool {
    using SafeERC20 for IERC20;

    IAddressesRegistry public immutable registry;

    uint256 public constant SCALE_FACTOR = 1e18;
    uint256 public P = SCALE_FACTOR;
    uint256 public S; // collateral gain accumulator (1e36 scaled to compose with P)
    uint256 public Y; // FnUSD yield accumulator (1e36 scaled)
    uint256 public totalDeposits18;

    struct Snap {
        uint256 P;
        uint256 S;
        uint256 Y;
    }

    mapping(address => uint256) public initialDeposit18;
    mapping(address => Snap) public snapshots;

    event Deposited(address indexed user, uint256 amount18);
    event Withdrawn(address indexed user, uint256 amount18);
    event GainsClaimed(address indexed user, uint256 collGain, uint256 fnUSDYield18);
    event Offset(uint256 debtBurned, uint256 collGained);
    event YieldDistributed(uint256 amount18);

    error NotAuthorized();
    error ZeroAmount();
    error InsufficientPoolDeposits();
    error InsufficientUserDeposit();

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    modifier onlyTM() {
        if (msg.sender != registry.addresses().troveManager) revert NotAuthorized();
        _;
    }

    modifier onlyTMorBO() {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (msg.sender != a.troveManager && msg.sender != a.borrowerOperations) revert NotAuthorized();
        _;
    }

    // ---- Views ----

    function getTotalFnUSDDeposits() external view override returns (uint256) {
        return totalDeposits18;
    }

    function getCompoundedDeposit(address user) public view override returns (uint256) {
        uint256 init = initialDeposit18[user];
        if (init == 0) return 0;
        Snap memory s = snapshots[user];
        // compounded = init * (P / P_snap)
        if (s.P == 0) return 0;
        uint256 c = (init * P) / s.P;
        return c;
    }

    function getCollateralGain(address user) public view override returns (uint256) {
        uint256 init = initialDeposit18[user];
        if (init == 0) return 0;
        Snap memory s = snapshots[user];
        if (s.P == 0) return 0;
        // gain = init * (S - S_snap) / P_snap
        return (init * (S - s.S)) / s.P / SCALE_FACTOR;
    }

    function getYieldGain(address user) public view returns (uint256) {
        uint256 init = initialDeposit18[user];
        if (init == 0) return 0;
        Snap memory s = snapshots[user];
        if (s.P == 0) return 0;
        return (init * (Y - s.Y)) / s.P / SCALE_FACTOR;
    }

    // ---- User actions ----

    function provideToSP(uint256 fnUSDAmount6) external override {
        if (fnUSDAmount6 == 0) revert ZeroAmount();
        uint256 amount18 = Decimals.to18(fnUSDAmount6);

        // Settle existing position before adding new deposit.
        (uint256 newCompounded, uint256 collGain, uint256 yieldGain) = _settle(msg.sender);

        // Pull FnUSD from user.
        IERC20(registry.addresses().fnUSD).safeTransferFrom(msg.sender, address(this), fnUSDAmount6);

        uint256 finalDeposit = newCompounded + amount18;
        initialDeposit18[msg.sender] = finalDeposit;
        snapshots[msg.sender] = Snap({P: P, S: S, Y: Y});

        totalDeposits18 += amount18;

        // Auto-pay accrued gains.
        _payOutGains(msg.sender, collGain, yieldGain);
        emit Deposited(msg.sender, amount18);
    }

    function withdrawFromSP(uint256 fnUSDAmount6) external override {
        uint256 amount18 = fnUSDAmount6 == 0 ? 0 : Decimals.to18(fnUSDAmount6);

        (uint256 compounded, uint256 collGain, uint256 yieldGain) = _settle(msg.sender);
        if (amount18 > compounded) amount18 = compounded;

        uint256 newDeposit = compounded - amount18;
        initialDeposit18[msg.sender] = newDeposit;
        snapshots[msg.sender] = Snap({P: P, S: S, Y: Y});

        if (amount18 > 0) {
            totalDeposits18 -= amount18;
            IERC20(registry.addresses().fnUSD).safeTransfer(msg.sender, Decimals.from18(amount18));
        }

        _payOutGains(msg.sender, collGain, yieldGain);
        emit Withdrawn(msg.sender, amount18);
    }

    function claimGains() external override {
        (uint256 compounded, uint256 collGain, uint256 yieldGain) = _settle(msg.sender);
        initialDeposit18[msg.sender] = compounded;
        snapshots[msg.sender] = Snap({P: P, S: S, Y: Y});
        _payOutGains(msg.sender, collGain, yieldGain);
    }

    function _settle(address user)
        internal
        view
        returns (uint256 compounded, uint256 collGain, uint256 yieldGain)
    {
        compounded = getCompoundedDeposit(user);
        collGain = getCollateralGain(user);
        yieldGain = getYieldGain(user);
    }

    function _payOutGains(address user, uint256 collGain, uint256 yieldGain) internal {
        if (collGain > 0) {
            IERC20(registry.addresses().collateralToken).safeTransfer(user, collGain);
        }
        if (yieldGain > 0) {
            IERC20(registry.addresses().fnUSD).safeTransfer(user, Decimals.from18(yieldGain));
        }
        if (collGain > 0 || yieldGain > 0) {
            emit GainsClaimed(user, collGain, yieldGain);
        }
    }

    // ---- Protocol callbacks ----

    // Called by TroveManager during liquidation. Burns `debtToOffset` FnUSD from
    // the pool and credits `collGained` (already pushed to this contract) to S.
    function offset(uint256 debtToOffset, uint256 collGained) external override onlyTM {
        uint256 T = totalDeposits18;
        if (T < debtToOffset) revert InsufficientPoolDeposits();

        // Update S using current P (pre-offset).
        // S += collGained * P * SCALE / T
        S += (collGained * P * SCALE_FACTOR) / T;

        // P := P * (T - D) / T
        uint256 newP = (P * (T - debtToOffset)) / T;
        // Floor P at 1 to avoid divide-by-zero pathologies.
        if (newP == 0) newP = 1;
        P = newP;

        totalDeposits18 = T - debtToOffset;

        // Burn the FnUSD that was matched against debt.
        IFnUSD(registry.addresses().fnUSD).burn(address(this), debtToOffset);

        emit Offset(debtToOffset, collGained);
    }

    // Called by BorrowerOperations / TroveManager to distribute yield. Caller must
    // have minted/transferred `amount18` of FnUSD to this contract first.
    function distributeYield(uint256 amount18) external override onlyTMorBO {
        uint256 T = totalDeposits18;
        // If pool is empty, callers must handle locally (e.g. skip the fee, send
        // elsewhere). Distributing here would strand FnUSD in the contract.
        if (T == 0) revert InsufficientPoolDeposits();

        Y += (amount18 * P * SCALE_FACTOR) / T;
        totalDeposits18 = T + amount18;
        emit YieldDistributed(amount18);
    }
}
