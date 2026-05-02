import "dotenv/config";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  formatUnits,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

// ---------- env ----------
const RPC_URL = mustEnv("CLIPFARM_RPC_URL");
const CHAIN_ID = parseInt(mustEnv("CLIPFARM_CHAIN_ID"), 10);
const ADMIN_PRIVATE_KEY = mustEnv("ADMIN_PRIVATE_KEY");

const SUPABASE_URL = mustEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = mustEnv("SUPABASE_SERVICE_ROLE_KEY");

const ENC_KEY_B64 = mustEnv("CLIPFARM_ENCRYPTION_KEY_BASE64");
const ENC_KEY = Buffer.from(ENC_KEY_B64, "base64");
if (ENC_KEY.length !== 32) throw new Error("CLIPFARM_ENCRYPTION_KEY_BASE64 must decode to 32 bytes");

const ADDR_WZK = mustEnv("WZKLTC_ADDRESS");
const ADDR_FNUSD = mustEnv("FNUSD_ADDRESS");
const ADDR_BO = mustEnv("BORROWER_OPERATIONS_ADDRESS");
const ADDR_TM = mustEnv("TROVE_MANAGER_ADDRESS");
const ADDR_PRICE_FEED = mustEnv("PRICE_FEED_ADDRESS");

const FUND_NATIVE_GAS = parseFloat(envOr("FUND_NATIVE_GAS", "0.002"));
const FUND_WZKLTC = parseFloat(envOr("FUND_WZKLTC", "2.0"));
const OPEN_TROVE_DEPOSIT_WZKLTC = parseFloat(envOr("OPEN_TROVE_DEPOSIT_WZKLTC", "1.0"));
const BORROW_MIN = parseFloat(envOr("OPEN_TROVE_BORROW_MIN_FNUSD", "500"));
const BORROW_MAX = parseFloat(envOr("OPEN_TROVE_BORROW_MAX_FNUSD", "5000"));

const WALLETS_PER_24H = parseInt(envOr("WALLETS_PER_24H", "2000"), 10);

const DAILY_ACTION = envOr("DAILY_ACTION", "mixed"); // repay | borrow | addColl | mixed
const DAILY_MAX_ACTIONS_PER_WALLET_PER_24H = parseInt(envOr("DAILY_MAX_ACTIONS_PER_WALLET_PER_24H", "1"), 10);
const DAILY_FNUSD_MIN = parseFloat(envOr("DAILY_FNUSD_MIN", "1"));
const DAILY_FNUSD_MAX = parseFloat(envOr("DAILY_FNUSD_MAX", "50"));
const DAILY_WZKLTC_MIN = parseFloat(envOr("DAILY_WZKLTC_MIN", "0.001"));
const DAILY_WZKLTC_MAX = parseFloat(envOr("DAILY_WZKLTC_MAX", "0.05"));

const ENABLE_INTERNAL_TRANSFERS = envOr("ENABLE_INTERNAL_TRANSFERS", "true") === "true";
const INTERNAL_TRANSFER_EVERY_MINUTES = parseInt(envOr("INTERNAL_TRANSFER_EVERY_MINUTES", "10"), 10);
const INTERNAL_TRANSFER_FNUSD_MIN = parseFloat(envOr("INTERNAL_TRANSFER_FNUSD_MIN", "0.5"));
const INTERNAL_TRANSFER_FNUSD_MAX = parseFloat(envOr("INTERNAL_TRANSFER_FNUSD_MAX", "5"));
const INTERNAL_TRANSFER_WZKLTC_MIN = parseFloat(envOr("INTERNAL_TRANSFER_WZKLTC_MIN", "0.0001"));
const INTERNAL_TRANSFER_WZKLTC_MAX = parseFloat(envOr("INTERNAL_TRANSFER_WZKLTC_MAX", "0.01"));

// ---------- constants ----------
const DAY_MS = 24 * 60 * 60 * 1000;
const ZERO = "0x0000000000000000000000000000000000000000";

// ERC20-ish
const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "o", type: "address" }, { name: "s", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "s", type: "address" }, { name: "a", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "a", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
];

const WZK_ABI = [
  ...ERC20_ABI,
  { type: "function", name: "adminMint", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "a", type: "uint256" }], outputs: [] },
];

const BORROWER_OPS_ABI = [
  { type: "function", name: "openTrove", stateMutability: "nonpayable", inputs: [
    { name: "collAmount", type: "uint256" },
    { name: "fnUSDAmount6", type: "uint256" },
    { name: "upperHint", type: "address" },
    { name: "lowerHint", type: "address" },
  ], outputs: [] },
  { type: "function", name: "addColl", stateMutability: "nonpayable", inputs: [
    { name: "collAmount", type: "uint256" },
    { name: "upperHint", type: "address" },
    { name: "lowerHint", type: "address" },
  ], outputs: [] },
  { type: "function", name: "withdrawFnUSD", stateMutability: "nonpayable", inputs: [
    { name: "fnUSDAmount6", type: "uint256" },
    { name: "upperHint", type: "address" },
    { name: "lowerHint", type: "address" },
  ], outputs: [] },
  { type: "function", name: "repayFnUSD", stateMutability: "nonpayable", inputs: [
    { name: "fnUSDAmount6", type: "uint256" },
    { name: "upperHint", type: "address" },
    { name: "lowerHint", type: "address" },
  ], outputs: [] },
];

const TROVE_MANAGER_ABI = [
  { type: "function", name: "getTroveDebt", stateMutability: "view", inputs: [{ name: "borrower", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getTroveColl", stateMutability: "view", inputs: [{ name: "borrower", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getEntireDebtAndColl", stateMutability: "view", inputs: [{ name: "borrower", type: "address" }], outputs: [{ name: "debt", type: "uint256" }, { name: "coll", type: "uint256" }] },
];

const PRICE_FEED_ABI = [
  { type: "function", name: "fetchPrice", stateMutability: "view", inputs: [], outputs: [{ name: "price", type: "uint256" }, { name: "isLive", type: "bool" }] },
];

// ---------- clients ----------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const publicClient = createPublicClient({
  transport: http(RPC_URL),
  chain: {
    id: CHAIN_ID,
    name: "clipfarm",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  },
});

const adminAccount = privateKeyToAccount(with0x(ADMIN_PRIVATE_KEY));
const adminWallet = createWalletClient({
  account: adminAccount,
  transport: http(RPC_URL),
  chain: publicClient.chain,
});

// ---------- helpers ----------
function envOr(k, d) { return process.env[k] ?? d; }
function mustEnv(k) {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
}
function with0x(pk) { return pk.startsWith("0x") ? pk : `0x${pk}`; }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function jitter(ms, pct = 0.15) {
  const delta = ms * pct;
  return Math.max(250, Math.floor(ms + (Math.random() * 2 - 1) * delta));
}
function randBetween(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Borrow amounts: mostly small, sometimes bigger (still <= 5k)
function sampleBorrowFnUSD() {
  // 70%: 500..1500 ; 30%: 1500..5000
  if (Math.random() < 0.70) return randBetween(Math.max(500, BORROW_MIN), Math.min(1500, BORROW_MAX));
  return randBetween(Math.max(1500, BORROW_MIN), BORROW_MAX);
}

function encryptPk(privateKeyHex) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(privateKeyHex, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    enc_pk_base64: ciphertext.toString("base64"),
    enc_iv_base64: iv.toString("base64"),
    enc_tag_base64: tag.toString("base64"),
  };
}

function decryptPk(row) {
  const iv = Buffer.from(row.enc_iv_base64, "base64");
  const tag = Buffer.from(row.enc_tag_base64, "base64");
  const ciphertext = Buffer.from(row.enc_pk_base64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return pt.toString("utf8");
}

async function markWallet(address, patch) {
  const { error } = await supabase
    .from("clipfarm_wallets")
    .update({ ...patch, last_used_at: new Date().toISOString() })
    .eq("address", address);
  if (error) throw error;
}

async function insertWallet(address, enc) {
  const { error } = await supabase.from("clipfarm_wallets").insert({
    address,
    ...enc,
    status: "new",
  });
  if (error) throw error;
}

async function fetchWalletsByStatus(status, limit = 200) {
  const { data, error } = await supabase
    .from("clipfarm_wallets")
    .select("*")
    .eq("status", status)
    .order("id", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

async function fetchActiveWallets(limit = 500) {
  const { data, error } = await supabase
    .from("clipfarm_wallets")
    .select("*")
    .in("status", ["trove_open", "active"])
    .order("last_used_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

async function countWalletsCreatedSince(iso) {
  const { count, error } = await supabase
    .from("clipfarm_wallets")
    .select("*", { count: "exact", head: true })
    .gte("created_at", iso);
  if (error) throw error;
  return count ?? 0;
}

async function fundNative(to, ethAmount) {
  const hash = await adminWallet.sendTransaction({
    to,
    value: parseUnits(String(ethAmount), 18),
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

async function adminTransferWzk(to, amountWzk) {
  const amount = parseUnits(String(amountWzk), 8);
  const hash = await adminWallet.writeContract({
    address: ADDR_WZK,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

async function ensureApprove(wallet, tokenAddr, spender, minAmount, decimals) {
  const allowance = await publicClient.readContract({
    address: tokenAddr,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [wallet.account.address, spender],
  });
  if (allowance >= minAmount) return;
  const hash = await wallet.writeContract({
    address: tokenAddr,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spender, minAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

function makeWalletClient(pkHex) {
  const account = privateKeyToAccount(with0x(pkHex));
  return createWalletClient({
    account,
    transport: http(RPC_URL),
    chain: publicClient.chain,
  });
}

async function getPrice() {
  const [price, isLive] = await publicClient.readContract({
    address: ADDR_PRICE_FEED,
    abi: PRICE_FEED_ABI,
    functionName: "fetchPrice",
  });
  if (!isLive) throw new Error("Price feed down");
  return price;
}

async function getTroveData(address) {
  const [debt, coll] = await publicClient.readContract({
    address: ADDR_TM,
    abi: TROVE_MANAGER_ABI,
    functionName: "getEntireDebtAndColl",
    args: [address],
  });
  return { debt, coll };
}

function calculateCR(collAmount18, debtAmount18, price18) {
  // CR = (coll * price) / debt * 100
  // All values are in 18 decimals
  if (debtAmount18 === 0n) return 999999n; // infinite CR
  const collValue = (collAmount18 * price18) / parseUnits("1", 18);
  const cr = (collValue * parseUnits("100", 18)) / debtAmount18;
  return cr;
}

function crToPercent(cr18) {
  // Convert 18-decimal CR to percentage number
  return Number(formatUnits(cr18, 18));
}

async function canBorrowMore(address, additionalBorrow6) {
  const { debt, coll } = await getTroveData(address);
  const price = await getPrice();
  
  // Convert additional borrow from 6 decimals to 18 decimals
  const additionalBorrow18 = parseUnits(String(additionalBorrow6), 12); // 6 to 18 = multiply by 1e12
  const newDebt = debt + additionalBorrow18;
  
  const newCR = calculateCR(coll, newDebt, price);
  const crPercent = crToPercent(newCR);
  
  // Need at least 140% to be safe (buffer above 135% minimum)
  return crPercent >= 140;
}

async function canAddColl(address, additionalColl8) {
  // Adding collateral always improves CR, so always safe
  return true;
}

async function openTroveForWallet(row) {
  const pk = decryptPk(row);
  const wallet = makeWalletClient(pk);

  const coll = parseUnits(String(OPEN_TROVE_DEPOSIT_WZKLTC), 8);
  const coll18 = coll * parseUnits("1", 10); // 8 decimals to 18 decimals
  
  // Get price and calculate max safe borrow
  const price = await getPrice();
  
  // Calculate max borrow at 140% CR (safe buffer above 135%)
  // CR = (coll * price) / debt * 100
  // debt = (coll * price) / (CR / 100)
  const collValue = (coll18 * price) / parseUnits("1", 18);
  const targetCR = parseUnits("140", 18); // 140%
  const maxDebt18 = (collValue * parseUnits("100", 18)) / targetCR;
  const maxBorrow6 = Number(formatUnits(maxDebt18, 12)); // 18 to 6 decimals
  
  // Sample a borrow amount that's safe
  let borrowAmount = sampleBorrowFnUSD();
  if (borrowAmount > maxBorrow6 * 0.95) {
    borrowAmount = maxBorrow6 * 0.90; // Use 90% of max to be extra safe
  }
  
  const borrow = parseUnits(String(borrowAmount.toFixed(2)), 6);

  await ensureApprove(wallet, ADDR_WZK, ADDR_BO, coll, 8);

  const hash = await wallet.writeContract({
    address: ADDR_BO,
    abi: BORROWER_OPS_ABI,
    functionName: "openTrove",
    args: [coll, borrow, ZERO, ZERO],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

async function doDailyAction(row) {
  const pk = decryptPk(row);
  const wallet = makeWalletClient(pk);

  const mode = DAILY_ACTION === "mixed" ? pick(["repay", "borrow", "addColl"]) : DAILY_ACTION;

  if (mode === "addColl") {
    const amt = randBetween(DAILY_WZKLTC_MIN, DAILY_WZKLTC_MAX);
    const coll = parseUnits(amt.toFixed(6), 8);
    await ensureApprove(wallet, ADDR_WZK, ADDR_BO, coll, 8);
    const hash = await wallet.writeContract({
      address: ADDR_BO,
      abi: BORROWER_OPS_ABI,
      functionName: "addColl",
      args: [coll, ZERO, ZERO],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return { action: "addColl", amount: `${amt} wzkLTC` };
  }

  if (mode === "borrow") {
    const amt = randBetween(DAILY_FNUSD_MIN, DAILY_FNUSD_MAX);
    const fn = parseUnits(amt.toFixed(2), 6);
    
    // Check if we can safely borrow this amount
    const canBorrow = await canBorrowMore(wallet.account.address, fn);
    if (!canBorrow) {
      return { action: "borrow:skip", amount: `${amt} FnUSD would breach CR` };
    }
    
    const hash = await wallet.writeContract({
      address: ADDR_BO,
      abi: BORROWER_OPS_ABI,
      functionName: "withdrawFnUSD",
      args: [fn, ZERO, ZERO],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return { action: "borrow", amount: `${amt} FnUSD` };
  }

  // repay
  const amt = randBetween(DAILY_FNUSD_MIN, DAILY_FNUSD_MAX);
  const fn = parseUnits(amt.toFixed(2), 6);

  // Only try repay if wallet has some FnUSD
  const bal = await publicClient.readContract({
    address: ADDR_FNUSD,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [wallet.account.address],
  });
  if (bal < fn) return { action: "repay:skip", amount: `need ${amt} FnUSD` };

  await ensureApprove(wallet, ADDR_FNUSD, ADDR_BO, fn, 6);
  const hash = await wallet.writeContract({
    address: ADDR_BO,
    abi: BORROWER_OPS_ABI,
    functionName: "repayFnUSD",
    args: [fn, ZERO, ZERO],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { action: "repay", amount: `${amt} FnUSD` };
}

async function internalTransfer(activeRows) {
  if (!ENABLE_INTERNAL_TRANSFERS) return;
  if (activeRows.length < 2) return;

  const from = pick(activeRows);
  let to = pick(activeRows);
  for (let i = 0; i < 4 && to.address === from.address; i++) to = pick(activeRows);
  if (to.address === from.address) return;

  const pk = decryptPk(from);
  const wallet = makeWalletClient(pk);

  const token = Math.random() < 0.7 ? "fnusd" : "wzk"; // more fnusd transfers
  if (token === "fnusd") {
    const amt = randBetween(INTERNAL_TRANSFER_FNUSD_MIN, INTERNAL_TRANSFER_FNUSD_MAX);
    const a = parseUnits(amt.toFixed(2), 6);
    const bal = await publicClient.readContract({
      address: ADDR_FNUSD,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [wallet.account.address],
    });
    if (bal < a) return;
    const hash = await wallet.writeContract({
      address: ADDR_FNUSD,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to.address, a],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await markWallet(from.address, { status: "active", note: `sent ${amt} FnUSD -> ${to.address}` });
    await markWallet(to.address, { status: "active", note: `recv ${amt} FnUSD <- ${from.address}` });
    return;
  }

  const amt = randBetween(INTERNAL_TRANSFER_WZKLTC_MIN, INTERNAL_TRANSFER_WZKLTC_MAX);
  const a = parseUnits(amt.toFixed(6), 8);
  const bal = await publicClient.readContract({
    address: ADDR_WZK,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [wallet.account.address],
  });
  if (bal < a) return;
  const hash = await wallet.writeContract({
    address: ADDR_WZK,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to.address, a],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  await markWallet(from.address, { status: "active", note: `sent ${amt} wzkLTC -> ${to.address}` });
  await markWallet(to.address, { status: "active", note: `recv ${amt} wzkLTC <- ${from.address}` });
}

function shouldRunDaily(lastUsedAtIso) {
  if (DAILY_MAX_ACTIONS_PER_WALLET_PER_24H <= 0) return false;
  if (!lastUsedAtIso) return true;
  const last = new Date(lastUsedAtIso).getTime();
  return (Date.now() - last) >= DAY_MS / DAILY_MAX_ACTIONS_PER_WALLET_PER_24H;
}

async function createOneWallet() {
  const pk = generatePrivateKey(); // 0x...
  const account = privateKeyToAccount(pk);

  const enc = encryptPk(pk);
  await insertWallet(account.address, enc);
  return { address: account.address };
}

async function bootstrapOneNewWallet(row) {
  // Fund gas + transfer collateral, then open trove
  await markWallet(row.address, { status: "new", note: "funding" });
  await fundNative(row.address, FUND_NATIVE_GAS);
  await adminTransferWzk(row.address, FUND_WZKLTC);
  await markWallet(row.address, { status: "funded", note: `funded gas=${FUND_NATIVE_GAS}, wzk=${FUND_WZKLTC}` });

  await openTroveForWallet(row);
  await markWallet(row.address, { status: "trove_open", note: "trove opened" });
}

// ---------- main loop ----------
async function main() {
  console.log("clipfarm starting…");
  console.log(`admin: ${adminAccount.address}`);
  console.log(`rpc: ${RPC_URL}`);
  console.log(`target pace: ${WALLETS_PER_24H} wallets / 24h`);

  const start = Date.now();
  let nextTransferAt = Date.now() + INTERNAL_TRANSFER_EVERY_MINUTES * 60 * 1000;

  while (true) {
    try {
      // 1) Pace wallet creation over 24h from launch
      const elapsed = Date.now() - start;
      const desired = Math.floor((elapsed / DAY_MS) * WALLETS_PER_24H);
      const sinceIso = new Date(start).toISOString();
      const created = await countWalletsCreatedSince(sinceIso);

      if (created < desired) {
        const { address } = await createOneWallet();
        console.log(`created wallet: ${address} (${created + 1}/${desired} target so far)`);
      }

      // 2) Bootstrap a few new wallets each tick (limit)
      const newOnes = await fetchWalletsByStatus("new", 5);
      for (const row of newOnes) {
        try {
          await bootstrapOneNewWallet(row);
          console.log(`bootstrapped: ${row.address}`);
          await sleep(jitter(1500));
        } catch (e) {
          console.error(`bootstrap failed ${row.address}:`, e?.message ?? e);
          await markWallet(row.address, { status: "error", note: `bootstrap failed: ${e?.message ?? String(e)}` });
        }
      }

      // 3) Daily actions for active wallets (small batch each tick)
      const actives = await fetchActiveWallets(50);
      for (const row of actives) {
        if (!shouldRunDaily(row.last_used_at)) continue;
        try {
          const res = await doDailyAction(row);
          await markWallet(row.address, { status: "active", note: `daily ${res.action} ${res.amount}` });
          console.log(`daily: ${row.address} -> ${res.action} ${res.amount}`);
          await sleep(jitter(1200));
        } catch (e) {
          console.error(`daily failed ${row.address}:`, e?.message ?? e);
          await markWallet(row.address, { status: "error", note: `daily failed: ${e?.message ?? String(e)}` });
        }
      }

      // 4) Internal transfers between wallets periodically
      if (ENABLE_INTERNAL_TRANSFERS && Date.now() >= nextTransferAt) {
        const pool = await fetchActiveWallets(200);
        try {
          await internalTransfer(pool);
          console.log("internal transfer executed");
        } catch (e) {
          console.error("internal transfer failed:", e?.message ?? e);
        }
        nextTransferAt = Date.now() + INTERNAL_TRANSFER_EVERY_MINUTES * 60 * 1000;
      }

    } catch (e) {
      console.error("loop error:", e?.message ?? e);
    }

    // Tick interval: short, but jittered
    await sleep(jitter(2500));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

