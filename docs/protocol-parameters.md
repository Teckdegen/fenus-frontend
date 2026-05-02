# Protocol parameters

Single-page reference for the numbers repeated across the Trove UI unless your deployment differs. **FENUS uses a 135% collateral ratio** as the standard users maintain.

---

## Money & collateral

| Parameter | Value | Notes |
|-----------|-------|-------|
| Collateral asset | **wzkLTC** | Wrapped zkLitecoin (ERC-20 collateral) |
| Debt asset | **FnUSD** | Borrowed stablecoin |
| Troves per wallet | **1** | Open a second Trove from same address is not supported in UI |

---

## Fees & carrying cost

| Parameter | Value | Notes |
|-----------|-------|-------|
| Interest | **0% APR** | No ongoing interest in app copy |
| Origination fee | **0.50%** | Applied on borrowed FnUSD at **open** and when **borrowing more**; described as treasury-bound |

---

## Risk thresholds

| Parameter | Value | Role |
|-----------|-------|------|
| **Collateral ratio** | **135%** | Stay **at or above 135%**. Opening, borrowing more, and removing collateral must keep your Trove here; falling below puts you at liquidation risk. |

---

## Display & tooling

| Item | Detail |
|------|--------|
| Price source | **LTC/USD** oracle strip on Trove screen |
| Block explorer | Linked from successful transactions (deployment-specific URL in app) |

---

## Liquidations and Trove holders

When other Troves are liquidated, **remaining Trove holders can earn fees** from that process. The Dashboard lines **Pending Coll. Gain**, **Pending Debt Absorbed**, **Default Pool Coll.**, and **Default Pool Debt** are where that activity surfaces. More plain-language detail is in [Dashboard — Pending redistribution gains](dashboard-and-balances.md#pending-redistribution-gains).

---

## Disclaimer

Deployments on testnets vs mainnets can differ. If product or legal terms are published separately, those documents govern in case of conflict with this summary.
