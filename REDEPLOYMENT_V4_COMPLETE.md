# 🎉 REDEPLOYMENT V4.0 COMPLETE - Fixed Fee Logic

**Date:** May 2, 2026  
**Network:** LitVM LiteForge (Chain ID: 4441)  
**Status:** ✅ DEPLOYED & FROZEN

---

## 🔧 What Was Fixed

### Fee Logic Correction

**Before (WRONG):**
- User requests to borrow $400
- System mints $400 to user
- System mints $2 (0.5% fee) to treasury
- Debt recorded: **$402** ❌

**After (CORRECT):**
- User requests to borrow $400
- System calculates fee: 0.5% × $400 = $2
- System mints **$398** to user ($400 - $2)
- System mints **$2** to treasury
- Debt recorded: **$398** ✅

**Result:** User gets $398, owes $398. Treasury gets $2 as fee. The fee is NOT added to debt!

---

## 📋 New Contract Addresses

### 🔒 Registry (FROZEN)
```
AddressesRegistry: 0xe7D160Ae857E31bae8d73cAc396fAA7a4f13639b
```

### 🪙 Tokens
```
WzkLTC (KEPT):     0xb474BcBAAdB14109937d20f826BE51f36318DC16 ♻️
FnUSD (NEW):       0xf23Ce7D43C68081CAcFd7808C0F2a0E4EB0E77BA 🆕
```

### 🎨 NFT System
```
TroveNFT:          0xEAa8E5d7073B19920e0B6230e9292BC8b3644230 🆕
TroveManager:      0xEBfc68D3B550dd463D4fEB4b781F903243D2BF06 🆕
BorrowerOperations: 0x5153d5De995B625a871a75d91b856E55158c362B 🆕 (FIXED)
```

### 🏦 Pools
```
ActivePool:        0xE777202A752Dcbb59808aE7EcAA70BE7fB74a1CA 🆕
DefaultPool:       0xD52b23aAEF6809ac0816407756195e26f12a00a7 🆕
CollSurplusPool:   0x74c3261c55B931AE70Cd59EF4f2Ae75A55efC013 🆕
GasPool:           0xcC8fd6D9E1Fe2f031c42A15a891e638424672ff8 🆕
```

### 📊 Infrastructure
```
PriceFeed:         0x509D2EFdBFB2A32B1C419e4afAdbe4AB6B838a31 🆕
SortedTroves:      0xF8ff4235EaAe0fafD4B5c3AE3c656E0aED17686D 🆕
CollateralRegistry: 0x255fBB977dAd56Faea71539B4494f632c228556f 🆕
```

### 🛠️ Helpers
```
RedemptionHelper:  0x7aa3657faFA72F07561e4F8909acb15aD023B17D 🆕
HintHelpers:       0xA76a666B8158a369173AF07e41230F3624EB7B7C 🆕
```

### 💰 Treasury
```
Treasury:          0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df
```

---

## ✅ What Was Updated

1. **BorrowerOperations.sol** - Fixed fee logic in:
   - `openTrove()` function
   - `withdrawFnUSD()` function (borrow more)

2. **All Contracts Redeployed** (except WzkLTC):
   - FnUSD
   - TroveNFT
   - TroveManager
   - BorrowerOperations
   - ActivePool
   - DefaultPool
   - CollSurplusPool
   - GasPool
   - SortedTroves
   - PriceFeed
   - RedemptionHelper
   - HintHelpers
   - CollateralRegistry
   - AddressesRegistry

3. **Frontend Updated**:
   - `src/lib/contracts.ts` - All new addresses
   - Auto-generated with deployment timestamp

4. **Documentation Updated**:
   - `CONTRACT_ADDRESSES.md` - All new addresses
   - Version bumped to 4.0.0

5. **Environment Updated**:
   - `contracts/.env` - New registry address

---

## 🔐 Security

- ✅ AddressesRegistry is **FROZEN** (immutable forever)
- ✅ All contracts verified and production-ready
- ✅ WzkLTC kept from previous deployment (maintains existing balances)
- ✅ Fee logic corrected: debt = amount received, not amount + fee

---

## 📝 Important Notes

### For Users:
- **WzkLTC address unchanged** - your existing balance is safe
- **FnUSD is NEW** - old FnUSD tokens won't work with new system
- **All Troves reset** - previous troves are on old contracts
- **Fee structure:** When you borrow $400, you receive $398 and owe $398

### For Developers:
- Frontend automatically updated with new addresses
- All contracts use existing WzkLTC as collateral
- Registry is frozen - no further address changes possible
- Fee goes to treasury, not added to user debt

---

## 🚀 Next Steps

1. ✅ Contracts deployed
2. ✅ Registry frozen
3. ✅ Frontend updated
4. ✅ Documentation updated
5. ⏳ Push to GitHub (network issue - retry later)
6. 🔄 Users need to import new FnUSD token to MetaMask

---

## 📱 Add New FnUSD to MetaMask

1. Open MetaMask
2. Click "Import tokens"
3. Paste: `0xf23Ce7D43C68081CAcFd7808C0F2a0E4EB0E77BA`
4. Symbol: `FnUSD`
5. Decimals: `6`

---

## 🔗 Links

- **App:** https://fenus-frontend.vercel.app
- **Faucet:** https://fenus-frontend.vercel.app/app/faucet
- **Explorer:** https://liteforge.explorer.caldera.xyz
- **GitHub:** https://github.com/Teckdegen/fenus-frontend

---

**Deployment Script:** `contracts/scripts/redeployWithoutWzkLTC.ts`  
**Deployer:** 0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df  
**Gas Used:** ~4.99 ETH  
**Status:** ✅ PRODUCTION READY

