# Dashboard & balances

The **Dashboard** is the home screen after you open the app (`/app`). It answers three questions fast:

- What do I hold?
- What is my Trove right now?
- What should I do next?

---

## Wallet overview strip

When your wallet is connected, you’ll see three headline numbers:

| Field | Meaning |
|-------|---------|
| **wzkLTC balance** | wzkLTC tokens in your wallet (not yet deposited into a Trove) |
| **FnUSD balance** | Stablecoin in your wallet — used to repay debt or close |
| **LTC price** | Oracle reference price shown by the app (for mental math and ratios) |

### Precision (important)

FENUS shows **small non-zero balances** with extra precision when needed. So if you have “a little bit” of wzkLTC, it won’t get rounded down to `0.00`.

---

## Empty collateral hint

If you are connected and your **wzkLTC wallet balance is truly zero**, the app may show a reminder to visit the **Faucet** so you can obtain test collateral before opening a Trove.

| Situation | Suggested action |
|-----------|------------------|
| No wzkLTC | Use **Faucet** (if enabled on your deployment) |
| Have wzkLTC | Go to **Trove → Open** |

---

## Your Trove card

If you already have an active Trove, the Dashboard summarizes it:

| Row | Meaning |
|-----|---------|
| **Collateral** | How much **wzkLTC** is locked in your Trove |
| **Debt** | How much **FnUSD** you owe (including fees already baked into protocol accounting where applicable) |
| **Collateral ratio** | Collateral value ÷ debt — keep **≥ 135%** (see [Collateral ratio](trove/collateral-ratio-explained.md)) |
| **Liquidation price** | Approximate **wzkLTC** price at which your position becomes unsafe |

Use **Manage Trove** to jump to the Trove screen for deposits, withdrawals, borrow, repay, or close.

---

## No Trove yet

| State | What you see |
|-------|----------------|
| Wallet disconnected | Prompt to connect |
| Connected, no Trove | Short explanation and **Open Trove** |

---

## Pending redistribution gains

When someone else’s Trove is **liquidated**, people who **still have an active Trove** can **earn fees** from that activity. Those flows show up over time through the protocol’s accounting — often as pending collateral and debt lines until everything is applied on-chain (for example when your Trove is updated).

The **Dashboard** surfaces four related lines (labels match the app):

| Label | Sub-label | What it means (plain language) |
|-------|-----------|--------------------------------|
| **Pending Coll. Gain** | *From liquidated Troves* | Collateral-side **fees / rewards** tied to liquidations that can flow to Trove holders — often **0.0000 wzkLTC** until something happens on-chain or the UI shows live values. |
| **Pending Debt Absorbed** | — | Debt-side movements that go with the same mechanics; **0.00 FnUSD** when nothing is pending. |
| **Default Pool Coll.** | — | **wzkLTC** in protocol accounting linked to those liquidation flows before they fully settle into active Troves. |
| **Default Pool Debt** | — | **FnUSD** side of that pool — the matching bookkeeping. |

### Takeaways

| Idea | Detail |
|------|--------|
| Who gets fees? | Usually **people with an active Trove** — liquidations can pay something through to remaining borrowers. |
| When do you see non‑zero numbers? | After liquidations occur and value moves through the system — quiet stretches often show **zeros**. |
| Does this replace managing your ratio? | **No.** Extra fees don’t remove liquidation risk from **your** Trove. |

Use **View Pools** from this card when you want liquidity venues; core safety still lives under **Manage Trove**.

---

## Quick troubleshooting

| Symptom | What to check |
|--------|----------------|
| Balance looks wrong | Make sure your wallet is on the **correct network**, then refresh once. |
| Shows `0` but you’re sure you have funds | Confirm the token is **wzkLTC** (not another LTC wrapper) and that you’re viewing the same wallet address. |
