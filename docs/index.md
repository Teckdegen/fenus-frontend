# FENUS documentation

Welcome to the user guide for **FENUS** — borrow **FnUSD** using **wzkLTC** as collateral through a single position called a **Trove**.

This documentation is written for anyone using the app. It focuses on **what to do in the interface**, not smart contracts or code.

---

## Who this is for

| Audience | What you will find |
|----------|-------------------|
| First-time users | How to connect, get test tokens, and open a Trove |
| Active borrowers | How to add/remove collateral, borrow more, repay, and close |
| Anyone managing risk | Plain-language explanation of collateral ratio and liquidation |

---

## Documentation map

Read in order from top to bottom, or jump to a topic.

| Section | Description |
|---------|-------------|
| [Getting started](getting-started/getting-started.md) | Wallet, app navigation, what each area is for |
| [Dashboard](dashboard-and-balances.md) | Home screen: balances, Trove summary, pools teaser |
| [Faucet](faucet.md) | Claim test wzkLTC (where available) |
| [What is a Trove?](trove/what-is-a-trove.md) | One-line mental model before you act |
| [Open a Trove](trove/opening-a-trove.md) | Deposit collateral and mint FnUSD |
| [Collateral: add & remove](trove/managing-collateral.md) | Increase or decrease wzkLTC in your Trove |
| [Borrow & repay FnUSD](trove/borrowing-and-repaying.md) | Increase debt or pay it down |
| [Close your Trove](trove/closing-a-trove.md) | Repay everything and withdraw collateral |
| [Collateral ratio & safety](trove/collateral-ratio-explained.md) | CR, liquidation price, and UI labels |
| [Pools](pools-and-liquidity.md) | External liquidity (e.g. Addax) |
| [Protocol parameters](protocol-parameters.md) | Fees and thresholds in one place |

---

## Quick glossary

| Term | Meaning |
|------|---------|
| **Trove** | Your personal loan position: collateral locked + FnUSD owed |
| **wzkLTC** | Wrapped zkLitecoin — the ERC-20 collateral token you deposit |
| **FnUSD** | Stablecoin you borrow and must repay to unwind |
| **Collateral ratio (CR)** | Value of your collateral divided by your debt — **FENUS uses 135%** as what you must maintain; higher is safer |
| **Liquidation** | If CR falls too low, the position can be cleared by the protocol |
| **Redistribution / Default Pool** | After liquidations, Trove holders can **earn fees** from that activity — see [Dashboard](dashboard-and-balances.md#pending-redistribution-gains) |

---

## Need something technical?

These docs intentionally skip contract addresses, ABIs, and deployment detail. Use your separate developer or audit materials for that layer.
