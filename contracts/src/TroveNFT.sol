// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IAddressesRegistry} from "./interfaces/IAddressesRegistry.sol";

interface ITroveManagerNotify {
    function notifyTransfer(uint256 tokenId, address from, address to) external;
}

// TroveNFT — ERC721 representing Trove positions.
// Each NFT = 1 Trove. Transfer NFT = transfer the entire position.
// Inspired by Uniswap V3 LP NFTs.
contract TroveNFT is ERC721 {
    IAddressesRegistry public immutable registry;
    
    uint256 private _nextTokenId = 1;
    
    // Minimal storage: just track which tokenId belongs to which owner
    // All trove data (debt, coll) stored in TroveManager using tokenId as key
    mapping(address => uint256) public ownerToTokenId;
    mapping(uint256 => bool) public tokenExists;
    
    error NotAuthorized();
    error TroveAlreadyExists();
    error NoTrove();
    
    constructor(IAddressesRegistry _registry) ERC721("FENUS Trove Position", "TROVE") {
        registry = _registry;
    }
    
    modifier onlyTroveManager() {
        if (msg.sender != registry.addresses().troveManager) revert NotAuthorized();
        _;
    }

    // ─── Mint/Burn (only TroveManager — owns the position lifecycle) ──────────

    function mint(address to) external onlyTroveManager returns (uint256 tokenId) {
        if (ownerToTokenId[to] != 0) revert TroveAlreadyExists();

        tokenId = _nextTokenId++;
        _mint(to, tokenId);
        ownerToTokenId[to] = tokenId;
        tokenExists[tokenId] = true;
    }

    function burn(uint256 tokenId) external onlyTroveManager {
        address owner = ownerOf(tokenId);
        ownerToTokenId[owner] = 0;
        tokenExists[tokenId] = false;
        _burn(tokenId);
    }
    
    // ─── Override transfers to update ownerToTokenId ──────────────────────────
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        // Update reverse mapping
        if (from != address(0)) {
            ownerToTokenId[from] = 0;
        }
        if (to != address(0)) {
            ownerToTokenId[to] = tokenId;
        }

        // On user-to-user transfers, ask TroveManager to re-key SortedTroves.
        // (mint/burn already happen via TM in open/closeTrove.)
        if (from != address(0) && to != address(0)) {
            address tm = registry.addresses().troveManager;
            if (tm != address(0)) {
                ITroveManagerNotify(tm).notifyTransfer(tokenId, from, to);
            }
        }

        return from;
    }
    
    // ─── View ─────────────────────────────────────────────────────────────────
    
    function getTroveTokenId(address owner) external view returns (uint256) {
        return ownerToTokenId[owner];
    }
    
    function hasTrove(address owner) external view returns (bool) {
        return ownerToTokenId[owner] != 0;
    }
    
    // ─── Metadata ─────────────────────────────────────────────────────────────
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        // TODO: Generate dynamic SVG showing debt, collateral, ratio
        // For now, return a simple JSON
        return string(abi.encodePacked(
            'data:application/json;utf8,{"name":"FENUS Trove #',
            _toString(tokenId),
            '","description":"Collateralized debt position on FENUS Protocol"',
            ',"image":"https://fenus.xyz/trove-nft.png"}'
        ));
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
