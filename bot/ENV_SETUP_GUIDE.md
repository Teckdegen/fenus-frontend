# 🤖 FENUS Bot Environment Variables Guide

## 📋 Required Variables

### 🔐 Bot Wallet
```bash
PRIVATE_KEY=0xyour_private_key_here
```
**What it does:** Private key of the wallet that executes liquidations and peg keeper trades  
**Important:** Keep this secret! Never commit to git. This wallet needs zkLTC for gas fees.

---

### 📱 Telegram Notifications
```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```
**What it does:** Sends you real-time notifications for liquidations, trades, and alerts  
**How to get:**
1. **Bot Token:** Message [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot`
   - Follow prompts to create your bot
   - Copy the token it gives you
2. **Chat ID:** Message [@userinfobot](https://t.me/userinfobot) on Telegram
   - It will reply with your chat ID
   - Copy the number

**Notifications you'll receive:**
- 🤖 Bot startup confirmation
- 🔴 Liquidation executed (single or batch)
- 🟢/🔴 PegKeeper trades (buy/sell FnUSD)
- 📈/📉 Peg alerts (price outside threshold)
- ⚠️ Danger zone alerts (Troves near liquidation)

---

### 🏦 Contract Addresses (REQUIRED)
```bash
TROVE_MANAGER_ADDRESS=0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4
SORTED_TROVES_ADDRESS=0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d
PRICE_FEED_ADDRESS=0x39992B70D9C36902aeE699185E94d021BDa94ab6
```
**What it does:** Core FENUS protocol contracts for liquidation monitoring

---

## 🎯 PegKeeper Configuration (Optional)

### Enable/Disable PegKeeper
```bash
ENABLE_PEG_KEEPER=true
```
**What it does:** Turns on automated FnUSD peg maintenance  
**Default:** `false` (disabled)  
**Set to `true`** to enable automated trading

---

### 💰 Token & DEX Addresses (Required if PegKeeper enabled)
```bash
FNUSD_ADDRESS=0x39d3861C1E60823b95f545f41dD3cb45f1f529AD
AUSDC_ADDRESS=0xYourAUSDCAddress
POOL_ADDRESS=0xYourPoolAddress
ROUTER_ADDRESS=0xYourRouterAddress
BORROWER_OPS_ADDRESS=0xf8Df45015eccE114053CA71D493523bd75F17C68
WZKLITECOIN_ADDRESS=0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec
```
**What it does:** Addresses for PegKeeper to trade on Addax DEX

---

### 📊 Price Targets & Thresholds
```bash
TARGET_PRICE=1.0
UPPER_THRESHOLD=1.02
LOWER_THRESHOLD=0.98
```
**What it does:**
- `TARGET_PRICE`: Ideal FnUSD price ($1.00)
- `UPPER_THRESHOLD`: Sell FnUSD when price goes above this ($1.02 = 2% above peg)
- `LOWER_THRESHOLD`: Buy FnUSD when price goes below this ($0.98 = 2% below peg)

**📱 Peg Alert Trigger:** You'll get a Telegram notification when price crosses these thresholds (max once per 5 minutes to avoid spam)

---

### 💵 Trade Limits
```bash
MIN_TRADE_AMOUNT=100
MAX_TRADE_AMOUNT=10000
```
**What it does:**
- `MIN_TRADE_AMOUNT`: Minimum FnUSD to trade per transaction
- `MAX_TRADE_AMOUNT`: Maximum FnUSD to trade per transaction

---

### ⏱️ Check Interval
```bash
PEG_CHECK_INTERVAL=60
```
**What it does:** How often (in seconds) to check FnUSD price  
**Default:** 60 seconds  
**Recommendation:** 30-120 seconds depending on market volatility

---

### 🔄 Auto Borrow/Repay
```bash
ENABLE_AUTO_BORROW=false
ENABLE_AUTO_REPAY=false
```
**What it does:**
- `ENABLE_AUTO_BORROW`: Automatically borrow more FnUSD from your Trove if balance is low
- `ENABLE_AUTO_REPAY`: Automatically repay FnUSD debt if you have excess balance

**⚠️ Warning:** Only enable if you have an active Trove with sufficient collateral!

---

## 🌐 Network Configuration (Optional - defaults to LitVM LiteForge)

```bash
NETWORK_NAME=LitVM LiteForge
CHAIN_ID=4441
GAS_TOKEN=zkLTC
RPC_WS=wss://liteforge.rpc.caldera.xyz/ws
RPC_HTTP=https://liteforge.rpc.caldera.xyz/http
BLOCK_EXPLORER=https://liteforge.explorer.caldera.xyz
```
**What it does:** Network settings (already set to LitVM defaults)  
**When to change:** Only if deploying to a different network

---

## ⚙️ Advanced Tuning (Optional)

```bash
FULL_RESYNC_INTERVAL=300
MULTICALL_BATCH_SIZE=500
LIQ_BATCH_SIZE=50
MULTICALL_CONCURRENCY=6
GAS_LIMIT_BPS=12000
GAS_SINGLE_FALLBACK=800000
GAS_BATCH_FALLBACK=5000000
```
**What it does:**
- `FULL_RESYNC_INTERVAL`: Blocks between full Trove re-syncs (default: 300)
- `MULTICALL_BATCH_SIZE`: Troves per multicall batch (default: 500)
- `LIQ_BATCH_SIZE`: Max Troves per liquidation batch (default: 50)
- `MULTICALL_CONCURRENCY`: Parallel RPC requests (default: 6)
- `GAS_LIMIT_BPS`: Gas limit multiplier in basis points (default: 12000 = 120%)
- `GAS_SINGLE_FALLBACK`: Fallback gas for single liquidation (default: 800000)
- `GAS_BATCH_FALLBACK`: Fallback gas for batch liquidation (default: 5000000)

**Recommendation:** Leave these at defaults unless you know what you're doing

---

## 📝 Complete Example .env File

### Minimal Setup (Liquidation Bot Only)
```bash
# Bot Wallet
PRIVATE_KEY=0xyour_private_key_here

# Telegram Notifications
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Contract Addresses
TROVE_MANAGER_ADDRESS=0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4
SORTED_TROVES_ADDRESS=0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d
PRICE_FEED_ADDRESS=0x39992B70D9C36902aeE699185E94d021BDa94ab6
```

### Full Setup (Liquidation Bot + PegKeeper)
```bash
# Bot Wallet
PRIVATE_KEY=0xyour_private_key_here

# Telegram Notifications
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Contract Addresses
TROVE_MANAGER_ADDRESS=0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4
SORTED_TROVES_ADDRESS=0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d
PRICE_FEED_ADDRESS=0x39992B70D9C36902aeE699185E94d021BDa94ab6

# PegKeeper Configuration
ENABLE_PEG_KEEPER=true
FNUSD_ADDRESS=0x39d3861C1E60823b95f545f41dD3cb45f1f529AD
AUSDC_ADDRESS=0xYourAUSDCAddress
POOL_ADDRESS=0xYourPoolAddress
ROUTER_ADDRESS=0xYourRouterAddress
BORROWER_OPS_ADDRESS=0xf8Df45015eccE114053CA71D493523bd75F17C68
WZKLITECOIN_ADDRESS=0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec

# Price Targets
TARGET_PRICE=1.0
UPPER_THRESHOLD=1.02
LOWER_THRESHOLD=0.98

# Trade Limits
MIN_TRADE_AMOUNT=100
MAX_TRADE_AMOUNT=10000

# Check Interval
PEG_CHECK_INTERVAL=60

# Auto Borrow/Repay (only if you have a Trove)
ENABLE_AUTO_BORROW=false
ENABLE_AUTO_REPAY=false
```

---

## 🚀 Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in at minimum:
   - `PRIVATE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the bot:
   ```bash
   npm start
   ```

5. Check Telegram for startup confirmation! 🎉

---

## 📱 Telegram Notification Examples

### Bot Startup
```
🤖 FENUS BOT STARTED
━━━━━━━━━━━━━━━━━━━━
🌐 Network: LitVM LiteForge
👛 Wallet: 0x1234...5678
📊 Active Troves: 42
🔄 PegKeeper: ENABLED
```

### Liquidation
```
🔴 LIQUIDATION EXECUTED
━━━━━━━━━━━━━━━━━━━━
👤 Troves: 3
📦 Block: 1234567
⛽ Gas Used: 850000
🔗 Tx: https://explorer.../tx/0xabc...
```

### PegKeeper Trade
```
🟢 PEG KEEPER TRADE
━━━━━━━━━━━━━━━━━━━━
📊 Action: BUY FnUSD
💰 Amount: 500.00 FnUSD
📈 Price: 0.9750
🔗 Tx: https://explorer.../tx/0xdef...
```

### Peg Alert
```
📈 PEG ALERT
━━━━━━━━━━━━━━━━━━━━
💵 FnUSD Price: 1.0250
⚠️ Status: ABOVE PEG
🎯 Target: 1.0
```

### Danger Zone
```
⚠️ DANGER ZONE
━━━━━━━━━━━━━━━━━━━━
👤 Trove: 0x1234...5678
📊 ICR: 142.5%
🚨 Below 145% — liquidation imminent
```

---

## ❓ Troubleshooting

### No Telegram notifications?
- Check `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
- Make sure you've started a conversation with your bot (send `/start`)
- Check bot logs for "Telegram send error"

### PegKeeper not trading?
- Verify `ENABLE_PEG_KEEPER=true`
- Check all token/DEX addresses are correct
- Ensure wallet has FnUSD or aUSDC balance
- Check wallet has zkLTC for gas fees

### Bot crashes on startup?
- Verify all required contract addresses are set
- Check RPC endpoints are accessible
- Ensure private key is valid and has gas

---

## 🔒 Security Notes

- **Never commit `.env` to git** - it contains your private key!
- Keep `PRIVATE_KEY` secret - anyone with it can control your wallet
- Use a dedicated wallet for the bot with limited funds
- Monitor bot activity via Telegram notifications
- Regularly check wallet balance for gas fees

---

## 📚 More Info

- Bot code: `bot/bot.js`
- Example config: `bot/.env.example`
- Main repo: Check root `README.md`
