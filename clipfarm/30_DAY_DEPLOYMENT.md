# 📅 30-Day Deployment Plan: $50M TVL from 10K Wallets

## 💰 Total Cost Breakdown

### Gas Costs:
```
Initial wallet funding:
10,000 wallets × 0.002 zkLTC = 20 zkLTC
20 × $120 = $2,400

Monthly operations (900K transactions):
900,000 tx × 0.0001 zkLTC = 90 zkLTC
90 × $120 = $10,800

Total Gas: $13,200 💸
```

### wzkLTC Costs:
```
Average per wallet: ~42 wzkLTC (for $5,000 TVL at $120/wzkLTC)
Total needed: 10,000 × 42 × 1.2 (buffer) = 504,000 wzkLTC
504,000 × $120 = $60,480,000

Total Cost: $60.5M 💸
```

### **Grand Total: ~$60.5M**

---

## 📊 30-Day Timeline

### Daily Progress:
```
Day 1:   334 wallets → $1.67M TVL
Day 7:   2,338 wallets → $11.69M TVL
Day 14:  4,676 wallets → $23.38M TVL
Day 21:  7,014 wallets → $35.07M TVL
Day 30:  10,020 wallets → $50.1M TVL ✅
```

### Transaction Volume:
```
Week 1:  ~50,000 transactions
Week 2:  ~150,000 transactions
Week 3:  ~300,000 transactions
Week 4:  ~500,000 transactions

Total Month: ~1,000,000 transactions 🔥
```

---

## 🔄 Resume Capability (Supabase)

### How It Works:

The bot tracks **every wallet** in Supabase with status:

```
Status Flow:
new → funded → trove_open → active → (continues daily actions)
```

### If Bot Stops:

1. **Wallet creation progress saved**
   - Supabase has count of all created wallets
   - Bot resumes from exact count

2. **Wallet funding status saved**
   - Each wallet has status: "new", "funded", "trove_open", "active"
   - Bot picks up where it left off

3. **Daily actions tracked**
   - `last_used_at` timestamp per wallet
   - Bot knows which wallets need actions

### Resume Example:

```
Bot stops at Day 15 (5,010 wallets created)

Supabase shows:
- 5,010 total wallets
- 4,800 status: "active"
- 150 status: "trove_open"
- 50 status: "funded"
- 10 status: "new"

Bot restarts:
✅ Sees 5,010 wallets exist
✅ Continues creating to reach 10,020
✅ Bootstraps the 10 "new" wallets
✅ Opens troves for 50 "funded" wallets
✅ Continues daily actions for 4,800 "active" wallets

No data lost! 🎉
```

---

## 🚀 Running the Bot

### Initial Setup:

1. **Create Supabase Table:**
```sql
CREATE TABLE clipfarm_wallets (
  id BIGSERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  enc_pk_base64 TEXT NOT NULL,
  enc_iv_base64 TEXT NOT NULL,
  enc_tag_base64 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_status ON clipfarm_wallets(status);
CREATE INDEX idx_last_used ON clipfarm_wallets(last_used_at);
```

2. **Configure `.env`:**
```env
# Network
CLIPFARM_RPC_URL=https://rpc.liteforge.network
CLIPFARM_CHAIN_ID=4441

# Admin (must have 504,000 wzkLTC + 110 zkLTC)
ADMIN_PRIVATE_KEY=your_key_here

# Supabase
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
CLIPFARM_ENCRYPTION_KEY_BASE64=your_32_byte_key

# Contracts (update after deployment)
WZKLTC_ADDRESS=0xb474BcBAAdB14109937d20f826BE51f36318DC16
FNUSD_ADDRESS=<new_address>
BORROWER_OPERATIONS_ADDRESS=<new_address>
TROVE_MANAGER_ADDRESS=<new_address>
PRICE_FEED_ADDRESS=<new_address>

# Target
MIN_TVL_PER_WALLET=50
MAX_TVL_PER_WALLET=50000
TARGET_TOTAL_TVL=50000000
TOTAL_WALLETS=10000

# Pace (334/day = 10,020 in 30 days)
WALLETS_PER_24H=334

# Gas
FUND_NATIVE_GAS=0.002

# Actions (3 per wallet per day)
DAILY_ACTION=transfer
DAILY_MAX_ACTIONS_PER_WALLET_PER_24H=3
DAILY_FNUSD_MIN=10
DAILY_FNUSD_MAX=500

# Transfers (every 2 minutes)
ENABLE_INTERNAL_TRANSFERS=true
INTERNAL_TRANSFER_EVERY_MINUTES=2
INTERNAL_TRANSFER_FNUSD_MIN=5
INTERNAL_TRANSFER_FNUSD_MAX=1000
```

3. **Start Bot:**
```bash
cd clipfarm
npm install
node bot.js
```

### Keep Running 24/7:

**Option 1: PM2 (Recommended)**
```bash
npm install -g pm2
pm2 start bot.js --name clipfarm
pm2 save
pm2 startup
```

**Option 2: Screen**
```bash
screen -S clipfarm
node bot.js
# Ctrl+A, D to detach
# screen -r clipfarm to reattach
```

**Option 3: Docker**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "bot.js"]
```

---

## 📈 Monitoring Progress

### Check Supabase:

```sql
-- Overall progress
SELECT 
  COUNT(*) as total_wallets,
  COUNT(*) FILTER (WHERE status = 'active') as active,
  COUNT(*) FILTER (WHERE status = 'trove_open') as trove_open,
  COUNT(*) FILTER (WHERE status = 'funded') as funded,
  COUNT(*) FILTER (WHERE status = 'new') as new,
  COUNT(*) FILTER (WHERE status = 'error') as errors
FROM clipfarm_wallets;

-- TVL distribution
SELECT 
  CASE 
    WHEN note LIKE '%TVL: $%' THEN 
      CAST(SUBSTRING(note FROM 'TVL: \$([0-9.]+)') AS FLOAT)
  END as tvl,
  COUNT(*) as count
FROM clipfarm_wallets 
WHERE status IN ('trove_open', 'active')
GROUP BY tvl
ORDER BY tvl DESC
LIMIT 20;

-- Daily activity
SELECT 
  DATE(last_used_at) as day,
  COUNT(*) as active_wallets
FROM clipfarm_wallets
WHERE last_used_at > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;

-- Errors
SELECT address, note, created_at
FROM clipfarm_wallets
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Bot Logs:

```bash
# If using PM2
pm2 logs clipfarm

# If using screen
screen -r clipfarm

# Check last 100 lines
tail -n 100 bot.log
```

### Expected Output:

```
clipfarm starting…
admin: 0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df
rpc: https://rpc.liteforge.network
target: 10000 wallets over 30 days
pace: 334 wallets / 24h

📊 Current progress: 2,450 / 10000 wallets

created wallet: 0x1234... (2451/10000 total, 12/14 this session)
bootstrapped: 0x1234...
daily: 0x5678... -> transfer 234.56 FnUSD to 0xabcd
internal transfer executed
daily: 0x9abc... -> borrow 150.00 FnUSD
...
```

---

## 🛠️ Troubleshooting

### Bot Stopped?

**Just restart it!**
```bash
pm2 restart clipfarm
# or
node bot.js
```

Bot will:
- ✅ Check Supabase for progress
- ✅ Resume from exact wallet count
- ✅ Continue bootstrapping pending wallets
- ✅ Continue daily actions
- ✅ No data lost!

### Common Issues:

**1. "Insufficient wzkLTC balance"**
```bash
# Check admin balance
cast balance <admin_address> --rpc-url <rpc> --erc20 <wzkltc_address>

# Need: 504,000 wzkLTC
```

**2. "Insufficient gas"**
```bash
# Check admin zkLTC balance
cast balance <admin_address> --rpc-url <rpc>

# Need: 110 zkLTC (20 initial + 90 monthly)
```

**3. "Transaction reverted"**
- Check contract addresses in .env
- Verify price feed is working
- Check CR calculations

**4. "Supabase connection failed"**
- Verify SUPABASE_URL and key
- Check network connection
- Verify table exists

**5. "Too many requests"**
- Bot has built-in rate limiting (jitter)
- If still issues, increase sleep times
- Use dedicated RPC endpoint

---

## 📊 Success Metrics

### After 30 Days:

✅ **10,020 wallets created**  
✅ **$50.1M TVL locked**  
✅ **1,000,000+ transactions**  
✅ **30,000+ daily active transactions**  
✅ **Completely organic-looking activity**  

### Transaction Breakdown:
- **700,000** FnUSD transfers (70%)
- **200,000** borrow operations (20%)
- **100,000** add collateral (10%)

### Wallet Distribution:
- **6,000** small wallets ($50-$1K)
- **3,000** medium wallets ($1K-$10K)
- **900** large wallets ($10K-$30K)
- **120** whale wallets ($30K-$50K)

---

## 🎯 After 30 Days

### Maintenance Mode:

Bot automatically switches to **maintenance mode** when 10K wallets reached:
- ✅ No new wallets created
- ✅ Continues daily actions (transfers, borrows, addColl)
- ✅ Maintains high transaction volume
- ✅ TVL continues growing (addColl actions)

### Expected Growth:
```
Month 2: $55M TVL (daily addColl actions)
Month 3: $60M TVL
Month 6: $75M TVL
```

---

## 💡 Pro Tips

1. **Start with test run**: 100 wallets first
2. **Monitor first 24 hours**: Check for errors
3. **Keep admin wallet funded**: Check weekly
4. **Backup Supabase**: Export data regularly
5. **Use PM2**: Auto-restart on crashes
6. **Monitor RPC**: Make sure it can handle load
7. **Check gas prices**: Adjust if network congested

---

## 🚨 Emergency Stop

If you need to stop:
```bash
pm2 stop clipfarm
# or Ctrl+C
```

**All progress saved in Supabase!**

To resume later:
```bash
pm2 start clipfarm
# or
node bot.js
```

Bot picks up exactly where it left off! 🎉

---

## 📞 Support

Check logs for errors:
```bash
pm2 logs clipfarm --lines 100
```

Check Supabase for wallet status:
```sql
SELECT status, COUNT(*) FROM clipfarm_wallets GROUP BY status;
```

**Everything is tracked and resumable!** 🚀
