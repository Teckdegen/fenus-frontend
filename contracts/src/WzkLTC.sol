// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// WzkLTC — Wrapped token for the protocol.
//
// Two ways to get WzkLTC:
//
//   1. Bridge (normal users):
//      Users send native tokens to this contract via wrap(). They receive
//      WzkLTC 1:1. They can unwrap back at any time via unwrap().
//
//   2. Admin mint (faucet / testnet):
//      The admin can call adminMint() to mint any amount to any address.
//      Used to fund the testnet faucet. On mainnet this should be renounced
//      or transferred to a multisig after the bridge is live.
//
// Decimals: 8 — standard precision.
contract WzkLTC is ERC20, ReentrancyGuard {
    using SafeERC20 for ERC20;

    address public admin;
    address public pendingAdmin;

    uint256 public totalWrapped; // total native zkLTC held by this contract

    event Wrapped(address indexed user, uint256 amount);
    event Unwrapped(address indexed user, uint256 amount);
    event AdminMinted(address indexed to, uint256 amount);
    event AdminTransferStarted(address indexed newAdmin);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    event AdminRenounced();

    error NotAdmin();
    error NotPendingAdmin();
    error ZeroAmount();
    error InsufficientNativeBalance();
    error NativeTransferFailed();
    error AdminAlreadyRenounced();

    constructor(address _admin) ERC20("WzkLTC", "wzkLTC") {
        if (_admin == address(0)) revert NotAdmin();
        admin = _admin;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    // ─── Decimals ─────────────────────────────────────────────────────────────

    function decimals() public pure override returns (uint8) {
        return 8; // matches native Litecoin
    }

    // ─── Wrap — user sends native zkLTC, receives WzkLTC 1:1 ─────────────────

    function wrap() external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        totalWrapped += msg.value;
        _mint(msg.sender, msg.value);
        emit Wrapped(msg.sender, msg.value);
    }

    // ─── Unwrap — user burns WzkLTC, receives native zkLTC 1:1 ───────────────

    function unwrap(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (address(this).balance < amount) revert InsufficientNativeBalance();

        totalWrapped -= amount;
        _burn(msg.sender, amount);

        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert NativeTransferFailed();

        emit Unwrapped(msg.sender, amount);
    }

    // ─── Admin mint — faucet / testnet use ────────────────────────────────────

    // Mints WzkLTC without requiring native zkLTC backing.
    // Use for testnet faucet. On mainnet: renounce after bridge is live.
    function adminMint(address to, uint256 amount) external onlyAdmin {
        if (amount == 0) revert ZeroAmount();
        _mint(to, amount);
        emit AdminMinted(to, amount);
    }

    // ─── Admin transfer (two-step for safety) ─────────────────────────────────

    // Step 1: current admin nominates a new admin
    function transferAdmin(address newAdmin) external onlyAdmin {
        pendingAdmin = newAdmin;
        emit AdminTransferStarted(newAdmin);
    }

    // Step 2: new admin accepts — prevents accidentally transferring to wrong address
    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) revert NotPendingAdmin();
        emit AdminTransferred(admin, msg.sender);
        admin        = msg.sender;
        pendingAdmin = address(0);
    }

    // Permanently remove admin privileges — call after bridge is live on mainnet.
    // Once renounced, adminMint can never be called again.
    function renounceAdmin() external onlyAdmin {
        emit AdminRenounced();
        admin        = address(0);
        pendingAdmin = address(0);
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    function nativeReserve() external view returns (uint256) {
        return address(this).balance;
    }

    // ─── Receive native zkLTC ─────────────────────────────────────────────────

    receive() external payable {
        // Allow direct sends — treated as wrap()
        if (msg.value > 0) {
            totalWrapped += msg.value;
            _mint(msg.sender, msg.value);
            emit Wrapped(msg.sender, msg.value);
        }
    }
}
