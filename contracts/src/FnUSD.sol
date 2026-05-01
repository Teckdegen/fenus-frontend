// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IFnUSD} from "./interfaces/IFnUSD.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";
import {Decimals} from "./libraries/Decimals.sol";

// FnUSD — USD-pegged stablecoin.
// ERC20 surface is 6 decimals; mint/burn use 18-decimal amounts internally.
//
// On-chain metadata (readable by wallets, explorers, DEXs):
//   logoURI()     — token image URL (EIP-7572 / standard convention)
//   contractURI() — JSON metadata blob (OpenSea / EIP-7572 standard)
contract FnUSD is ERC20, IFnUSD {
    IAddressesRegistry public immutable registry;

    // Token image — stored on-chain so any wallet/explorer can read it
    string private constant LOGO_URI =
        "https://www.image2url.com/r2/default/images/1777632157848-482b63d8-a570-4f01-bc38-94ba9ebe0722.jpg";

    error NotAuthorized();

    constructor(IAddressesRegistry _registry) ERC20("Fenus Dollar", "FnUSD") {
        registry = _registry;
    }

    // ─── ERC20 overrides ──────────────────────────────────────────────────────

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // ─── On-chain metadata ────────────────────────────────────────────────────

    // logoURI — returns the token image URL.
    // Wallets and block explorers call this to display the token icon.
    function logoURI() external pure returns (string memory) {
        return LOGO_URI;
    }

    // contractURI — returns a JSON metadata string (EIP-7572).
    // Compatible with OpenSea, Uniswap token lists, and most modern wallets.
    function contractURI() external pure returns (string memory) {
        return string(abi.encodePacked(
            '{"name":"Fenus Dollar",'
            '"symbol":"FnUSD",'
            '"decimals":6,'
            '"description":"FnUSD is the USD-pegged stablecoin of the FENUS protocol on LitVM LiteForge. Mint FnUSD by depositing WzkLTC as collateral.",'
            '"image":"', LOGO_URI, '",'
            '"external_link":"https://fenus.xyz"}'
        ));
    }

    // ─── Mint / Burn ──────────────────────────────────────────────────────────

    function _authorized(address caller) internal view returns (bool) {
        if (!registry.isInitialized()) return false;
        IAddressesRegistry.Addresses memory a = registry.addresses();
        return caller == a.borrowerOperations
            || caller == a.troveManager
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
        return registry.addresses().borrowerOperations;
    }
}
