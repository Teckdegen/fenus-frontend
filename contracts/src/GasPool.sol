// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IGasPool} from "./interfaces/IPools.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

// GasPool — holds the gas compensation reserve (200 FnUSD per Trove) that is
// minted at openTrove and burned/paid out at closeTrove or liquidation.
// Liquidators receive the gas compensation as an incentive to call liquidate().
contract GasPool is IGasPool {
    IAddressesRegistry public immutable registry;

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

    // Called by BorrowerOperations at openTrove — mints gas compensation into this pool.
    function fund(uint256 amount18) external override onlyAuthorized {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        IFnUSD(a.fnUSD).mint(address(this), amount18);
    }

    // Called by TroveManager at liquidation — transfers gas comp to the liquidator.
    function payLiquidator(address liquidator, uint256 amount18) external override onlyAuthorized {
        IAddressesRegistry.Addresses memory a = registry.addresses();
        IFnUSD(a.fnUSD).burn(address(this), amount18);
        // Re-mint directly to liquidator (burn+mint keeps 6-dec ERC20 accounting clean).
        IFnUSD(a.fnUSD).mint(liquidator, amount18);
    }
}
