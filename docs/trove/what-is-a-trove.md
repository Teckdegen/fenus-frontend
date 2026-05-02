# What is a Trove?

A **Trove** is **your loan account** inside FENUS.

---

## One sentence

You **lock WzkLTC** as collateral and **mint FnUSD** as debt — then you manage that position until you **repay** and optionally **close**.

---

## One Trove per wallet

| Rule | Implication |
|------|----------------|
| Single active Trove per address | You cannot open a second Trove from the same wallet |
| Already open | Use **Add**, **Remove**, **Borrow**, **Repay**, **Close** — not **Open** again |

---

## What sits inside the Trove

| Side | Asset | Direction |
|------|--------|-----------|
| Collateral | **WzkLTC** | You deposit; it stays locked until you withdraw or close |
| Debt | **FnUSD** | You owe the protocol; increases when you borrow, decreases when you repay |

---

## Where you manage it

All Trove actions live under **`/app/trove`** with tabs:

| Tab | Plain meaning |
|-----|----------------|
| **Open** | Create the Trove (first time only) |
| **Add** | Deposit more collateral |
| **Remove** | Withdraw collateral (if safe) |
| **Borrow** | Mint more FnUSD |
| **Repay** | Burn FnUSD against your debt |
| **Close** | Zero debt and retrieve collateral |

---

## Next pages

| Topic | Doc |
|-------|-----|
| First-time setup | [Opening a Trove](opening-a-trove.md) |
| Risk concepts | [Collateral ratio explained](collateral-ratio-explained.md) |
