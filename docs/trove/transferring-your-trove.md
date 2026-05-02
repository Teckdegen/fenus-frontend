# Transferring Your Trove

## What is a Trove NFT?

Your Trove is represented as an **NFT (Non-Fungible Token)** that you own in your wallet. This NFT is more than just a collectible - it represents your entire debt position including:

- All your collateral (wzkLTC)
- All your debt (FnUSD)
- All future obligations and rewards
- Full control of the position

## Why NFTs?

Using NFTs for Troves provides several benefits:

1. **Lower gas costs** - 12-25% cheaper than traditional storage
2. **Visible in your wallet** - See your Trove in MetaMask, OpenSea, etc.
3. **Transferable** - You can transfer your entire position to another address
4. **Composable** - Use your Trove NFT in other DeFi protocols

## How to Transfer Your Trove

### Step 1: Go to the Transfer Tab

1. Navigate to the **Trove** page in the app
2. Click on the **Transfer** tab
3. You'll see your NFT information:
   - Token ID (e.g., #42)
   - Current debt amount
   - Current collateral amount

### Step 2: Enter Recipient Address

1. Enter the Ethereum address of the person you want to transfer to
2. The address must be valid (starts with 0x)
3. The recipient **cannot** already have a Trove (they must close it first)
4. You **cannot** transfer to yourself

### Step 3: Review the Warning

**⚠️ IMPORTANT:** Transferring your Trove NFT means transferring **EVERYTHING**:

- ✅ All collateral goes to the recipient
- ✅ All debt becomes their responsibility
- ✅ All future obligations transfer
- ✅ All future redistribution rewards transfer
- ❌ You lose all control of the position

**This action cannot be undone!**

### Step 4: Confirm Transfer

1. Click **Transfer Trove**
2. Confirm the transaction in your wallet
3. Wait for blockchain confirmation
4. The recipient now owns your entire position

## After Transfer

### For the Sender (You)

- You no longer own the Trove NFT
- You have no debt obligations
- You have no collateral in the system
- You can open a new Trove if you want

### For the Recipient

- They now own the Trove NFT
- They are responsible for all debt
- They control all collateral
- They can manage the position (add/remove collateral, borrow, repay, close)
- They receive all future redistribution rewards

## Use Cases

### 1. Selling Your Position

If you have a healthy Trove with good collateral ratio, you might sell it to someone else:

```
Alice has: 10 wzkLTC collateral, 1,000 FnUSD debt (250% ratio)
Bob wants to buy this position for $X
Alice transfers the NFT to Bob
Bob now manages the position
```

### 2. Gifting

You can gift a Trove to family or friends:

```
Parent wants to give child a DeFi position
Parent transfers Trove NFT
Child learns DeFi with real assets
```

### 3. Portfolio Management

Consolidate positions across multiple wallets:

```
User has Troves in 3 different wallets
Transfers all to main wallet
Easier to manage everything in one place
```

## Safety Features

The transfer system includes several safety checks:

- ✅ **Address validation** - Must be a valid Ethereum address
- ✅ **No self-transfers** - Cannot transfer to yourself
- ✅ **Recipient check** - Recipient cannot already have a Trove
- ✅ **Safe transfer** - Uses ERC721 standard `safeTransferFrom`
- ✅ **Clear warnings** - UI shows exactly what's being transferred

## Common Questions

### Can I cancel a transfer?

No. Once the transaction is confirmed on the blockchain, the transfer is permanent. The recipient owns the position.

### What if the recipient doesn't want it?

Make sure to coordinate with the recipient before transferring. They will be responsible for the debt.

### Can I transfer part of my Trove?

No. The NFT represents the entire position. You must transfer everything or nothing.

### What happens to my debt?

The debt transfers to the recipient. You are no longer responsible for it.

### Can I get my Trove back?

Only if the recipient transfers it back to you. Otherwise, no.

### What if I transfer to the wrong address?

The transfer is permanent. Double-check the address before confirming!

## Viewing Your NFT

Your Trove NFT will appear in:

- **MetaMask** - Under the NFTs tab
- **OpenSea** - In your profile
- **Any NFT marketplace** - That supports ERC721 tokens
- **Block explorers** - Like Etherscan

The NFT shows:
- Token ID
- Contract address
- Current owner
- Metadata (debt, collateral, ratio)

## Technical Details

### Token Standard

Trove NFTs follow the **ERC721** standard, the same standard used by:
- CryptoPunks
- Bored Ape Yacht Club
- Uniswap V3 LP positions

### Token ID

Each Trove gets a unique token ID (e.g., #1, #2, #42, etc.). This ID is permanent and doesn't change even if the position is transferred.

### Metadata

The NFT includes metadata showing:
- Debt amount
- Collateral amount
- Collateral ratio
- Health status

This metadata updates in real-time as you manage your position.

## Best Practices

1. **Double-check addresses** - Always verify the recipient address
2. **Coordinate with recipient** - Make sure they understand they're receiving debt
3. **Check their wallet** - Ensure they don't already have a Trove
4. **Document the transfer** - Keep records for tax purposes
5. **Test with small amounts first** - If possible, practice on testnet

## Need Help?

If you have questions about transferring your Trove:

1. Read this guide carefully
2. Check the warnings in the UI
3. Ask in the community Discord
4. Contact support if needed

**Remember:** Transferring your Trove is a serious action. Make sure you understand what you're doing before proceeding!
