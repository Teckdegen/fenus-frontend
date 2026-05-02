# Managing collateral (Add & Remove)

Collateral is your **wzkLTC** locked in the Trove. Increasing it improves your **collateral ratio**; decreasing it frees wzkLTC but can make the position riskier.

---

## Add collateral

Use when you want **extra safety** or room to borrow more later **without** borrowing immediately.

| Step | Action |
|------|--------|
| 1 | **Trove** → tab **Add** |
| 2 | Enter **Add wzkLTC** amount |
| 3 | Confirm preview (ratio should improve if you have debt) |
| 4 | Approve **wzkLTC** if prompted |
| 5 | Submit **Add Collateral** |

| Effect | Detail |
|--------|--------|
| Wallet **wzkLTC** | Decreases |
| Trove collateral | Increases |
| Debt | Unchanged |
| Collateral ratio | Usually **increases** |

---

## Remove collateral

Use when you want **wzkLTC back** in your wallet while keeping the Trove open.

| Step | Action |
|------|--------|
| 1 | **Trove** → tab **Remove** |
| 2 | Enter **Remove wzkLTC** amount |
| 3 | Check preview — ratio must stay **valid** |
| 4 | Submit **Remove Collateral** |

| Effect | Detail |
|--------|--------|
| Trove collateral | Decreases |
| Wallet **wzkLTC** | Increases |
| Debt | Unchanged |
| Collateral ratio | Usually **decreases** |

---

## Comparison table

| | Add | Remove |
|--|-----|--------|
| Goal | Safety / capacity | Free wzkLTC |
| Risk impact | Lower ratio risk | Higher ratio risk |
| Needs FnUSD | No | No |
| Blocked when | Insufficient wallet balance | Withdrawal would push ratio **below** minimum |

---

## Why removal can fail

| Message / behavior | Meaning |
|--------------------|---------|
| Ratio below threshold | Protocol rejects withdrawals that breach **minimum collateral ratio** |
| Amount too large | Reduce removal or repay debt first |

See [Collateral ratio explained](collateral-ratio-explained.md) for numbers used in the app.
