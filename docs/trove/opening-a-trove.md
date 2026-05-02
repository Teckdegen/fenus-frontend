# Open a Trove

**Open** creates your Trove: you deposit **wzkLTC** and choose how much **FnUSD** to borrow.

---

## Prerequisites

| Check | Requirement |
|-------|-------------|
| Wallet | Connected |
| Collateral | Enough **wzkLTC** in your wallet |
| Existing Trove | None — only one Trove per wallet |
| Ratio | Opening position must meet the protocol **minimum collateral ratio** (see [Collateral ratio](collateral-ratio-explained.md)) |

---

## Fields on the Open tab

| Field | What you enter |
|-------|----------------|
| **Deposit wzkLTC** | Amount of wzkLTC collateral to lock |
| **Borrow FnUSD** | How much FnUSD you want to receive |

---

## What the preview shows

| Line | Meaning |
|------|---------|
| **Collateral ratio** | Safety of the position after open — must stay **at or above** the minimum required for actions |
| **Liquidation price** | Rough wzkLTC price level where liquidation becomes relevant |
| **Origination fee** | One-time fee on the borrowed amount at open |
| **Total debt at open** | Borrow amount **plus** origination fee — this is what your ratio is computed against |

---

## Fees at open

| Item | Typical value |
|------|----------------|
| Origination fee | **0.5%** of the borrowed FnUSD (sent to treasury per app labeling) |
| Interest | **0% APR** — no ongoing interest shown in app |

Exact decimals and rounding follow on-chain behavior; the preview is your guide before submitting.

---

## Steps to open

| Step | Action |
|------|--------|
| 1 | Go to **Trove** → tab **Open** |
| 2 | Enter collateral and borrow amounts |
| 3 | Confirm preview — fix warnings if ratio is too low |
| 4 | Approve **wzkLTC** if the app asks (first time) |
| 5 | Submit **Open Trove** and confirm in wallet |

---

## Common blocks

| Symptom | Cause |
|---------|--------|
| “Already have an open Trove” | Use manage tabs instead of Open |
| Ratio too low | Increase collateral or reduce borrow until preview passes |
| Transaction rejected | Slippage/network/gas — retry or check wallet |

---

## After opening

| Where | What to verify |
|-------|----------------|
| **Dashboard** | Collateral, debt, ratio |
| Wallet | **FnUSD** balance increased |
