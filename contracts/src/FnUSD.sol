// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {Decimals} from "./libraries/Decimals.sol";

// FnUSD — USD-pegged stablecoin. ERC20 surface is 6 decimals; mint/burn are
// called with 18-decimal amounts and scaled down internally so balances/transfers
// always remain in 6-decimal units.
contract FnUSD is ERC20, IFnUSD {
    IAddressesRegistry public immutable registry;

    error NotAuthorized();

    constructor(IAddressesRegistry _registry) ERC20("Fenus Dollar", "FnUSD") {
        registry = _registry;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function _authorized(address caller) internal view returns (bool) {
        if (!registry.isInitialized()) return false;
        IAddressesRegistry.Addresses memory a = registry.addresses();
        return caller == a.borrowerOperations
            || caller == a.troveManager
            || caller == a.stabilityPool
            || caller == a.gasPool
            || caller == a.redemptionHelper;
    }

    function mint(address to, uint256 amount18) external override {
        if (!_authorized(msg.sender)) revert NotAuthorized();
        _mint(to, Decimals.from18(amount18));
    }

    function burn(address from, uint256 amount18) external override {
        if (!_authorized(msg.sender)) revert NotAuthorized();
        _burn(from, Decimals.from18RoundUp(amount18));
    }

    function authorizedSender() external view override returns (address) {
        // Convenience accessor — returns BorrowerOperations as canonical caller.
        return registry.addresses().borrowerOperations;
    }
}
