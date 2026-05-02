/**
 * FENUS Liquidation Bot — bot.js
 * ═══════════════════════════════
 * Single-file liquidation watcher. Dependencies: ethers + dotenv.
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
 *   cp .env.example .env
 *   npm install
 *   npm start
 */

import { ethers } from "ethers";
import "dotenv/config";

// ─── Config ───────────────────────────────────────────────────────────────────

function required(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

const CONFIG = {
  RPC_WS: required("RPC_WS"),
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

/** TroveManager Constants.MCR — 130% — keep in sync with contracts/src/Constants.sol */
const MCR = ethers.parseEther("1.3");
const DANGER_ZONE = ethers.parseEther("1.45");

/** TroveUpdated.operation values from TroveManager.sol */
const OP_OPEN = 0;
const OP_ADJUST = 1;
const OP_CLOSE = 2;
const OP_LIQ = 4;

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
    log.info(" Wallet :", this.signer.address);
    log.info(" TroveMgr:", CONFIG.TROVE_MANAGER_ADDRESS);

    const bal = await this.provider.getBalance(this.signer.address);
    log.info(" Balance :", ethers.formatEther(bal), "(native gas token)");
    if (bal < ethers.parseEther("0.01")) log.warn("Low gas balance — top up soon");

    log.info("Building Trove index…");
    await this.fullSync();
    log.info("Indexed", this.store.size(), "active Troves");

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
      `Block ${blockNumber} | zkLTC ~ $${ethers.formatEther(price)} | ` +
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
    log.info("Shutdown. Stats:", JSON.stringify(this.stats));
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
