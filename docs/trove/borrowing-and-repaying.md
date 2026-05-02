# Borrow & repay FnUSD

**Borrow** mints more **FnUSD** against existing collateral. **Repay** sends **FnUSD** back to reduce debt.

---

## Borrow (Borrow More)

| Step | Action |
|------|--------|
| 1 | **Trove** → tab **Borrow** |
| 2 | Enter **Borrow FnUSD** amount |
| 3 | Confirm preview — ratio must remain **above** minimum |
| 4 | Submit **Borrow More** |

| Effect | Detail |
|--------|--------|
| Debt | Increases **including** new origination fee on the added borrow |
| Wallet **FnUSD** | Increases |
| Collateral | Unchanged |
| Collateral ratio | Usually **decreases** |

### Fees when borrowing more

| Fee | Applies |
|-----|---------|
| **Origination fee 0.5%** | On the **new** borrowed amount (same idea as opening) |

---

## Repay

| Step | Action |
|------|--------|
| 1 | **Trove** → tab **Repay** |
| 2 | Review **Outstanding debt** and your **FnUSD** wallet balance |
| 3 | Enter **Repay FnUSD** amount (optional quick fills: **50%**, **Max**) |
| 4 | Submit **Repay Debt** |

| Effect | Detail |
|--------|--------|
| Debt | Decreases |
| Wallet **FnUSD** | Decreases |
| Collateral | Unchanged |
| Collateral ratio | Usually **increases** |

---

## Borrow vs repay — summary

| | Borrow | Repay |
|--|--------|-------|
| FnUSD in wallet | Goes **up** | Goes **down** |
| Debt | Goes **up** | Goes **down** |
| Typical motive | Liquidity / leverage | Safety / unwind path |
| Fee | Origination on new borrow | No extra fee in UI terms |

---

## Requirements snapshot

| Action | Typical requirement |
|--------|---------------------|
| Borrow | Ratio after borrow **≥** minimum operational ratio |
| Repay | Enough **FnUSD** in wallet to cover repayment amount |

---

## Optional: paying off before close

You can repay in full or in part on the **Repay** tab; **Close** also requires you to have enough **FnUSD** to settle remaining debt — see [Close a Trove](closing-a-trove.md).
