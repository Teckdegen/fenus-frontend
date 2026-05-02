# Collateral ratio (CR) explained

Your **collateral ratio** is the main safety dial for a Trove. The app shows it as a **percentage**.

---

## Plain definition

| Concept | Meaning |
|---------|---------|
| **Collateral ratio** | (Value of your **wzkLTC** in USD) ÷ (Your **FnUSD** debt) |
| Higher ratio | Safer — more collateral per dollar borrowed |
| Lower ratio | Riskier — closer to liquidation |

The app labels regions such as **Safe**, **Moderate**, **Risky**, and **Below minimum** based on ratio bands.

---

## Key protocol numbers

**FENUS targets a 135% collateral ratio** — that is the number to remember.

| Term | Value | Plain meaning |
|------|-------|----------------|
| **Collateral ratio** | **135%** | Keep collateral value ÷ debt **at or above 135%**. Opening, borrowing more, and removing collateral must respect this. Below it you face blocked actions and liquidation risk. |
| **Origination fee** | **0.5%** | On borrowed FnUSD |
| **Interest** | **0% APR** | No ongoing borrow rate in UI |

---

## Liquidation price

| Field | Meaning |
|-------|---------|
| **Liquidation price** | Rough **wzkLTC** price at which your position approaches dangerous territory |

Use it alongside ratio: when market price falls toward that zone, consider **adding collateral** or **repaying**.

---

## Ratio bands (typical UI interpretation)

| Approximate ratio | Label | Practical takeaway |
|-------------------|-------|---------------------|
| ≥ **200%** | Safe | Comfortable cushion |
| **160%–200%** | Moderate | Monitor markets |
| **135%–160%** | Risky | You meet the **135%** rule but have little spare room |
| **< 135%** | Below minimum | Operations that worsen ratio are blocked; liquidation risk |

Exact breakpoints follow the live UI coloring.

---

## What moves ratio up or down

| Action | Typical ratio change |
|--------|----------------------|
| Add collateral | **Up** |
| Remove collateral | **Down** |
| Borrow more | **Down** |
| Repay | **Up** |
| LTC price rises | **Up** |
| LTC price falls | **Down** |

---

## Oracle price

The Trove screen shows an **LTC/USD oracle** feed. Ratio and liquidation hints depend on that price updating.

| Situation | Effect |
|-----------|--------|
| Price loading | Preview may show **Loading…** or N/A |
| Stale / down oracle | Transactions may fail — try later |

This document stays non-technical; operators document feed sources separately.
