// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IGasPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// GasPool — holds the gas compensation reserve minted at openTrove and paid
// out to the liquidation bot at liquidation time. This gives the bot a guaranteed
// reward for calling liquidate(), ensuring undercollateralized Troves are always
// cleared promptly regardless of gas costs.
//
// Gas compensation = 200 FnUSD per Trove (hardcoded floor).
// Minted into this pool at openTrove, burned here and re-minted to the bot at liquidation.
// On normal closeTrove the 200 FnUSD is burned from the user's balance instead.
contract GasPool is IGasPool {
    IAddressesRegistry public immutable registry;

    uint256 public constant GAS_COMPENSATION = 200e18; // 200 FnUSD in 18-dec internal

    error NotAuthorized();

    constructor(IAddressesRegistry _registry) {
        registry = _registry;
    }

    modifier onlyAuthorized() {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        if (msg.sender != a.borrowerOperations && msg.sender != a.troveManager) {
            revert NotAuthorized();
        }
        _;
    }

    // Called by BorrowerOperations at openTrove.
    // Mints 200 FnUSD into this pool as the gas compensation reserve.
    function fund(uint256 amount18) external override onlyAuthorized {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        IFnUSD(a.fnUSD).mint(address(this), amount18);
    }

    // Called by TroveManager at liquidation.
    // Burns the reserve from this pool and re-mints it directly to the liquidation bot.
    function payLiquidator(address liquidator, uint256 amount18) external override onlyAuthorized {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        IFnUSD fnUSD = IFnUSD(a.fnUSD);
        fnUSD.burn(address(this), amount18);
        fnUSD.mint(liquidator, amount18);
    }
}
