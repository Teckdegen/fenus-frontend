/**
 * FENUS Liquidation Bot — bot.js
 * ══════════════════════════════
 * Single-file 24/7 liquidation bot. No external modules beyond ethers + dotenv.
 *
 * How it works:
 *   1. On startup, walks the SortedTroves linked list to build a flat in-memory
 *      Map of every active Trove address. 100k Troves ≈ 10MB RAM, O(1) lookup.
 *   2. Every new block: fetches the current zkLTC price (one view call).
 *   3. Batches all Trove addresses into groups of 500 and fires a single
 *      Multicall3 eth_call per batch to get ICR for all of them at once.
 *      100k Troves = 200 RPC calls → done in ~2-3 seconds.
 *   4. Any Trove with ICR < 130% MCR is immediately liquidated.
 *      Multiple eligible Troves → one batchLiquidate() tx.
 *   5. A "danger zone" Set (ICR < 145%) is checked every single block.
 *      Normal Troves are checked every block too but danger ones go first.
 *   6. TroveUpdated / TroveLiquidated events keep the Map in sync in real time.
 *   7. Every 300 blocks a full re-sync runs to catch any missed events.
 *
 * Setup:
 *   cp .env.example .env   ← fill in your values
 *   npm install
 *   node bot.js
 */

import { ethers } from "ethers";
import "dotenv/config";

// ─── Config (from .env) ───────────────────────────────────────────────────────

function required(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

const CONFIG = {
  RPC_WS:                  required("RPC_WS"),
  PRIVATE_KEY:             required("PRIVATE_KEY"),
  TROVE_MANAGER_ADDRESS:   required("TROVE_MANAGER_ADDRESS"),
  SORTED_TROVES_ADDRESS:   required("SORTED_TROVES_ADDRESS"),
  PRICE_FEED_ADDRESS:      required("PRICE_FEED_ADDRESS"),
  // Optional — defaults shown
  MULTICALL_BATCH_SIZE:    parseInt(process.env.MULTICALL_BATCH_SIZE  || "500"),
  LIQ_BATCH_SIZE:          parseInt(process.env.LIQ_BATCH_SIZE        || "50"),
  FULL_RESYNC_INTERVAL:    parseInt(process.env.FULL_RESYNC_INTERVAL  || "300"),
};

// ─── Logger ───────────────────────────────────────────────────────────────────

const ts  = () => new Date().toISOString();
const log = {
  info:  (...a) => console.log( `[${ts()}] INFO  `, ...a),
  warn:  (...a) => console.warn( `[${ts()}] WARN  `, ...a),
  error: (...a) => console.error(`[${ts()}] ERROR `, ...a),
};

// ─── TroveStore — in-memory flat Map ─────────────────────────────────────────
//
// Stores every active Trove as:  address (lowercase) → { nicr: BigInt }
//
// Why a flat Map?
//   - O(1) get / set / delete by address
//   - Array.from(map.keys()) gives a flat list for batch scanning in one pass
//   - No tree traversal, no sorting overhead on the hot path
//   - At 100k entries × ~100 bytes each = ~10MB RAM — trivial
//
// Danger zone Set:
//   Troves with ICR < 145% are added here. The scanner always checks these
//   first so near-liquidation Troves are never delayed by a large normal queue.

class TroveStore {
  constructor() {
    this._map    = new Map(); // address → { nicr }
    this._danger = new Set(); // addresses with ICR < 145%
  }

  set(addr, data)      { this._map.set(addr.toLowerCase(), data); }
  get(addr)            { return this._map.get(addr.toLowerCase()); }
  remove(addr)         { this._map.delete(addr.toLowerCase()); }
  has(addr)            { return this._map.has(addr.toLowerCase()); }
  clear()              { this._map.clear(); this._danger.clear(); }
  size()               { return this._map.size; }

  // Returns flat array of all owner addresses — used by batch scanner
  getAllOwners()        { return Array.from(this._map.keys()); }

  addDanger(addr)      { this._danger.add(addr.toLowerCase()); }
  removeDanger(addr)   { this._danger.delete(addr.toLowerCase()); }
  getDangerZone()      { return new Set(this._danger); }
  dangerSize()         { return this._danger.size; }
}

// ─── ABIs (minimal — only what the bot calls) ─────────────────────────────────

const TROVE_MANAGER_ABI = [
  "function getTroveOwnersCount() view returns (uint256)",
  "function getCurrentICR(address, uint256) view returns (uint256)",
  "function getNominalICR(address) view returns (uint256)",
  "function liquidate(address owner) external",
  "function batchLiquidate(address[] calldata owners) external",
  "event TroveUpdated(address indexed owner, uint256 debt, uint256 coll, uint256 stake, uint8 operation)",
  "event TroveLiquidated(address indexed owner, uint256 debt, uint256 coll, uint8 liquidationMode)",
];

const SORTED_TROVES_ABI = [
  "function getSize() view returns (uint256)",
  "function getLast() view returns (address)",   // tail = riskiest (lowest NICR)
  "function getPrev(address) view returns (address)",
];

const PRICE_FEED_ABI = [
  "function getLastGoodPrice() view returns (uint256)",
  "function status() view returns (uint8)",
];

// Multicall3 — same address on every EVM-compatible chain
const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)",
];
const MULTICALL3_ADDR = "0xcA11bde05977b3631167028862bE2a173976CA11";

// ─── Protocol constants ───────────────────────────────────────────────────────

const MCR         = ethers.parseEther("1.3");   // 130% — liquidation threshold
const DANGER_ZONE = ethers.parseEther("1.45");  // 145% — priority watch zone

// ─── Bot ──────────────────────────────────────────────────────────────────────

class LiquidationBot {
  constructor() {
    // WebSocket provider — instant new-block events, no polling delay
    this.provider = new ethers.WebSocketProvider(CONFIG.RPC_WS);
    this.signer   = new ethers.Wallet(CONFIG.PRIVATE_KEY, this.provider);

    this.troveManager = new ethers.Contract(CONFIG.TROVE_MANAGER_ADDRESS, TROVE_MANAGER_ABI, this.signer);
    this.sortedTroves = new ethers.Contract(CONFIG.SORTED_TROVES_ADDRESS,  SORTED_TROVES_ABI,  this.provider);
    this.priceFeed    = new ethers.Contract(CONFIG.PRICE_FEED_ADDRESS,     PRICE_FEED_ABI,     this.provider);
    this.multicall    = new ethers.Contract(MULTICALL3_ADDR,               MULTICALL3_ABI,     this.provider);

    this.store      = new TroveStore();
    this.lastPrice  = 0n;
    this.isScanning = false;
    this.isLiqing   = false;
    this.blockCount = 0;

    // Stats — printed on shutdown
    this.stats = { liquidations: 0, txsSent: 0, blocksProcessed: 0, errors: 0 };
  }

  // ── Startup ────────────────────────────────────────────────────────────────

  async start() {
    log.info("🤖 FENUS Liquidation Bot starting");
    log.info(`   Wallet  : ${this.signer.address}`);
    log.info(`   TroveMgr: ${CONFIG.TROVE_MANAGER_ADDRESS}`);

    const bal = await this.provider.getBalance(this.signer.address);
    log.info(`   Balance : ${ethers.formatEther(bal)} (native gas token)`);
    if (bal < ethers.parseEther("0.01")) log.warn("⚠️  Low gas balance — top up soon");

    log.info("📦 Building Trove index...");
    await this.fullSync();
    log.info(`✅ Indexed ${this.store.size()} active Troves`);

    // Real-time event subscriptions — keep store in sync instantly
    this.subscribeEvents();

    // New block = main scan trigger
    this.provider.on("block", (n) => this.onBlock(n));

    log.info("👁️  Watching every block for liquidations\n");
  }

  // ── Full sync — walks SortedTroves linked list ─────────────────────────────
  // Runs at startup and every FULL_RESYNC_INTERVAL blocks as a safety net.

  async fullSync() {
    const owners = await this.walkSortedTroves();
    log.info(`   Found ${owners.length} Troves — fetching NICR via multicall...`);
    const nicrs = await this.batchGetNICR(owners);
    this.store.clear();
    for (let i = 0; i < owners.length; i++) {
      this.store.set(owners[i], { nicr: nicrs[i] });
    }
  }

  // Walk the doubly-linked SortedTroves list from tail (riskiest) to head.
  // One sequential walk — unavoidable at startup, but only runs once.
  async walkSortedTroves() {
    const owners = [];
    let cur = await this.sortedTroves.getLast();
    while (cur && cur !== ethers.ZeroAddress) {
      owners.push(cur);
      cur = await this.sortedTroves.getPrev(cur);
    }
    return owners;
  }

  // ── New block handler — the hot path ──────────────────────────────────────

  async onBlock(blockNumber) {
    this.blockCount++;
    this.stats.blocksProcessed++;

    // Periodic full re-sync to catch any missed events
    if (this.blockCount % CONFIG.FULL_RESYNC_INTERVAL === 0) {
      log.info(`Block ${blockNumber} — periodic full re-sync`);
      await this.fullSync().catch((e) => log.warn("Re-sync failed:", e.message));
    }

    // Fetch price — single view call, very fast
    let price;
    try {
      price = await this.priceFeed.getLastGoodPrice();
    } catch {
      log.warn(`Block ${blockNumber}: price fetch failed, skipping`);
      return;
    }

    // Only scan if price changed OR every 10 blocks as a heartbeat
    if (price === this.lastPrice && this.blockCount % 10 !== 0) return;
    this.lastPrice = price;

    if (this.isScanning) return; // never stack scans
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

  // ── Core scan — multicall ICR check on all Troves ─────────────────────────

  async scan(price, blockNumber) {
    const dangerSet    = this.store.getDangerZone();
    const allOwners    = this.store.getAllOwners();
    const dangerOwners = allOwners.filter((a) => dangerSet.has(a));
    const normalOwners = allOwners.filter((a) => !dangerSet.has(a));

    // Danger zone always goes first — these are closest to the edge
    const toCheck = [...dangerOwners, ...normalOwners];
    if (toCheck.length === 0) return;

    const eligible = [];

    // Multicall batches — 500 addresses per eth_call
    // 100k Troves = 200 calls, each returns in ~15ms → ~3 seconds total
    for (let i = 0; i < toCheck.length; i += CONFIG.MULTICALL_BATCH_SIZE) {
      const batch = toCheck.slice(i, i + CONFIG.MULTICALL_BATCH_SIZE);
      const icrs  = await this.batchGetICR(batch, price);

      for (let j = 0; j < batch.length; j++) {
        const icr   = icrs[j];
        const owner = batch[j];
        if (icr === null) continue;

        // Maintain danger zone
        if (icr < DANGER_ZONE) this.store.addDanger(owner);
        else                   this.store.removeDanger(owner);

        // Eligible for liquidation
        if (icr > 0n && icr < MCR) eligible.push({ owner, icr });
      }
    }

    if (eligible.length === 0) return;

    // Worst first
    eligible.sort((a, b) => (a.icr < b.icr ? -1 : 1));

    log.info(
      `Block ${blockNumber} | zkLTC $${ethers.formatEther(price)} | ` +
      `🔴 ${eligible.length} Trove(s) below MCR`
    );

    await this.liquidate(eligible);
  }

  // ── Liquidation execution ──────────────────────────────────────────────────

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
      log.info(`  ⚡ liquidate(${owner})`);
      const gas = await this.troveManager.liquidate.estimateGas(owner);
      const tx  = await this.troveManager.liquidate(owner, {
        gasLimit:    (gas * 120n) / 100n,
        maxFeePerGas: await this.fastGasPrice(),
      });
      log.info(`  📤 ${tx.hash}`);
      const receipt = await tx.wait();
      log.info(`  ✅ block ${receipt.blockNumber} | gas used: ${receipt.gasUsed}`);
      this.stats.liquidations++;
      this.stats.txsSent++;
      this.store.remove(owner);
    } catch (e) {
      log.error(`  ❌ liquidate(${owner}): ${e.message}`);
      this.stats.errors++;
    }
  }

  async liquidateBatch(owners) {
    // Split into chunks of LIQ_BATCH_SIZE to stay under block gas limit
    for (let i = 0; i < owners.length; i += CONFIG.LIQ_BATCH_SIZE) {
      const chunk = owners.slice(i, i + CONFIG.LIQ_BATCH_SIZE);
      try {
        log.info(`  ⚡ batchLiquidate(${chunk.length} Troves)`);
        const gas = await this.troveManager.batchLiquidate.estimateGas(chunk);
        const tx  = await this.troveManager.batchLiquidate(chunk, {
          gasLimit:    (gas * 120n) / 100n,
          maxFeePerGas: await this.fastGasPrice(),
        });
        log.info(`  📤 ${tx.hash}`);
        const receipt = await tx.wait();
        log.info(`  ✅ block ${receipt.blockNumber} | ${chunk.length} liquidated | gas: ${receipt.gasUsed}`);
        this.stats.liquidations += chunk.length;
        this.stats.txsSent++;
        chunk.forEach((o) => this.store.remove(o));
      } catch (e) {
        log.error(`  ❌ batchLiquidate failed: ${e.message} — falling back to singles`);
        for (const owner of chunk) await this.liquidateSingle(owner);
      }
    }
  }

  // ── Multicall helpers — the speed engine ──────────────────────────────────

  // getCurrentICR for a batch of owners — one eth_call for up to 500 addresses
  async batchGetICR(owners, price) {
    const iface = this.troveManager.interface;
    const calls = owners.map((o) => ({
      target:      CONFIG.TROVE_MANAGER_ADDRESS,
      allowFailure: true,
      callData:    iface.encodeFunctionData("getCurrentICR", [o, price]),
    }));
    try {
      const res = await this.multicall.aggregate3(calls);
      return res.map((r) => {
        if (!r.success) return null;
        try { return iface.decodeFunctionResult("getCurrentICR", r.returnData)[0]; }
        catch { return null; }
      });
    } catch {
      return owners.map(() => null); // retry next block
    }
  }

  // getNominalICR for a batch — used at startup (no price needed)
  async batchGetNICR(owners) {
    const iface   = this.troveManager.interface;
    const results = [];
    for (let i = 0; i < owners.length; i += CONFIG.MULTICALL_BATCH_SIZE) {
      const batch = owners.slice(i, i + CONFIG.MULTICALL_BATCH_SIZE);
      const calls = batch.map((o) => ({
        target:      CONFIG.TROVE_MANAGER_ADDRESS,
        allowFailure: true,
        callData:    iface.encodeFunctionData("getNominalICR", [o]),
      }));
      try {
        const res = await this.multicall.aggregate3(calls);
        for (const r of res) {
          if (!r.success) { results.push(0n); continue; }
          try { results.push(iface.decodeFunctionResult("getNominalICR", r.returnData)[0]); }
          catch { results.push(0n); }
        }
      } catch {
        batch.forEach(() => results.push(0n));
      }
    }
    return results;
  }

  // ── Event subscriptions — real-time store updates ─────────────────────────

  subscribeEvents() {
    // Trove opened or adjusted → add/update in store
    this.troveManager.on("TroveUpdated", async (owner) => {
      try {
        const nicr = await this.troveManager.getNominalICR(owner);
        this.store.set(owner, { nicr });
      } catch { /* ignore — next resync will catch it */ }
    });

    // Trove liquidated → remove immediately so we don't try again
    this.troveManager.on("TroveLiquidated", (owner) => {
      this.store.remove(owner);
      this.store.removeDanger(owner);
    });
  }

  // ── Gas price — 10% above current base to get included fast ───────────────

  async fastGasPrice() {
    const fee = await this.provider.getFeeData();
    return (fee.maxFeePerGas * 110n) / 100n;
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

const bot = new LiquidationBot();

bot.start().catch((e) => {
  log.error("Fatal:", e.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  log.info(`\nShutdown. Stats: ${JSON.stringify(bot.stats)}`);
  process.exit(0);
});
