# Close a Trove

**Close** finishes your position: you **repay all debt** and **withdraw your collateral** in one flow.

---

## Prerequisites

| Check | Detail |
|-------|--------|
| FnUSD in wallet | You need **FnUSD** at least equal to **outstanding debt** — the app states the exact amount |
| Trove exists | Closing only applies when you already have an open Trove |

---

## What the Close tab summarizes

| Section | Meaning |
|---------|---------|
| **What you repay** | Outstanding debt in **FnUSD** (total to repay) |
| **What you receive** | **wzkLTC** collateral returned to you; optional USD value at current oracle price |

---

## Steps to close

| Step | Action |
|------|--------|
| 1 | **Trove** → tab **Close** |
| 2 | Confirm you hold enough **FnUSD** for the stated debt |
| 3 | Submit **Close Trove** |
| 4 | Confirm in wallet |

---

## After closing

| Item | Expected result |
|------|------------------|
| Trove | Position cleared — no active Trove until you **Open** again (still **one active Trove per wallet** at a time) |
| Wallet | **FnUSD** reduced by debt paid; **wzkLTC** increased by returned collateral |

---

## If close seems impossible

| Issue | What to do |
|-------|------------|
| Not enough FnUSD | **Repay** partially on **Repay** tab, or acquire **FnUSD** (swap, borrow elsewhere, etc.) |
| Transaction error | Verify network, balance, and try again |

---

## Close vs repay — quick distinction

| | Repay | Close |
|--|-------|-------|
| Debt | Can be partial | Intended to finish the Trove |
| Collateral | Stays locked until you also withdraw separately | Returned as part of closing |
| Use when | Adjusting risk | Exiting completely |
