# Close a Trove

**Close** finishes your position: you **repay all debt**, **withdraw your collateral**, and **burn your Trove NFT** in one flow.

---

## What happens when you close

When you close a Trove, the protocol:

1. **Burns your FnUSD** (repays debt)
2. **Returns your wzkLTC** collateral
3. **Burns your Trove NFT** (permanently destroys it)
4. **Clears your position** from the system

After closing, you can open a new Trove if you want (which will mint a new NFT with a different token ID).

---

## Prerequisites

| Check | Detail |
|-------|--------|
| FnUSD in wallet | You need **FnUSD** at least equal to **outstanding debt** - the app states the exact amount |
| Trove exists | Closing only applies when you already have an open Trove |
| NFT ownership | You must own the Trove NFT (if you transferred it, you can't close) |

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
| Trove | Position cleared - no active Trove until you **Open** again (still **one active Trove per wallet** at a time) |
| Wallet | **FnUSD** reduced by debt paid; **wzkLTC** increased by returned collateral |
| NFT | **Trove NFT burned** - it will disappear from your wallet and NFT marketplaces |

You can verify the NFT was burned by checking your wallet's NFT tab - it should no longer appear.

---

## Important: Debt includes redistribution

Your **outstanding debt** shown in the Close tab includes:

- Your original borrowed amount
- Any origination fees
- **Redistribution debt** from liquidated troves

This is why the debt amount might be higher than what you originally borrowed. The system redistributes debt from liquidations to all active trove holders. See [Dashboard](../dashboard-and-balances.md#pending-redistribution-gains) for more details.

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
