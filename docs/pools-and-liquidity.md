# Pools & liquidity

The **Pools** screen points to **external venues** where you can supply liquidity using **FnUSD** and other assets — for example **FnUSD / wzkLTC** or **FnUSD / USDC** on **Addax**.

---

## Relationship to Trove

| Activity | Where | Purpose |
|----------|--------|---------|
| Borrow FnUSD against wzkLTC | **Trove** | Collateralized debt |
| Earn fees on token pairs | **Pools** → external DEX | Liquidity provision — different product |

---

## What you typically see

| Row | Meaning |
|-----|---------|
| **Total LP TVL** | Aggregate liquidity metric (may be placeholder on test deployments) |
| **24h Volume** | Trading volume summary |
| **Your LP Value** | Your share if connected and tracked |

---

## Available pools table (conceptual)

Each row links out to the venue’s website.

| Pair | Venue | Notes |
|------|-------|-------|
| FnUSD / wzkLTC | Addax | Opens in new tab from app |
| FnUSD / USDC | Addax | Stable pairing |

APR and TVL in the app may show **0** until pools are live or wired to live stats.

---

## Before you LP

| Risk area | Plain note |
|-----------|------------|
| Impermanent loss | Pair exposure differs from holding Trove collateral alone |
| Smart contracts | External protocol terms apply |

---

## Navigation

Open **Pools** from the bottom navigation or follow links from the Dashboard **pending redistribution / pools** section when shown.
