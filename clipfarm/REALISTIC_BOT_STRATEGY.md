# 🎯 Realistic Bot Strategy: $50M TVL from 10K Wallets

## Overview
This bot creates **organic-looking activity** with realistic wallet distribution and behavior.

## Key Features

### 1. **Realistic TVL Distribution**
- **60%** small wallets: $50 - $1,000 TVL
- **30%** medium wallets: $1,000 - $10,000 TVL
- **9%** large wallets: $10,000 - $30,000 TVL
- **1%** whale wallets: $30,000 - $50,000 TVL

### 2. **Unique Balances**
- Maximum 5 wallets can have the same balance
- Each wallet gets random TVL with slight variations
- Looks completely organic

### 3. **Main Activity: FnUSD Transfers**
- Wallets mint FnUSD (borrow against collateral)
- Transfer FnUSD to each other constantly
- Creates high transaction volume
- Looks like real DeFi usage

## Configuration

### `.env` Settings:

```env
# Network
CLIPFARM_RPC_URL=https://rpc.liteforge.network
CLIPFARM_CHAIN_ID=4441

# Admin Wallet (must have wzkLTC and zkLTC)
ADMIN_PRIVATE_KEY=your_private_key_here

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
CLIPFARM_ENCRYPTION_KEY_BASE64=your_32_byte_key_base64

# Contract Addresses (update after deployment)
WZKLTC_ADDRESS=0xb474BcBAAdB14109937d20f826BE51f36318DC16
FNUSD_ADDRESS=<new_fnusd_address>
BORROWER_OPERATIONS_ADDRESS=<new_bo_address>
TROVE_MANAGER_ADDRESS=<new_tm_address>
PRICE_FEED_ADDRESS=<new_pf_address>

# TVL Distribution
MIN_TVL_PER_WALLET=50
MAX_TVL_PER_WALLET=50000
TARGET_TOTAL_TVL=50000000
TOTAL_WALLETS=10000

# Wallet Creation Rate
WALLETS_PER_24H=2000
# 10k wallets in 5 days

# Gas Funding
FUND_NATIVE_GAS=0.002

# Daily Actions (3 actions per wallet per day)
DAILY_ACTION=transfer
# Options: transfer | borrow | addColl | mixed
DAILY_MAX_ACTIONS_PER_WALLET_PER_24H=3
DAILY_FNUSD_MIN=10
DAILY_FNUSD_MAX=500
DAILY_WZKLTC_MIN=0.01
DAILY_WZKLTC_MAX=1.0

# Internal Transfers (every 2 minutes)
ENABLE_INTERNAL_TRANSFERS=true
INTERNAL_TRANSFER_EVERY_MINUTES=2
INTERNAL_TRANSFER_FNUSD_MIN=5
INTERNAL_TRANSFER_FNUSD_MAX=1000
INTERNAL_TRANSFER_WZKLTC_MIN=0.01
INTERNAL_TRANSFER_WZKLTC_MAX=5.0
```

## Cost Analysis

### Admin Wallet Requirements:

At $120 per wzkLTC:

```
wzkLTC needed:
- Average: ~42 wzkLTC per wallet
- Total: 10,000 × 42 × 1.2 (buffer) = 504,000 wzkLTC
- Cost: 504,000 × $120 = $60,480,000

zkLTC for gas:
- 10,000 wallets × 0.002 = 20 zkLTC
- Cost: 20 × $120 = $2,400

Total: ~$60.5M
```

### TVL Achieved:
```
10,000 wallets × $5,000 average = $50,000,000 TVL ✅
```

## Timeline

### Day 1-5: Wallet Creation
```
Day 1: 2,000 wallets created → ~$10M TVL
Day 2: 4,000 wallets total → ~$20M TVL
Day 3: 6,000 wallets total → ~$30M TVL
Day 4: 8,000 wallets total → ~$40M TVL
Day 5: 10,000 wallets total → ~$50M TVL 🎉
```

### Day 6+: Activity Phase
- **60,000+ FnUSD transfers per day** (10k wallets × 3 actions × 2 days)
- Constant borrowing and adding collateral
- High transaction volume
- Looks like real DeFi protocol

## Activity Breakdown

### Per Wallet Per Day:
- **3 actions** (configurable)
- **70% transfers**: Send FnUSD to random wallets
- **20% borrow**: Mint more FnUSD
- **10% addColl**: Add more wzkLTC collateral

### Network-Wide Per Day:
```
10,000 wallets × 3 actions = 30,000 transactions/day

Breakdown:
- 21,000 FnUSD transfers
- 6,000 borrow operations
- 3,000 add collateral operations

Plus internal transfers every 2 minutes:
- 720 transfers/day (24h × 30 per hour)

Total: ~30,720 transactions per day 🔥
```

## What It Looks Like

### On Block Explorer:
- Constant FnUSD transfers between addresses
- Random amounts ($5 - $1,000)
- Different wallet sizes
- Looks like real users trading/using the protocol

### On Dashboard:
- **TVL**: $50M locked
- **Active Wallets**: 10,000
- **Daily Transactions**: 30,000+
- **FnUSD Circulating**: ~$35M (70% of max at 140% CR)

## Running the Bot

```bash
cd clipfarm
npm install
node bot.js
```

### Monitor Progress:
```sql
-- In Supabase
SELECT status, COUNT(*) FROM clipfarm_wallets GROUP BY status;

-- Check TVL distribution
SELECT 
  CASE 
    WHEN note LIKE '%TVL: $%' THEN 
      CAST(SUBSTRING(note FROM 'TVL: \$([0-9.]+)') AS FLOAT)
  END as tvl
FROM clipfarm_wallets 
WHERE status = 'trove_open'
ORDER BY tvl DESC;
```

## Safety Features

### CR Protection:
- All borrows check CR before executing
- Minimum 140% CR maintained (buffer above 135%)
- Transactions won't revert due to insufficient collateral

### Balance Checks:
- Transfers only happen if wallet has enough FnUSD
- Borrows only happen if CR allows it
- No failed transactions

### Realistic Behavior:
- Random delays between actions (jitter)
- Random amounts
- Random recipients
- Looks completely organic

## Expected Results

### Week 1:
- ✅ 10,000 wallets created
- ✅ $50M TVL locked
- ✅ 200,000+ transactions
- ✅ Protocol looks active and used

### Month 1:
- ✅ 900,000+ transactions
- ✅ TVL growing (daily addColl actions)
- ✅ High FnUSD circulation
- ✅ Looks like top DeFi protocol

## Pro Tips

1. **Start slow**: Test with 100 wallets first
2. **Monitor gas**: Make sure admin wallet has enough zkLTC
3. **Check Supabase**: Monitor wallet creation and status
4. **Adjust rates**: Tune WALLETS_PER_24H based on your needs
5. **Watch RPC**: Make sure your RPC can handle the load

## Troubleshooting

### "Insufficient wzkLTC balance"
- Admin wallet needs more wzkLTC
- Check balance: `cast balance <admin> --rpc-url <rpc>`

### "Transaction reverted"
- Check CR calculations
- Verify contract addresses in .env
- Check price feed is working

### "Too many wallets same balance"
- Increase TVL range
- Add more variation in generateRandomTVL()

## Success Metrics

✅ **$50M TVL** from 10,000 wallets  
✅ **30,000+ daily transactions**  
✅ **Realistic distribution** (no patterns)  
✅ **High FnUSD circulation**  
✅ **Looks completely organic**  

---

**Ready to launch! 🚀**
