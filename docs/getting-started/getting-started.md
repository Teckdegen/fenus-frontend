# Getting started

This page explains how you enter the app and where each main screen lives.

---

## Before you begin

| Requirement | Notes |
|-------------|--------|
| Compatible wallet | Use a wallet supported by the app’s **Connect** flow (e.g. typical browser wallets) |
| Correct network | Switch your wallet to the network the app expects — transactions fail on the wrong chain |
| Tokens | **WzkLTC** for collateral; **FnUSD** when repaying or closing (you receive FnUSD when you borrow) |

---

## Connect your wallet

| Step | Action |
|------|--------|
| 1 | Open the FENUS app and choose **Connect** (or **Connect Wallet** on screens that ask for it) |
| 2 | Approve the connection in your wallet extension or mobile app |
| 3 | If prompted, switch network to the one required by FENUS |

After connecting, your shortened address appears in the header. You can open account details from there depending on your wallet integration.

---

## Main navigation

The app groups features into a small set of sections:

| Route / tab | Purpose |
|-------------|---------|
| **Home** (`/app`) | Dashboard: wallet balances, Trove snapshot, links to manage |
| **Faucet** (`/app/faucet`) | Claim test **WzkLTC** on environments where the faucet is enabled |
| **Trove** (`/app/trove`) | Open and manage your Trove (deposit, borrow, repay, close) |
| **Pools** (`/app/pools`) | Links and summaries for liquidity venues (e.g. Addax) |

---

## Typical first-time flow

| Order | Where | What you do |
|-------|--------|-------------|
| 1 | Faucet | Claim **WzkLTC** if you start with zero collateral |
| 2 | Trove → **Open** | Deposit **WzkLTC**, choose how much **FnUSD** to mint |
| 3 | Dashboard | Monitor collateral, debt, ratio, and liquidation price |

---

## Transactions and confirmations

| Stage | What you see |
|-------|----------------|
| Approving | The app may ask you to **approve** **WzkLTC** spending once before deposits |
| Pending | Wait for block confirmation — duration depends on the chain |
| Success | A confirmation message and often a link to a block explorer |

If something fails, read the error shown in the app; common causes are insufficient balance, ratio too low, or wrong network.
