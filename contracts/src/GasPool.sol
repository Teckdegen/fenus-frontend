// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IGasPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// GasPool — retained as a registered address in AddressesRegistry but
// no longer used. Gas compensation was removed because the protocol runs
// its own liquidation bot and keeps all liquidation proceeds.
// fund() and payLiquidator() are no-ops.
contract GasPool is IGasPool {
    IAddressesRegistry public immutable registry;

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    // No-op — gas compensation removed
    function fund(uint256) external override {}

    // No-op — bot receives no on-chain payment
    function payLiquidator(address, uint256) external override {}
}
