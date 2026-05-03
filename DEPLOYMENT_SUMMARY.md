# FENUS Protocol - Fresh Deployment Summary
**Date:** May 3, 2026  
**Network:** LitVM LiteForge (Chain ID: 4441)  
**Deployer:** 0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df

---

## ✅ Deployment Status: COMPLETE

All contracts have been successfully deployed and the AddressesRegistry is **FROZEN** (immutable).

---

## 📋 Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| **AddressesRegistry** | `0xAE3A7af98cfE48910cCf5495d3ADcAb37026eeDf` | 🔒 FROZEN |
| **WzkLTC** | `0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec` | ✅ Existing (NOT redeployed) |
| **FnUSD** | `0x219F2AC287458cD58aB46ABd3cfbe451728323f4` | ✅ New |
| **PriceFeed** | `0x39992B70D9C36902aeE699185E94d021BDa94ab6` | ✅ New |
| **ActivePool** | `0x164f3C4F3f3a047c5005fAFABE9e0b1227BC8a0B` | ✅ New |
| **DefaultPool** | `0x8b72d0FfDa721f9E62eC9a0ae5A35273961cD3F0` | ✅ New |
| **CollSurplusPool** | `0xb29fEf2f09229C9f77e9528185AB204d19668Af7` | ✅ New |
| **GasPool** | `0xdA00c1C3d32e5B59E7a9b85dfAa47592C77CCA25` | ✅ New |
| **SortedTroves** | `0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d` | ✅ New |
| **TroveNFT** | `0x3A856810c38a0446692c8C44400A09Dc9bAA519f` | ✅ New |
| **TroveManager** | `0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4` | ✅ New |
| **BorrowerOperations** | `0x70ae94769345031F7fC9C611d8bC822bCFcfB111` | ✅ New |
| **RedemptionHelper** | `0x693054a3FEacEd02345D47Fe19EeF5719f473035` | ✅ New |
| **HintHelpers** | `0xac4506c363430c90A1dc25d452778f10737aabC0` | ✅ New |
| **CollateralRegistry** | `0x23D5e06576FCA811F5da9594491972C085B83490` | ✅ New |

---

## 🔧 What Was Updated

### 1. **Contracts (Redeployed)**
- ✅ All contracts except WzkLTC were redeployed
- ✅ WzkLTC kept from previous deployment (as requested)
- ✅ AddressesRegistry frozen with all new addresses
- ✅ WzkLTC registered as collateral with 130% MCR

### 2. **Frontend (`src/lib/contracts.ts`)**
- ✅ Auto-updated with all new contract addresses
- ✅ All hooks and components use CONTRACTS import
- ✅ No manual updates needed

### 3. **Bot Configuration**
- ✅ `bot/.env` updated with new addresses
- ✅ `bot/.env.example` updated with new addresses
- ✅ PegKeeper configuration included

### 4. **Contracts Environment**
- ✅ `contracts/.env` updated with new AddressesRegistry

---

## 🎯 Key Changes from Previous Deployment

1. **Fee Logic Fixed**: Fee is now deducted from what user receives, not added to debt
2. **Constructor Updates**: All pool contracts now use constructors instead of init()
3. **PegKeeper Integrated**: Bot now includes FnUSD peg maintenance functionality
4. **Deployment Script**: Fixed to use correct constructor arguments

---

## 🚀 Next Steps

### For Frontend:
1. Test the UI with new contract addresses
2. Verify Trove operations (open, borrow, repay, close)
3. Check faucet functionality

### For Liquidation Bot:
1. Update `bot/.env` with your private key
2. Run: `cd bot && npm start`
3. Bot will monitor for liquidations automatically

### For PegKeeper (Optional):
1. Set `ENABLE_PEG_KEEPER=true` in `bot/.env`
2. Add Addax pool and router addresses
3. Add aUSDC token address
4. Bot will maintain FnUSD at $1 peg

---

## 📝 Important Notes

- **AddressesRegistry is FROZEN**: Cannot be changed, immutable forever
- **WzkLTC unchanged**: Existing tokens and balances preserved
- **All other contracts are NEW**: Previous FnUSD and Troves are on old contracts
- **Treasury**: All fees go to `0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df`

---

## 🔗 Network Information

- **Network**: LitVM LiteForge
- **Chain ID**: 4441
- **RPC HTTP**: https://liteforge.rpc.caldera.xyz/http
- **RPC WebSocket**: wss://liteforge.rpc.caldera.xyz/ws
- **Explorer**: https://liteforge.explorer.caldera.xyz
- **Gas Token**: zkLTC

---

## ✅ Verification

All contracts deployed successfully and verified on-chain. Frontend automatically synchronized with new addresses.

**Deployment Log**: See `contracts/deployment.log` for full deployment details.
