/**
 * FENUS Liquidation Bot — bot.js
 * ═══════════════════════════════
 * Single-file liquidation watcher. Dependencies: ethers + dotenv.
 *
 * Default chain — LitVM LiteForge (override via .env):
 * ┌─────────────────┬──────────────────────────────────────────────────────────┐
 * │ Network name    │ LitVM LiteForge                                           │
 * │ Chain ID        │ 4441                                                      │
 * │ Gas token       │ zkLTC                                                     │
 * │ RPC (HTTP)      │ https://liteforge.rpc.caldera.xyz/http                   │
 * │ RPC (WebSocket) │ wss://liteforge.rpc.caldera.xyz/ws                       │
 * │ Block explorer  │ https://liteforge.explorer.caldera.xyz                   │
 * └─────────────────┴──────────────────────────────────────────────────────────┘
 *
 * How it works:
 * 1. On startup, walks SortedTroves (tail → head) and indexes active Trove owners.
 * 2. Every new block: reads last good price + Multicall-batched getCurrentICR for all Troves.
 * 3. Troves with ICR < MCR (130%) are liquidated via batchLiquidate (chunked by gas).
 * 4. Danger zone (ICR < 145%) is ordered first in the scan queue.
 * 5. TroveUpdated / TroveLiquidated / TroveClosed keep the index consistent.
 * 6. Periodic full re-sync catches missed events / RPC gaps.
 *
 * Important: ICR can change without oracle price moves (borrowing, redistributions).
 * This bot scans every block — never skip scans based on price equality alone.
 *
 * Setup:
 *   cd bot && cp .env.example .env && npm install
 *   npm start                    ← from bot/
 *   # or from repo root:
 *   node bot.js                  ← uses root bot.js shim → bot/.env + bot/node_modules
 *   npm run liquidation-bot      ← same (see root package.json)
 */

import { ethers } from "ethers";
import "dotenv/config";

// ─── Config ───────────────────────────────────────────────────────────────────

function required(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

/** LitVM LiteForge defaults — set RPC_WS / RPC_HTTP / CHAIN_ID / etc. in .env to override */
const LITFORGE = {
  NETWORK_NAME: "LitVM LiteForge",
  CHAIN_ID: 4441,
  GAS_TOKEN: "zkLTC",
  RPC_WS: "wss://liteforge.rpc.caldera.xyz/ws",
  RPC_HTTP: "https://liteforge.rpc.caldera.xyz/http",
  BLOCK_EXPLORER: "https://liteforge.explorer.caldera.xyz",
};

function explorerTxUrl(base, hash) {
  const b = (base || "").replace(/\/$/, "");
  if (!b || !hash) return "";
  return `${b}/tx/${hash}`;
}

const CONFIG = {
  NETWORK_NAME: process.env.NETWORK_NAME || LITFORGE.NETWORK_NAME,
  CHAIN_ID: parseInt(process.env.CHAIN_ID || String(LITFORGE.CHAIN_ID), 10),
  GAS_TOKEN: process.env.GAS_TOKEN || LITFORGE.GAS_TOKEN,
  RPC_WS: process.env.RPC_WS || LITFORGE.RPC_WS,
  RPC_HTTP: process.env.RPC_HTTP || LITFORGE.RPC_HTTP,
  BLOCK_EXPLORER: (
    process.env.BLOCK_EXPLORER_URL ||
    process.env.BLOCK_EXPLORER ||
    LITFORGE.BLOCK_EXPLORER
  ).replace(/\/$/, ""),
  PRIVATE_KEY: required("PRIVATE_KEY"),
  TROVE_MANAGER_ADDRESS: required("TROVE_MANAGER_ADDRESS"),
  SORTED_TROVES_ADDRESS: required("SORTED_TROVES_ADDRESS"),
  PRICE_FEED_ADDRESS: required("PRICE_FEED_ADDRESS"),
  MULTICALL_BATCH_SIZE: parseInt(process.env.MULTICALL_BATCH_SIZE || "500", 10),
  LIQ_BATCH_SIZE: parseInt(
    process.env.LIQ_BATCH_SIZE || process.env.LIQUIDATION_BATCH_SIZE || "50",
    10
  ),
  FULL_RESYNC_INTERVAL: parseInt(process.env.FULL_RESYNC_INTERVAL || "300", 10),
  /** Max parallel multicall RPC requests per block (avoid hammering the node). */
  MULTICALL_CONCURRENCY: parseInt(process.env.MULTICALL_CONCURRENCY || "6", 10),
  /** Gas limit multiplier when estimation succeeds (basis points; 12000 = 120%). */
  GAS_LIMIT_BPS: parseInt(process.env.GAS_LIMIT_BPS || "12000", 10),
  /** Fallback gas per liquidate() if estimateGas fails. */
  GAS_SINGLE_FALLBACK: BigInt(process.env.GAS_SINGLE_FALLBACK || "800000"),
  /** Fallback gas per batchLiquidate() if estimateGas fails. */
  GAS_BATCH_FALLBACK: BigInt(process.env.GAS_BATCH_FALLBACK || "5000000"),
  
  // ─── Peg Keeper Config ──────────────────────────────────────────────────────
  ENABLE_PEG_KEEPER: process.env.ENABLE_PEG_KEEPER === "true",
  FNUSD_ADDRESS: process.env.FNUSD_ADDRESS,
  AUSDC_ADDRESS: process.env.AUSDC_ADDRESS,
  POOL_ADDRESS: process.env.POOL_ADDRESS,
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS,
  BORROWER_OPS_ADDRESS: process.env.BORROWER_OPS_ADDRESS,
  WZKLITECOIN_ADDRESS: process.env.WZKLITECOIN_ADDRESS,
  TARGET_PRICE: parseFloat(process.env.TARGET_PRICE || "1.0"),
  UPPER_THRESHOLD: parseFloat(process.env.UPPER_THRESHOLD || "1.02"),
  LOWER_THRESHOLD: parseFloat(process.env.LOWER_THRESHOLD || "0.98"),
  MIN_TRADE_AMOUNT: parseFloat(process.env.MIN_TRADE_AMOUNT || "100"),
  MAX_TRADE_AMOUNT: parseFloat(process.env.MAX_TRADE_AMOUNT || "10000"),
  PEG_CHECK_INTERVAL: parseInt(process.env.PEG_CHECK_INTERVAL || "60", 10),
  ENABLE_AUTO_BORROW: process.env.ENABLE_AUTO_BORROW === "true",
  ENABLE_AUTO_REPAY: process.env.ENABLE_AUTO_REPAY === "true",
};

// ─── Logger ───────────────────────────────────────────────────────────────────

const ts = () => new Date().toISOString();
const log = {
  info: (...a) => console.log(`[${ts()}] INFO `, ...a),
  warn: (...a) => console.warn(`[${ts()}] WARN `, ...a),
  error: (...a) => console.error(`[${ts()}] ERROR`, ...a),
};

// ─── TroveStore ───────────────────────────────────────────────────────────────

class TroveStore {
  constructor() {
    this._map = new Map();
    this._danger = new Set();
  }

  set(addr, data) {
    this._map.set(addr.toLowerCase(), data);
  }
  get(addr) {
    return this._map.get(addr.toLowerCase());
  }
  remove(addr) {
    const k = addr.toLowerCase();
    this._map.delete(k);
    this._danger.delete(k);
  }
  has(addr) {
    return this._map.has(addr.toLowerCase());
  }
  clear() {
    this._map.clear();
    this._danger.clear();
  }
  size() {
    return this._map.size;
  }

  getAllOwners() {
    return Array.from(this._map.keys());
  }

  addDanger(addr) {
    this._danger.add(addr.toLowerCase());
  }
  removeDanger(addr) {
    this._danger.delete(addr.toLowerCase());
  }
  getDangerZone() {
    return new Set(this._danger);
  }
  dangerSize() {
    return this._danger.size;
  }
}

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const TROVE_MANAGER_ABI = [
  "function getCurrentICR(address, uint256) view returns (uint256)",
  "function getNominalICR(address) view returns (uint256)",
  "function liquidate(address owner) external",
  "function batchLiquidate(address[] calldata owners) external",
  "event TroveUpdated(address indexed owner, uint256 debt, uint256 coll, uint256 stake, uint8 operation)",
  "event TroveLiquidated(address indexed owner, uint256 debt, uint256 coll, uint8 liquidationMode)",
  "event TroveClosed(address indexed owner, uint8 status)",
];

const SORTED_TROVES_ABI = [
  "function getLast() view returns (address)",
  "function getPrev(address) view returns (address)",
];

const PRICE_FEED_ABI = [
  "function getLastGoodPrice() view returns (uint256)",
  "function status() view returns (uint8)",
];

const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)",
];
const MULTICALL3_ADDR = "0xcA11bde05977b3631167028862bE2a173976CA11";

// ─── Peg Keeper ABIs ──────────────────────────────────────────────────────────

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

const POOL_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
];

const BORROWER_OPS_ABI = [
  "function withdrawFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external",
  "function repayFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external",
];

/** TroveManager Constants.MCR — 130% — keep in sync with contracts/src/Constants.sol */
const MCR = ethers.parseEther("1.3");
const DANGER_ZONE = ethers.parseEther("1.45");

/** TroveUpdated.operation values from TroveManager.sol */
const OP_OPEN = 0;
const OP_ADJUST = 1;
const OP_CLOSE = 2;
const OP_LIQ = 4;

// ─── PegKeeper ────────────────────────────────────────────────────────────────

class PegKeeper {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.lastCheck = 0;
    this.stats = { trades: 0, borrows: 0, repays: 0, errors: 0 };
    
    if (!CONFIG.ENABLE_PEG_KEEPER) return;
    
    this.fnusd = new ethers.Contract(CONFIG.FNUSD_ADDRESS, ERC20_ABI, signer);
    this.ausdc = new ethers.Contract(CONFIG.AUSDC_ADDRESS, ERC20_ABI, signer);
    this.pool = new ethers.Contract(CONFIG.POOL_ADDRESS, POOL_ABI, provider);
    this.router = new ethers.Contract(CONFIG.ROUTER_ADDRESS, ROUTER_ABI, signer);
    this.borrowerOps = new ethers.Contract(CONFIG.BORROWER_OPS_ADDRESS, BORROWER_OPS_ABI, signer);
  }

  async checkAndMaintainPeg() {
    if (!CONFIG.ENABLE_PEG_KEEPER) return;
    
    const now = Date.now();
    if (now - this.lastCheck < CONFIG.PEG_CHECK_INTERVAL * 1000) return;
    this.lastCheck = now;

    try {
      const price = await this.getFnUSDPrice();
      if (price === null) {
        log.warn("PegKeeper: Could not fetch FnUSD price");
        return;
      }

      log.info(`PegKeeper: FnUSD = $${price.toFixed(4)}`);

      if (price > CONFIG.UPPER_THRESHOLD) {
        log.info(`PegKeeper: Price too high ($${price.toFixed(4)} > $${CONFIG.UPPER_THRESHOLD}) - selling FnUSD`);
        await this.sellFnUSD(price);
      } else if (price < CONFIG.LOWER_THRESHOLD) {
        log.info(`PegKeeper: Price too low ($${price.toFixed(4)} < $${CONFIG.LOWER_THRESHOLD}) - buying FnUSD`);
        await this.buyFnUSD(price);
      }
    } catch (e) {
      log.error("PegKeeper error:", e.message);
      this.stats.errors++;
    }
  }

  async getFnUSDPrice() {
    try {
      const [reserve0, reserve1] = await this.pool.getReserves();
      const token0 = await this.pool.token0();
      
      let fnusdReserve, ausdcReserve;
      if (token0.toLowerCase() === CONFIG.FNUSD_ADDRESS.toLowerCase()) {
        fnusdReserve = Number(ethers.formatUnits(reserve0, 6));
        ausdcReserve = Number(ethers.formatUnits(reserve1, 6));
      } else {
        fnusdReserve = Number(ethers.formatUnits(reserve1, 6));
        ausdcReserve = Number(ethers.formatUnits(reserve0, 6));
      }

      if (fnusdReserve === 0) return null;
      return ausdcReserve / fnusdReserve;
    } catch (e) {
      log.warn("PegKeeper: Error fetching price:", e.message);
      return null;
    }
  }

  async sellFnUSD(currentPrice) {
    try {
      // Check FnUSD balance
      const balance = await this.fnusd.balanceOf(this.signer.address);
      const balanceNum = Number(ethers.formatUnits(balance, 6));
      
      if (balanceNum < CONFIG.MIN_TRADE_AMOUNT) {
        if (CONFIG.ENABLE_AUTO_BORROW) {
          log.info(`PegKeeper: Low FnUSD balance (${balanceNum.toFixed(2)}) - borrowing more`);
          await this.borrowFnUSD(CONFIG.MAX_TRADE_AMOUNT);
          return;
        } else {
          log.warn(`PegKeeper: Insufficient FnUSD balance (${balanceNum.toFixed(2)}) - skipping`);
          return;
        }
      }

      // Calculate trade amount
      const deviation = currentPrice - CONFIG.TARGET_PRICE;
      const tradeAmount = Math.min(
        Math.max(deviation * 10000, CONFIG.MIN_TRADE_AMOUNT),
        CONFIG.MAX_TRADE_AMOUNT,
        balanceNum
      );

      const amountIn = ethers.parseUnits(tradeAmount.toFixed(2), 6);
      const amountOutMin = ethers.parseUnits((tradeAmount * 0.995).toFixed(2), 6); // 0.5% slippage
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

      // Approve if needed
      await this.ensureApproval(this.fnusd, CONFIG.ROUTER_ADDRESS, amountIn);

      // Swap
      log.info(`PegKeeper: Selling ${tradeAmount.toFixed(2)} FnUSD for aUSDC`);
      const tx = await this.router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [CONFIG.FNUSD_ADDRESS, CONFIG.AUSDC_ADDRESS],
        this.signer.address,
        deadline,
        await this._feeOverrides()
      );
      
      const receipt = await tx.wait();
      log.info(`PegKeeper: Sold FnUSD - tx ${tx.hash}`);
      this.stats.trades++;
    } catch (e) {
      log.error("PegKeeper: Sell failed:", e.message);
      this.stats.errors++;
    }
  }

  async buyFnUSD(currentPrice) {
    try {
      // Check aUSDC balance
      const balance = await this.ausdc.balanceOf(this.signer.address);
      const balanceNum = Number(ethers.formatUnits(balance, 6));
      
      if (balanceNum < CONFIG.MIN_TRADE_AMOUNT) {
        log.warn(`PegKeeper: Insufficient aUSDC balance (${balanceNum.toFixed(2)}) - skipping`);
        return;
      }

      // Calculate trade amount
      const deviation = CONFIG.TARGET_PRICE - currentPrice;
      const tradeAmount = Math.min(
        Math.max(deviation * 10000, CONFIG.MIN_TRADE_AMOUNT),
        CONFIG.MAX_TRADE_AMOUNT,
        balanceNum
      );

      const amountIn = ethers.parseUnits(tradeAmount.toFixed(2), 6);
      const amountOutMin = ethers.parseUnits((tradeAmount * 0.995).toFixed(2), 6); // 0.5% slippage
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

      // Approve if needed
      await this.ensureApproval(this.ausdc, CONFIG.ROUTER_ADDRESS, amountIn);

      // Swap
      log.info(`PegKeeper: Buying ${tradeAmount.toFixed(2)} FnUSD with aUSDC`);
      const tx = await this.router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [CONFIG.AUSDC_ADDRESS, CONFIG.FNUSD_ADDRESS],
        this.signer.address,
        deadline,
        await this._feeOverrides()
      );
      
      const receipt = await tx.wait();
      log.info(`PegKeeper: Bought FnUSD - tx ${tx.hash}`);
      this.stats.trades++;

      // Optionally repay debt if we have excess FnUSD
      if (CONFIG.ENABLE_AUTO_REPAY) {
        await this.maybeRepayDebt();
      }
    } catch (e) {
      log.error("PegKeeper: Buy failed:", e.message);
      this.stats.errors++;
    }
  }

  async borrowFnUSD(amount) {
    try {
      const amountToMint = ethers.parseUnits(amount.toFixed(2), 6);
      log.info(`PegKeeper: Borrowing ${amount.toFixed(2)} FnUSD`);
      
      const tx = await this.borrowerOps.withdrawFnUSD(
        amountToMint,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        await this._feeOverrides()
      );
      
      await tx.wait();
      log.info(`PegKeeper: Borrowed FnUSD - tx ${tx.hash}`);
      this.stats.borrows++;
    } catch (e) {
      log.error("PegKeeper: Borrow failed:", e.message);
      this.stats.errors++;
    }
  }

  async maybeRepayDebt() {
    try {
      const balance = await this.fnusd.balanceOf(this.signer.address);
      const balanceNum = Number(ethers.formatUnits(balance, 6));
      
      // If we have more than 2x MAX_TRADE_AMOUNT, repay some
      if (balanceNum > CONFIG.MAX_TRADE_AMOUNT * 2) {
        const repayAmount = balanceNum - CONFIG.MAX_TRADE_AMOUNT;
        const amountToRepay = ethers.parseUnits(repayAmount.toFixed(2), 6);
        
        log.info(`PegKeeper: Repaying ${repayAmount.toFixed(2)} FnUSD debt`);
        
        // Approve if needed
        await this.ensureApproval(this.fnusd, CONFIG.BORROWER_OPS_ADDRESS, amountToRepay);
        
        const tx = await this.borrowerOps.repayFnUSD(
          amountToRepay,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          await this._feeOverrides()
        );
        
        await tx.wait();
        log.info(`PegKeeper: Repaid debt - tx ${tx.hash}`);
        this.stats.repays++;
      }
    } catch (e) {
      log.error("PegKeeper: Repay failed:", e.message);
      this.stats.errors++;
    }
  }

  async ensureApproval(token, spender, amount) {
    const allowance = await token.allowance(this.signer.address, spender);
    if (allowance >= amount) return;
    
    log.info(`PegKeeper: Approving ${spender}`);
    const tx = await token.approve(spender, ethers.MaxUint256);
    await tx.wait();
  }

  async _feeOverrides() {
    const fee = await this.provider.getFeeData();
    const over = {};
    if (fee.maxFeePerGas != null && fee.maxPriorityFeePerGas != null) {
      over.maxFeePerGas = (fee.maxFeePerGas * 110n) / 100n;
      over.maxPriorityFeePerGas = (fee.maxPriorityFeePerGas * 110n) / 100n;
    } else if (fee.gasPrice != null) {
      over.gasPrice = (fee.gasPrice * 110n) / 100n;
    }
    return over;
  }
}

// ─── Bot ──────────────────────────────────────────────────────────────────────

class LiquidationBot {
  constructor() {
    this._initProviderAndContracts();
    this.store = new TroveStore();
    this.lastPrice = 0n;
    this.isScanning = false;
    this.isLiqing = false;
    this.blockCount = 0;
    this.stats = { liquidations: 0, txsSent: 0, blocksProcessed: 0, errors: 0 };
    this._listenersAttached = false;
    this._shuttingDown = false;
    this._wsReconnecting = false;
    
    // Initialize PegKeeper
    this.pegKeeper = new PegKeeper(this.provider, this.signer);
  }

  _initProviderAndContracts() {
    if (this.provider) {
      try {
        this.provider.destroy();
      } catch {
        /* ignore */
      }
    }
    this.provider = new ethers.WebSocketProvider(CONFIG.RPC_WS);
    this.signer = new ethers.Wallet(CONFIG.PRIVATE_KEY, this.provider);

    this.troveManager = new ethers.Contract(
      CONFIG.TROVE_MANAGER_ADDRESS,
      TROVE_MANAGER_ABI,
      this.signer
    );
    this.sortedTroves = new ethers.Contract(
      CONFIG.SORTED_TROVES_ADDRESS,
      SORTED_TROVES_ABI,
      this.provider
    );
    this.priceFeed = new ethers.Contract(CONFIG.PRICE_FEED_ADDRESS, PRICE_FEED_ABI, this.provider);
    this.multicall = new ethers.Contract(MULTICALL3_ADDR, MULTICALL3_ABI, this.provider);

    const ws = this.provider.websocket;
    if (ws && typeof ws.on === "function") {
      ws.on("close", () => this._onWsClose());
      ws.on("error", (err) => log.warn("WebSocket error:", err?.message || err));
    }
  }

  async _onWsClose() {
    if (this._shuttingDown || this._wsReconnecting) return;
    this._wsReconnecting = true;
    log.warn("WebSocket closed — reconnecting in 3s…");
    try {
      await new Promise((r) => setTimeout(r, 3000));
      this._initProviderAndContracts();
      this._listenersAttached = false;
      await this.fullSync();
      this.subscribeEvents();
      this.provider.on("block", (n) => this.onBlock(n));
      this._listenersAttached = true;
      log.info("Reconnected and re-subscribed.");
    } catch (e) {
      log.error("Reconnect failed:", e.message);
      setTimeout(() => {
        this._wsReconnecting = false;
        this._onWsClose();
      }, 5000);
      return;
    }
    this._wsReconnecting = false;
  }

  async start() {
    log.info("FENUS Liquidation Bot starting");
    log.info(
      " Network :",
      CONFIG.NETWORK_NAME,
      "| chainId",
      CONFIG.CHAIN_ID,
      "| gas",
      CONFIG.GAS_TOKEN
    );
    log.info(" RPC WS  :", CONFIG.RPC_WS);
    log.info(" RPC HTTP:", CONFIG.RPC_HTTP);
    log.info(" Explorer:", CONFIG.BLOCK_EXPLORER);

    const net = await this.provider.getNetwork();
    if (Number(net.chainId) !== CONFIG.CHAIN_ID) {
      log.warn(
        ` Connected chainId ${net.chainId} ≠ configured ${CONFIG.CHAIN_ID} — check RPC endpoints`
      );
    }

    log.info(" Wallet :", this.signer.address);
    log.info(" TroveMgr:", CONFIG.TROVE_MANAGER_ADDRESS);

    const bal = await this.provider.getBalance(this.signer.address);
    log.info(" Balance :", ethers.formatEther(bal), `(${CONFIG.GAS_TOKEN})`);
    if (bal < ethers.parseEther("0.01")) log.warn("Low gas balance — top up soon");

    log.info("Building Trove index…");
    await this.fullSync();
    log.info("Indexed", this.store.size(), "active Troves");

    if (CONFIG.ENABLE_PEG_KEEPER) {
      log.info("PegKeeper: ENABLED");
      log.info(" Target  :", `$${CONFIG.TARGET_PRICE}`);
      log.info(" Range   :", `$${CONFIG.LOWER_THRESHOLD} - $${CONFIG.UPPER_THRESHOLD}`);
      log.info(" Trade   :", `$${CONFIG.MIN_TRADE_AMOUNT} - $${CONFIG.MAX_TRADE_AMOUNT}`);
      log.info(" Pool    :", CONFIG.POOL_ADDRESS);
      log.info(" Router  :", CONFIG.ROUTER_ADDRESS);
    } else {
      log.info("PegKeeper: DISABLED");
    }

    this.subscribeEvents();
    this.provider.on("block", (n) => this.onBlock(n));
    this._listenersAttached = true;
    log.info("Watching every block for liquidations\n");
  }

  async fullSync() {
    const owners = await this.walkSortedTroves();
    log.info(" Found", owners.length, "Troves — fetching NICR via multicall…");
    const nicrs = await this.batchGetNICR(owners);
    this.store.clear();
    for (let i = 0; i < owners.length; i++) {
      this.store.set(owners[i], { nicr: nicrs[i] });
    }
  }

  async walkSortedTroves() {
    const owners = [];
    let cur = await this.sortedTroves.getLast();
    while (cur && cur !== ethers.ZeroAddress) {
      owners.push(cur);
      cur = await this.sortedTroves.getPrev(cur);
    }
    return owners;
  }

  async onBlock(blockNumber) {
    if (!this._listenersAttached) return;
    this.blockCount++;
    this.stats.blocksProcessed++;

    if (this.blockCount % CONFIG.FULL_RESYNC_INTERVAL === 0) {
      log.info(`Block ${blockNumber} — periodic full re-sync`);
      await this.fullSync().catch((e) => log.warn("Re-sync failed:", e.message));
    }

    let price;
    try {
      price = await this.priceFeed.getLastGoodPrice();
    } catch {
      log.warn(`Block ${blockNumber}: price fetch failed — skipping`);
      return;
    }

    const status = await this.priceFeed.status().catch(() => 0);
    // IPriceFeed.Status: Live = 0 — only liquidate when oracle reports Live (matches fetchPrice behavior expectations).
    if (status !== 0) {
      log.warn(`Block ${blockNumber}: price feed status=${status} (not Live) — skipping liquidations`);
      this.lastPrice = price;
      return;
    }

    this.lastPrice = price;

    // Check and maintain FnUSD peg
    if (CONFIG.ENABLE_PEG_KEEPER) {
      await this.pegKeeper.checkAndMaintainPeg().catch((e) => 
        log.warn("PegKeeper check failed:", e.message)
      );
    }

    if (this.isScanning) return;
    this.isScanning = true;
    try {
      await this.scan(price, blockNumber);
    } catch (e) {
      log.error("Scan error:", e.message);
      this.stats.errors++;
    } finally {
      this.isScanning = false;
    }
  }

  async scan(price, blockNumber) {
    const dangerSet = this.store.getDangerZone();
    const allOwners = this.store.getAllOwners();
    const dangerOwners = allOwners.filter((a) => dangerSet.has(a));
    const normalOwners = allOwners.filter((a) => !dangerSet.has(a));
    const toCheck = [...dangerOwners, ...normalOwners];
    if (toCheck.length === 0) return;

    const eligible = [];

    for (let i = 0; i < toCheck.length; i += CONFIG.MULTICALL_BATCH_SIZE * CONFIG.MULTICALL_CONCURRENCY) {
      const wave = [];
      for (let w = 0; w < CONFIG.MULTICALL_CONCURRENCY; w++) {
        const start = i + w * CONFIG.MULTICALL_BATCH_SIZE;
        if (start >= toCheck.length) break;
        wave.push(toCheck.slice(start, start + CONFIG.MULTICALL_BATCH_SIZE));
      }
      const icrChunks = await Promise.all(wave.map((batch) => this.batchGetICR(batch, price)));
      let idx = 0;
      for (const icrs of icrChunks) {
        const batch = wave[idx++];
        for (let j = 0; j < batch.length; j++) {
          const icr = icrs[j];
          const owner = batch[j];
          if (icr === null) continue;

          if (icr < DANGER_ZONE) this.store.addDanger(owner);
          else this.store.removeDanger(owner);

          if (icr > 0n && icr < MCR) eligible.push({ owner, icr });
        }
      }
    }

    if (eligible.length === 0) return;

    eligible.sort((a, b) => (a.icr < b.icr ? -1 : a.icr > b.icr ? 1 : 0));

    log.info(
      `Block ${blockNumber} | wzkLTC ~ $${ethers.formatEther(price)} | ` +
        `${eligible.length} Trove(s) below MCR`
    );

    await this.liquidate(eligible);
  }

  async liquidate(eligible) {
    if (this.isLiqing) return;
    this.isLiqing = true;
    try {
      const owners = eligible.map((e) => e.owner);
      if (owners.length === 1) {
        await this.liquidateSingle(owners[0]);
      } else {
        await this.liquidateBatch(owners);
      }
    } finally {
      this.isLiqing = false;
    }
  }

  async liquidateSingle(owner) {
    try {
      log.info(" liquidate(", owner, ")");
      const gasLimit = await this._estimateGas(
        () => this.troveManager.liquidate.estimateGas(owner),
        CONFIG.GAS_SINGLE_FALLBACK
      );
      const tx = await this.troveManager.liquidate(owner, {
        gasLimit,
        ...(await this._feeOverrides()),
      });
      log.info(" tx", tx.hash);
      const ex = explorerTxUrl(CONFIG.BLOCK_EXPLORER, tx.hash);
      if (ex) log.info(" explorer", ex);
      const receipt = await tx.wait();
      log.info(" OK block", receipt.blockNumber, "| gas", receipt.gasUsed.toString());
      this.stats.liquidations++;
      this.stats.txsSent++;
      this.store.remove(owner);
    } catch (e) {
      log.error(` liquidate(${owner}):`, e.shortMessage || e.message);
      this.stats.errors++;
    }
  }

  async liquidateBatch(owners) {
    for (let i = 0; i < owners.length; i += CONFIG.LIQ_BATCH_SIZE) {
      const chunk = owners.slice(i, i + CONFIG.LIQ_BATCH_SIZE);
      try {
        log.info(" batchLiquidate(", chunk.length, "troves)");
        const gasLimit = await this._estimateGas(
          () => this.troveManager.batchLiquidate.estimateGas(chunk),
          CONFIG.GAS_BATCH_FALLBACK
        );
        const tx = await this.troveManager.batchLiquidate(chunk, {
          gasLimit,
          ...(await this._feeOverrides()),
        });
        log.info(" tx", tx.hash);
        const exb = explorerTxUrl(CONFIG.BLOCK_EXPLORER, tx.hash);
        if (exb) log.info(" explorer", exb);
        const receipt = await tx.wait();
        log.info(" OK block", receipt.blockNumber, "|", chunk.length, "liquidated | gas", receipt.gasUsed.toString());
        this.stats.liquidations += chunk.length;
        this.stats.txsSent++;
        chunk.forEach((o) => this.store.remove(o));
      } catch (e) {
        log.error(" batchLiquidate failed:", e.shortMessage || e.message, "— trying singles");
        for (const owner of chunk) await this.liquidateSingle(owner);
      }
    }
  }

  async _estimateGas(estimateFn, fallback) {
    try {
      const est = await estimateFn();
      return (est * BigInt(CONFIG.GAS_LIMIT_BPS)) / 10000n;
    } catch {
      log.warn(" estimateGas failed — using fallback gas limit");
      return fallback;
    }
  }

  async _feeOverrides() {
    const fee = await this.provider.getFeeData();
    const over = {};
    if (fee.maxFeePerGas != null && fee.maxPriorityFeePerGas != null) {
      over.maxFeePerGas = (fee.maxFeePerGas * 110n) / 100n;
      over.maxPriorityFeePerGas = (fee.maxPriorityFeePerGas * 110n) / 100n;
    } else if (fee.gasPrice != null) {
      over.gasPrice = (fee.gasPrice * 110n) / 100n;
    } else {
      log.warn("No fee data from RPC — tx may fail; check network EIP-1559 support");
    }
    return over;
  }

  async batchGetICR(owners, price) {
    if (owners.length === 0) return [];
    const iface = this.troveManager.interface;
    const calls = owners.map((o) => ({
      target: CONFIG.TROVE_MANAGER_ADDRESS,
      allowFailure: true,
      callData: iface.encodeFunctionData("getCurrentICR", [o, price]),
    }));
    try {
      const res = await this.multicall.aggregate3(calls);
      return res.map((r) => {
        if (!r.success) return null;
        try {
          return iface.decodeFunctionResult("getCurrentICR", r.returnData)[0];
        } catch {
          return null;
        }
      });
    } catch {
      return owners.map(() => null);
    }
  }

  async batchGetNICR(owners) {
    const iface = this.troveManager.interface;
    const results = [];
    for (let i = 0; i < owners.length; i += CONFIG.MULTICALL_BATCH_SIZE) {
      const batch = owners.slice(i, i + CONFIG.MULTICALL_BATCH_SIZE);
      const calls = batch.map((o) => ({
        target: CONFIG.TROVE_MANAGER_ADDRESS,
        allowFailure: true,
        callData: iface.encodeFunctionData("getNominalICR", [o]),
      }));
      try {
        const res = await this.multicall.aggregate3(calls);
        for (const r of res) {
          if (!r.success) {
            results.push(0n);
            continue;
          }
          try {
            results.push(iface.decodeFunctionResult("getNominalICR", r.returnData)[0]);
          } catch {
            results.push(0n);
          }
        }
      } catch {
        batch.forEach(() => results.push(0n));
      }
    }
    return results;
  }

  subscribeEvents() {
    this.troveManager.removeAllListeners();

    this.troveManager.on("TroveUpdated", async (owner, _debt, _coll, _stake, operation) => {
      const op = Number(operation);
      if (op === OP_CLOSE || op === OP_LIQ) {
        this.store.remove(owner);
        return;
      }
      if (op !== OP_OPEN && op !== OP_ADJUST) return;
      try {
        const nicr = await this.troveManager.getNominalICR(owner);
        this.store.set(owner, { nicr });
      } catch {
        /* fullSync will repair */
      }
    });

    this.troveManager.on("TroveLiquidated", (owner) => {
      this.store.remove(owner);
    });

    this.troveManager.on("TroveClosed", (owner) => {
      this.store.remove(owner);
    });
  }

  async shutdown() {
    this._shuttingDown = true;
    this._listenersAttached = false;
    try {
      this.troveManager.removeAllListeners();
      this.provider.removeAllListeners();
    } catch {
      /* ignore */
    }
    try {
      this.provider.destroy();
    } catch {
      /* ignore */
    }
    log.info("Shutdown. Liquidation Stats:", JSON.stringify(this.stats));
    if (CONFIG.ENABLE_PEG_KEEPER) {
      log.info("PegKeeper Stats:", JSON.stringify(this.pegKeeper.stats));
    }
  }
}

const bot = new LiquidationBot();

bot.start().catch((e) => {
  log.error("Fatal:", e.message);
  process.exit(1);
});

function gracefulExit() {
  bot.shutdown().finally(() => process.exit(0));
}

process.on("SIGINT", gracefulExit);
process.on("SIGTERM", gracefulExit);
process.on("unhandledRejection", (r) => log.error("unhandledRejection:", r));
