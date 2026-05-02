# What is a Trove?

A **Trove** is **your loan account** inside FENUS, represented as an **NFT** (Non-Fungible Token) that you own in your wallet.

---

## One sentence

You **lock wzkLTC** as collateral and **mint FnUSD** as debt - then you manage that position until you **repay** and optionally **close**.

---

## Trove as an NFT

Your Trove is not just data in a contract - it's an **ERC721 NFT** that you own:

| Feature | Benefit |
|---------|---------|
| **Visible in wallet** | See your Trove in MetaMask, OpenSea, and other NFT platforms |
| **Transferable** | You can transfer your entire position (debt + collateral) to another address |
| **Lower gas costs** | NFT-based storage is 12-25% cheaper than traditional methods |
| **Composable** | Use your Trove NFT in other DeFi protocols |

**Important:** Transferring the NFT = transferring your entire debt position! See [Transfer your Trove](transferring-your-trove.md) for details.

---

## One Trove per wallet

| Rule | Implication |
|------|----------------|
| Single active Trove per address | You cannot open a second Trove from the same wallet |
| Already open | Use **Add**, **Remove**, **Borrow**, **Repay**, **Transfer**, **Close** - not **Open** again |

---

## What sits inside the Trove

| Side | Asset | Direction |
|------|--------|-----------|
| Collateral | **wzkLTC** | You deposit; it stays locked until you withdraw or close |
| Debt | **FnUSD** | You owe the protocol; increases when you borrow, decreases when you repay |

---

## Where you manage it

All Trove actions live under **`/app/trove`** with tabs:

| Tab | Plain meaning |
|-----|----------------|
| **Open** | Create the Trove (first time only) - mints your NFT |
| **Add** | Deposit more collateral |
| **Remove** | Withdraw collateral (if safe) |
| **Borrow** | Mint more FnUSD |
| **Repay** | Burn FnUSD against your debt |
| **Transfer** | Transfer your entire position to another address |
| **Close** | Zero debt, retrieve collateral, and burn your NFT |

---

## Next pages

| Topic | Doc |
|-------|-----|
| First-time setup | [Opening a Trove](opening-a-trove.md) |
| Transferring positions | [Transfer your Trove](transferring-your-trove.md) |
| Risk concepts | [Collateral ratio explained](collateral-ratio-explained.md) |
