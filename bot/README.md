# 🤖 FENUS PegKeeper & Liquidation Bot

Automated bot for maintaining FnUSD peg and liquidating undercollateralized Troves on the FENUS Protocol (LitVM).

## 🎯 Features

### 💰 PegKeeper (Automated Market Maker)
- **Maintains FnUSD at $1 peg** through automated trading on Addax DEX
- **Buys FnUSD** when price drops below $0.98 (configurable)
- **Sells FnUSD** when price rises above $1.02 (configurable)
- **Auto-borrow** from your Trove when FnUSD balance is low (optional)
- **Auto-repay** debt when you have excess FnUSD (optional)

### 🔴 Liquidation Bot
- **Monitors all Troves** on every block for undercollateralization
- **Liquidates Troves** with ICR < 130% (Minimum Collateral Ratio)
- **Danger zone alerts** for Troves with ICR < 145%
- **Batch liquidations** for gas efficiency
- **Automatic retry** with increased gas limits

### 📱 Telegram Notifications
- 🤖 Bot startup confirmation
- 🔴 Liquidation executed (single or batch)
- 🟢/🔴 PegKeeper trades (buy/sell FnUSD)
- 📈/📉 Peg alerts (price outside threshold)
- ⚠️ Danger zone alerts (Troves near liquidation)
- 💤 Periodic wake-up logs (bot activity)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
- `PRIVATE_KEY` - Your wallet private key (needs zkLTC for gas)
- `TELEGRAM_BOT_TOKEN` - Get from [@BotFather](https://t.me/BotFather)
- `TELEGRAM_CHAT_ID` - Get from [@userinfobot](https://t.me/userinfobot)

### 3. Run the Bot
```bash
npm start
```

You'll receive a Telegram notification when the bot starts! 🎉

---

## ⚙️ Configuration

### Required Variables

```bash
# Bot Wallet
PRIVATE_KEY=0xyour_private_key_here

# Telegram Notifications
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Contract Addresses (already configured for LitVM)
TROVE_MANAGER_ADDRESS=0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4
SORTED_TROVES_ADDRESS=0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d
PRICE_FEED_ADDRESS=0x39992B70D9C36902aeE699185E94d021BDa94ab6
```

### PegKeeper Configuration (Optional)

```bash
# Enable PegKeeper
ENABLE_PEG_KEEPER=true

# Token Addresses
FNUSD_ADDRESS=0x219F2AC287458cD58aB46ABd3cfbe451728323f4
AUSDC_ADDRESS=0xYourAUSDCAddress
POOL_ADDRESS=0xYourPoolAddress
ROUTER_ADDRESS=0xYourRouterAddress

# Price Targets
TARGET_PRICE=1.0
UPPER_THRESHOLD=1.02  # Sell when FnUSD > $1.02
LOWER_THRESHOLD=0.98  # Buy when FnUSD < $0.98

# Trade Limits
MIN_TRADE_AMOUNT=100
MAX_TRADE_AMOUNT=10000

# Check Interval (seconds)
PEG_CHECK_INTERVAL=60

# Bot Sleep/Wake Interval (blocks)
BOT_SLEEP_INTERVAL=60

# Auto Borrow/Repay (requires active Trove)
ENABLE_AUTO_BORROW=false
ENABLE_AUTO_REPAY=false
```

---

## 📊 How It Works

### Liquidation Bot

1. **Startup:** Indexes all active Troves from SortedTroves contract
2. **Every Block:** 
   - Fetches current zkLTC price from oracle
   - Batch-checks ICR (Individual Collateral Ratio) for all Troves
   - Identifies Troves with ICR < 130%
   - Executes liquidations (single or batch)
3. **Danger Zone:** Prioritizes scanning Troves with ICR < 145%
4. **Periodic Resync:** Full Trove index refresh every 300 blocks
5. **Sleep/Wake:** Logs activity every 60 blocks (configurable)

### PegKeeper

1. **Price Check:** Fetches FnUSD price from Addax DEX pool every 60 seconds
2. **Above Peg:** If price > $1.02, sells FnUSD for aUSDC
3. **Below Peg:** If price < $0.98, buys FnUSD with aUSDC
4. **Trade Size:** Calculated based on deviation from peg (min 100, max 10,000 FnUSD)
5. **Auto-Borrow:** If FnUSD balance low, borrows from your Trove (optional)
6. **Auto-Repay:** If excess FnUSD, repays debt to your Trove (optional)

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

### Bot Wake-Up
```
💤 Bot awake — Block 1234567 | Troves: 42 | Danger: 3
```

---

## 🏗️ Architecture

### Core Components

- **LiquidationBot** - Main bot class that monitors Troves and executes liquidations
- **PegKeeper** - Automated market maker that maintains FnUSD peg
- **TroveStore** - In-memory index of active Troves with danger zone tracking
- **TG (Telegram)** - Notification system for all bot events

### Smart Contracts

- **TroveManager** - Liquidation execution and ICR calculations
- **SortedTroves** - Linked list of all active Troves
- **PriceFeed** - Oracle for zkLTC price
- **BorrowerOperations** - Borrow/repay FnUSD (for PegKeeper auto-borrow/repay)
- **Addax DEX Router** - Swap FnUSD <> aUSDC (for PegKeeper trading)

### Gas Optimization

- **Multicall3** - Batch RPC calls for ICR checks (500 Troves per call)
- **Batch Liquidations** - Up to 50 Troves per transaction
- **Concurrent Requests** - 6 parallel multicall batches per block
- **Gas Estimation** - 120% multiplier with fallback limits
- **Retry Logic** - Automatic retry with increased gas on failure

---

## 🔒 Security

### Best Practices

- ✅ Use a **dedicated wallet** for the bot with limited funds
- ✅ Keep `PRIVATE_KEY` secret - never commit to git
- ✅ Monitor bot activity via Telegram notifications
- ✅ Regularly check wallet balance for gas fees
- ✅ Test on testnet before running on mainnet

### Wallet Requirements

- **zkLTC for gas** - Keep at least 0.1 zkLTC for liquidations
- **FnUSD for PegKeeper** - If selling FnUSD (or enable auto-borrow)
- **aUSDC for PegKeeper** - If buying FnUSD
- **Active Trove** - Only if using auto-borrow/repay features

---

## 📈 Monitoring

### Bot Logs

The bot logs all activity to console:
- Block processing
- Price checks
- Liquidation attempts
- PegKeeper trades
- Errors and warnings
- Sleep/wake cycles

### Telegram Alerts

Real-time notifications for:
- All liquidations (with tx hash and gas used)
- All PegKeeper trades (with amount and price)
- Peg alerts (when price crosses thresholds)
- Danger zone alerts (Troves near liquidation)
- Bot startup/shutdown

### Stats Tracking

The bot tracks:
- `liquidations` - Total Troves liquidated
- `txsSent` - Total transactions sent
- `blocksProcessed` - Total blocks scanned
- `errors` - Total errors encountered
- `trades` - Total PegKeeper trades
- `borrows` - Total auto-borrows
- `repays` - Total auto-repays

---

## 🛠️ Troubleshooting

### Bot won't start
- Check `PRIVATE_KEY` is valid
- Verify contract addresses are correct
- Ensure RPC endpoints are accessible
- Check wallet has zkLTC for gas

### No Telegram notifications
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
- Start a conversation with your bot (send `/start`)
- Check bot logs for "Telegram send error"

### PegKeeper not trading
- Verify `ENABLE_PEG_KEEPER=true`
- Check all token/DEX addresses are correct
- Ensure wallet has FnUSD or aUSDC balance
- Verify price is outside threshold range

### Liquidations failing
- Check wallet has sufficient zkLTC for gas
- Verify Trove is actually below 130% ICR
- Check oracle is reporting "Live" status
- Review gas limits in `.env`

### High gas usage
- Reduce `LIQ_BATCH_SIZE` for smaller batches
- Lower `MULTICALL_CONCURRENCY` to reduce RPC load
- Adjust `GAS_LIMIT_BPS` multiplier

---

## 📚 Documentation

- **ENV_SETUP_GUIDE.md** - Complete environment variable reference
- **.env.example** - Example configuration file
- **bot.js** - Main bot source code with inline documentation

---

## 🌐 Network Information

### LitVM LiteForge (Default)

- **Network:** LitVM LiteForge
- **Chain ID:** 4441
- **Gas Token:** zkLTC
- **RPC (HTTP):** https://liteforge.rpc.caldera.xyz/http
- **RPC (WebSocket):** wss://liteforge.rpc.caldera.xyz/ws
- **Block Explorer:** https://liteforge.explorer.caldera.xyz

### Contract Addresses

- **TroveManager:** `0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4`
- **SortedTroves:** `0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d`
- **PriceFeed:** `0x39992B70D9C36902aeE699185E94d021BDa94ab6`
- **FnUSD:** `0x219F2AC287458cD58aB46ABd3cfbe451728323f4`
- **WzkLTC:** `0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec`
- **BorrowerOperations:** `0x70ae94769345031F7fC9C611d8bC822bCFcfB111`

---

## 🤝 Contributing

This bot is part of the FENUS Protocol ecosystem. For issues or improvements:

1. Open an issue on GitHub
2. Submit a pull request
3. Join the community on Telegram

---

## ⚖️ License

MIT License - See LICENSE file for details

---

## 🔗 Links

- **FENUS Protocol:** https://fenus.xyz
- **LitVM:** https://litvm.io
- **Addax DEX:** https://addax.exchange
- **Telegram Bot Setup:** https://core.telegram.org/bots

---

## 💡 Tips

- Start with liquidation bot only, add PegKeeper later
- Monitor first few hours closely via Telegram
- Keep wallet topped up with zkLTC for gas
- Use `BOT_SLEEP_INTERVAL=60` to see activity every minute
- Set `PEG_CHECK_INTERVAL=30` for faster peg response
- Enable auto-borrow only if you have a healthy Trove (ICR > 200%)

---

**Built with ❤️ for the FENUS Protocol**
