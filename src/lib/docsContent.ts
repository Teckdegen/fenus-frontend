// All documentation content extracted from docs/ directory

export interface DocSection {
  id: string;
  title: string;
  group: string;
  content: string;
}

export const docsGroups = [
  "Introduction",
  "Getting Started",
  "Using the App",
  "Trove",
  "Beyond Borrowing",
] as const;

export const docsSections: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    group: "Introduction",
    content: `Welcome to the user guide for **FENUS** borrow **FnUSD** using **wzkLTC** as collateral through a single position called a **Trove**.

This documentation is written for anyone using the app. It focuses on **what to do in the interface**, not smart contracts or code.

---

## Who this is for

| Audience | What you will find |
|---|---|
| First-time users | How to connect, get test tokens, and open a Trove |
| Active borrowers | How to add/remove collateral, borrow more, repay, and close |
| Anyone managing risk | Plain-language explanation of collateral ratio and liquidation |

---

## Documentation map

Read in order from top to bottom, or jump to a topic.

| Section | Description |
|---|---|
| Getting started | Wallet, app navigation, what each area is for |
| Dashboard | Home screen: balances, Trove summary, pools teaser |
| Faucet | Claim test wzkLTC (where available) |
| What is a Trove? | One-line mental model before you act |
| Open a Trove | Deposit collateral and mint FnUSD |
| Collateral: add & remove | Increase or decrease wzkLTC in your Trove |
| Borrow & repay FnUSD | Increase debt or pay it down |
| Transfer your Trove | Transfer your entire position to another address |
| Close your Trove | Repay everything and withdraw collateral |
| Collateral ratio & safety | CR, liquidation price, and UI labels |
| Pools | External liquidity (e.g. Addax) |
| Protocol parameters | Fees and thresholds in one place |

---

## Quick glossary

| Term | Meaning |
|---|---|
| **Trove** | Your personal loan position: collateral locked + FnUSD owed. Represented as an NFT you own |
| **Trove NFT** | The ERC721 token representing your Trove position. Transferring this NFT transfers your entire position |
| **wzkLTC** | Wrapped zkLitecoin the ERC20 collateral token you deposit |
| **FnUSD** | Stablecoin you borrow and must repay to unwind |
| **Collateral ratio (CR)** | Value of your collateral divided by your debt **FENUS uses 135%** as what you must maintain; higher is safer |
| **Liquidation** | If CR falls too low, the position can be cleared by the protocol |
| **Redistribution / Default Pool** | After liquidations, Trove holders can **earn fees** from that activity |

---

## Need something technical?

These docs intentionally skip contract addresses, ABIs, and deployment detail. Use your separate developer or audit materials for that layer.`,
  },
  {
    id: "getting-started",
    title: "Getting Started",
    group: "Getting Started",
    content: `This page explains how you enter the app, what you need, and where each main screen lives.

---

## Before you begin

| Requirement | Notes |
|---|---|
| Compatible wallet | Use a wallet supported by the app's **Connect** flow (e.g. typical browser wallets) |
| Correct network | Switch your wallet to the network the app expects transactions fail on the wrong chain |
| Tokens | **wzkLTC** for collateral; **FnUSD** when repaying or closing (you receive FnUSD when you borrow) |

---

## Connect your wallet

| Step | Action |
|---|---|
| 1 | Open the FENUS app and choose **Connect** (or **Connect Wallet** on screens that ask for it) |
| 2 | Approve the connection in your wallet extension or mobile app |
| 3 | If prompted, switch network to the one required by FENUS |

After connecting, your shortened address appears in the header. You can open account details from there depending on your wallet integration.

---

## Main navigation

The app groups features into a small set of sections:

| Route / tab | Purpose |
|---|---|
| **Home** (\`/app\`) | Dashboard: wallet balances, Trove snapshot, links to manage |
| **Faucet** (\`/app/faucet\`) | Claim test **wzkLTC** on environments where the faucet is enabled |
| **Trove** (\`/app/trove\`) | Open and manage your Trove (deposit, borrow, repay, close) |
| **Transfer** (\`/app/transfer\`) | Transfer your entire Trove position (debt + collateral) to another address |
| **Pools** (\`/app/pools\`) | Links and summaries for liquidity venues (e.g. Addax) |

---

## Typical first-time flow

| Order | Where | What you do |
|---|---|---|
| 1 | Faucet | Claim **wzkLTC** if you start with zero collateral |
| 2 | Trove → **Open** | Deposit **wzkLTC**, choose how much **FnUSD** to mint |
| 3 | Dashboard | Monitor collateral, debt, ratio, and liquidation price |

Tip: If you have a **very small** amount of wzkLTC, the app will show it with extra decimals instead of rounding it down to \`0.00\`.

---

## Transactions and confirmations

| Stage | What you see |
|---|---|
| Approving | The app may ask you to **approve** **wzkLTC** spending once before deposits |
| Pending | Wait for block confirmation duration depends on the chain |
| Success | A confirmation message and often a link to a block explorer |

If something fails, read the error shown in the app; common causes are insufficient balance, ratio too low, or wrong network.`,
  },
  {
    id: "dashboard",
    title: "Dashboard & Balances",
    group: "Using the App",
    content: `The **Dashboard** is the home screen after you open the app (\`/app\`). It answers three questions fast:

- What do I hold?
- What is my Trove right now?
- What should I do next?

---

## Wallet overview strip

When your wallet is connected, you'll see three headline numbers:

| Field | Meaning |
|---|---|
| **wzkLTC balance** | wzkLTC tokens in your wallet (not yet deposited into a Trove) |
| **FnUSD balance** | Stablecoin in your wallet used to repay debt or close |
| **LTC price** | Oracle reference price shown by the app (for mental math and ratios) |

### Precision (important)

FENUS shows **small non-zero balances** with extra precision when needed. So if you have "a little bit" of wzkLTC, it won't get rounded down to \`0.00\`.

---

## Empty collateral hint

If you are connected and your **wzkLTC wallet balance is truly zero**, the app may show a reminder to visit the **Faucet** so you can obtain test collateral before opening a Trove.

| Situation | Suggested action |
|---|---|
| No wzkLTC | Use **Faucet** (if enabled on your deployment) |
| Have wzkLTC | Go to **Trove → Open** |

---

## Your Trove card

If you already have an active Trove, the Dashboard summarizes it:

| Row | Meaning |
|---|---|
| **Collateral** | How much **wzkLTC** is locked in your Trove |
| **Debt** | How much **FnUSD** you owe (including fees already baked into protocol accounting where applicable) |
| **Collateral ratio** | Collateral value ÷ debt keep **≥ 135%** |
| **Liquidation price** | Approximate **wzkLTC** price at which your position becomes unsafe |

Use **Manage Trove** to jump to the Trove screen for deposits, withdrawals, borrow, repay, or close.

---

## No Trove yet

| State | What you see |
|---|---|
| Wallet disconnected | Prompt to connect |
| Connected, no Trove | Short explanation and **Open Trove** |

---

## Pending redistribution gains

When someone else's Trove is **liquidated**, people who **still have an active Trove** can **earn fees** from that activity. Those flows show up over time through the protocol's accounting.

The **Dashboard** surfaces four related lines:

| Label | What it means |
|---|---|
| **Pending Coll. Gain** | Collateral-side fees/rewards tied to liquidations |
| **Pending Debt Absorbed** | Debt-side movements from the same mechanics |
| **Default Pool Coll.** | wzkLTC in protocol accounting linked to liquidation flows |
| **Default Pool Debt** | FnUSD side of that pool |

### Takeaways

| Idea | Detail |
|---|---|
| Who gets fees? | Usually people with an active Trove |
| When do you see non-zero numbers? | After liquidations occur |
| Does this replace managing your ratio? | **No.** Extra fees don't remove liquidation risk |

---

## Quick troubleshooting

| Symptom | What to check |
|---|---|
| Balance looks wrong | Make sure your wallet is on the **correct network**, then refresh once |
| Shows \`0\` but you're sure you have funds | Confirm the token is **wzkLTC** and that you're viewing the same wallet address |`,
  },
  {
    id: "faucet",
    title: "Faucet",
    group: "Using the App",
    content: `The **Faucet** gives you **test wzkLTC** so you can try opening and managing a Trove without bringing your own collateral.

Availability depends on deployment some production environments may hide or disable it.

---

## Who needs it

| User | Reason |
|---|---|
| New tester | Starts with zero **wzkLTC** |
| Demo | Quickly funds a wallet for screenshots or trials |

---

## Before claiming

| Requirement | Detail |
|---|---|
| Wallet connected | Same as elsewhere in the app |
| Cooldown | Commonly **48 hours** between claims per wallet (implementation-specific) |

---

## How to claim

| Step | Action |
|---|---|
| 1 | Go to **Faucet** in the app navigation |
| 2 | Press the claim button when enabled |
| 3 | Wait for confirmation |

Typical payout on test setups: **1,000 wzkLTC** per successful claim (confirm on your deployment).

---

## After claiming

| Next step | Where |
|---|---|
| Open a Trove | **Trove → Open** |
| Check balance | **Dashboard** wallet strip |

---

## Troubleshooting

| Issue | What to check |
|---|---|
| Button disabled | Cooldown timer wait until it shows ready |
| Request failed | Network connection; whether faucet backend is reachable |
| Wrong network | Switch to the chain the app expects |`,
  },
  {
    id: "what-is-a-trove",
    title: "What is a Trove?",
    group: "Trove",
    content: `A **Trove** is **your loan account** inside FENUS, represented as an **NFT** (Non-Fungible Token) that you own in your wallet.

---

## One sentence

You **lock wzkLTC** as collateral and **mint FnUSD** as debt then you manage that position until you **repay** and optionally **close**.

---

## Trove as an NFT

Your Trove is not just data in a contract it's an **ERC721 NFT** that you own:

| Feature | Benefit |
|---|---|
| **Visible in wallet** | See your Trove in MetaMask, OpenSea, and other NFT platforms |
| **Transferable** | You can transfer your entire position (debt + collateral) to another address |
| **Lower gas costs** | NFT-based storage is 12-25% cheaper than traditional methods |
| **Composable** | Use your Trove NFT in other DeFi protocols |

**Important:** Transferring the NFT = transferring your entire debt position!

---

## One Trove per wallet

| Rule | Implication |
|---|---|
| Single active Trove per address | You cannot open a second Trove from the same wallet |
| Already open | Use **Add**, **Remove**, **Borrow**, **Repay**, **Transfer**, **Close** not **Open** again |

---

## What sits inside the Trove

| Side | Asset | Direction |
|---|---|---|
| Collateral | **wzkLTC** | You deposit; it stays locked until you withdraw or close |
| Debt | **FnUSD** | You owe the protocol; increases when you borrow, decreases when you repay |

---

## Where you manage it

All Trove actions live under **\`/app/trove\`** with tabs:

| Tab | Plain meaning |
|---|---|
| **Open** | Create the Trove (first time only) mints your NFT |
| **Add** | Deposit more collateral |
| **Remove** | Withdraw collateral (if safe) |
| **Borrow** | Mint more FnUSD |
| **Repay** | Burn FnUSD against your debt |
| **Transfer** | Transfer your entire position to another address |
| **Close** | Zero debt, retrieve collateral, and burn your NFT |`,
  },
  {
    id: "opening-a-trove",
    title: "Open a Trove",
    group: "Trove",
    content: `**Open** creates your Trove: you deposit **wzkLTC** and choose how much **FnUSD** to borrow. This also **mints an NFT** representing your position.

---

## What happens when you open

When you open a Trove, the protocol:

1. **Locks your wzkLTC** as collateral
2. **Mints FnUSD** to your wallet
3. **Mints a Trove NFT** to your wallet (ERC721 token)
4. **Records your debt** on-chain

The NFT represents your entire position and will appear in your wallet (MetaMask, OpenSea, etc.).

---

## Prerequisites

| Check | Requirement |
|---|---|
| Wallet | Connected |
| Collateral | Enough **wzkLTC** in your wallet |
| Existing Trove | None only one Trove per wallet |
| Ratio | Opening position must meet the protocol **minimum collateral ratio** |

---

## Fields on the Open tab

| Field | What you enter |
|---|---|
| **Deposit wzkLTC** | Amount of wzkLTC collateral to lock |
| **Borrow FnUSD** | How much FnUSD you want to receive |

---

## What the preview shows

| Line | Meaning |
|---|---|
| **Collateral ratio** | Safety of the position after open must stay at or above the minimum |
| **Liquidation price** | Rough wzkLTC price level where liquidation becomes relevant |
| **Origination fee** | One-time fee on the borrowed amount at open |
| **Total debt at open** | Borrow amount plus origination fee |

---

## Fees at open

| Item | Typical value |
|---|---|
| Origination fee | **0.5%** of the borrowed FnUSD |
| Interest | **0% APR** no ongoing interest shown in app |

---

## Steps to open

| Step | Action |
|---|---|
| 1 | Go to **Trove** → tab **Open** |
| 2 | Enter collateral and borrow amounts |
| 3 | Confirm preview fix warnings if ratio is too low |
| 4 | Approve **wzkLTC** if the app asks (first time) |
| 5 | Submit **Open Trove** and confirm in wallet |

---

## Common blocks

| Symptom | Cause |
|---|---|
| "Already have an open Trove" | Use manage tabs instead of Open |
| Ratio too low | Increase collateral or reduce borrow until preview passes |
| Transaction rejected | Slippage/network/gas retry or check wallet |

---

## After opening

| Where | What to verify |
|---|---|
| **Dashboard** | Collateral, debt, ratio |
| Wallet | **FnUSD** balance increased |
| Wallet NFTs | **Trove NFT** appears (check MetaMask NFT tab) |

Your Trove NFT will show:
- Token ID (e.g., #42)
- Current debt and collateral
- You can view it on NFT marketplaces

**Remember:** This NFT represents your entire position. If you transfer it, you transfer your debt!`,
  },
  {
    id: "managing-collateral",
    title: "Managing Collateral",
    group: "Trove",
    content: `Collateral is your **wzkLTC** locked in the Trove. Increasing it improves your **collateral ratio**; decreasing it frees wzkLTC but can make the position riskier.

---

## Add collateral

Use when you want **extra safety** or room to borrow more later **without** borrowing immediately.

| Step | Action |
|---|---|
| 1 | **Trove** → tab **Add** |
| 2 | Enter **Add wzkLTC** amount |
| 3 | Confirm preview (ratio should improve if you have debt) |
| 4 | Approve **wzkLTC** if prompted |
| 5 | Submit **Add Collateral** |

| Effect | Detail |
|---|---|
| Wallet **wzkLTC** | Decreases |
| Trove collateral | Increases |
| Debt | Unchanged |
| Collateral ratio | Usually **increases** |

---

## Remove collateral

Use when you want **wzkLTC back** in your wallet while keeping the Trove open.

| Step | Action |
|---|---|
| 1 | **Trove** → tab **Remove** |
| 2 | Enter **Remove wzkLTC** amount |
| 3 | Check preview ratio must stay **valid** |
| 4 | Submit **Remove Collateral** |

| Effect | Detail |
|---|---|
| Trove collateral | Decreases |
| Wallet **wzkLTC** | Increases |
| Debt | Unchanged |
| Collateral ratio | Usually **decreases** |

---

## Comparison table

| | Add | Remove |
|---|---|---|
| Goal | Safety / capacity | Free wzkLTC |
| Risk impact | Lower ratio risk | Higher ratio risk |
| Needs FnUSD | No | No |
| Blocked when | Insufficient wallet balance | Withdrawal would push ratio below minimum |

---

## Why removal can fail

| Message / behavior | Meaning |
|---|---|
| Ratio below threshold | Protocol rejects withdrawals that breach minimum collateral ratio |
| Amount too large | Reduce removal or repay debt first |`,
  },
  {
    id: "borrowing-and-repaying",
    title: "Borrow & Repay",
    group: "Trove",
    content: `**Borrow** mints more **FnUSD** against existing collateral. **Repay** sends **FnUSD** back to reduce debt.

---

## Borrow (Borrow More)

| Step | Action |
|---|---|
| 1 | **Trove** → tab **Borrow** |
| 2 | Enter **Borrow FnUSD** amount |
| 3 | Confirm preview ratio must remain **above** minimum |
| 4 | Submit **Borrow More** |

| Effect | Detail |
|---|---|
| Debt | Increases **including** new origination fee on the added borrow |
| Wallet **FnUSD** | Increases |
| Collateral | Unchanged |
| Collateral ratio | Usually **decreases** |

### Fees when borrowing more

| Fee | Applies |
|---|---|
| **Origination fee 0.5%** | On the **new** borrowed amount (same idea as opening) |

---

## Repay

| Step | Action |
|---|---|
| 1 | **Trove** → tab **Repay** |
| 2 | Review **Outstanding debt** and your **FnUSD** wallet balance |
| 3 | Enter **Repay FnUSD** amount (optional quick fills: **50%**, **Max**) |
| 4 | Submit **Repay Debt** |

| Effect | Detail |
|---|---|
| Debt | Decreases |
| Wallet **FnUSD** | Decreases |
| Collateral | Unchanged |
| Collateral ratio | Usually **increases** |

---

## Borrow vs repay summary

| | Borrow | Repay |
|---|---|---|
| FnUSD in wallet | Goes **up** | Goes **down** |
| Debt | Goes **up** | Goes **down** |
| Typical motive | Liquidity / leverage | Safety / unwind path |
| Fee | Origination on new borrow | No extra fee |

---

## Requirements snapshot

| Action | Typical requirement |
|---|---|
| Borrow | Ratio after borrow **≥** minimum operational ratio |
| Repay | Enough **FnUSD** in wallet to cover repayment amount |

---

## Optional: paying off before close

You can repay in full or in part on the **Repay** tab; **Close** also requires you to have enough **FnUSD** to settle remaining debt.`,
  },
  {
    id: "transferring-your-trove",
    title: "Transfer Your Trove",
    group: "Trove",
    content: `## What is a Trove NFT?

Your Trove is represented as an **NFT (Non-Fungible Token)** that you own in your wallet. This NFT is more than just a collectible it represents your entire debt position including:

- All your collateral (wzkLTC)
- All your debt (FnUSD)
- All future obligations and rewards
- Full control of the position

## Why NFTs?

Using NFTs for Troves provides several benefits:

1. **Lower gas costs** 12 to 25% cheaper than traditional storage
2. **Visible in your wallet** See your Trove in MetaMask, OpenSea, etc.
3. **Transferable** You can transfer your entire position to another address
4. **Composable** Use your Trove NFT in other DeFi protocols

## How to Transfer Your Trove

### Step 1: Go to the Transfer Tab

1. Navigate to the **Trove** page in the app
2. Click on the **Transfer** tab
3. You'll see your NFT information:
   Token ID (e.g., #42)
   Current debt amount
   Current collateral amount

### Step 2: Enter Recipient Address

1. Enter the Ethereum address of the person you want to transfer to
2. The address must be valid (starts with 0x)
3. The recipient **cannot** already have a Trove (they must close it first)
4. You **cannot** transfer to yourself

### Step 3: Review the Warning

**⚠️ IMPORTANT:** Transferring your Trove NFT means transferring **EVERYTHING**:

- ✅ All collateral goes to the recipient
- ✅ All debt becomes their responsibility
- ✅ All future obligations transfer
- ✅ All future redistribution rewards transfer
- ❌ You lose all control of the position

**This action cannot be undone!**

### Step 4: Confirm Transfer

1. Click **Transfer Trove**
2. Confirm the transaction in your wallet
3. Wait for blockchain confirmation
4. The recipient now owns your entire position

## After Transfer

### For the Sender (You)

- You no longer own the Trove NFT
- You have no debt obligations
- You have no collateral in the system
- You can open a new Trove if you want

### For the Recipient

- They now own the Trove NFT
- They are responsible for all debt
- They control all collateral
- They can manage the position (add/remove collateral, borrow, repay, close)
- They receive all future redistribution rewards

## Use Cases

### 1. Selling Your Position

If you have a healthy Trove with good collateral ratio, you might sell it to someone else. Alice transfers her position (10 wzkLTC collateral, 1,000 FnUSD debt at 250% ratio) to Bob, who then manages it.

### 2. Gifting

You can gift a Trove to family or friends great for teaching DeFi with real assets.

### 3. Portfolio Management

Consolidate positions across multiple wallets by transferring all Troves to your main wallet.

## Safety Features

The transfer system includes several safety checks:

- ✅ **Address validation** Must be a valid Ethereum address
- ✅ **No self transfers** Cannot transfer to yourself
- ✅ **Recipient check** Recipient cannot already have a Trove
- ✅ **Safe transfer** Uses ERC721 standard \`safeTransferFrom\`
- ✅ **Clear warnings** UI shows exactly what's being transferred

## Common Questions

**Can I cancel a transfer?** No. Once confirmed on the blockchain, the transfer is permanent.

**Can I transfer part of my Trove?** No. The NFT represents the entire position everything or nothing.

**What happens to my debt?** The debt transfers to the recipient. You are no longer responsible for it.

**Can I get my Trove back?** Only if the recipient transfers it back to you.

**What if I transfer to the wrong address?** The transfer is permanent. Double-check the address before confirming!

## Viewing Your NFT

Your Trove NFT will appear in MetaMask (NFTs tab), OpenSea, any NFT marketplace supporting ERC721, and block explorers.

## Best Practices

1. **Double check addresses** Always verify the recipient address
2. **Coordinate with recipient** Make sure they understand they're receiving debt
3. **Check their wallet** Ensure they don't already have a Trove
4. **Document the transfer** Keep records for tax purposes
5. **Test with small amounts first** If possible, practice on testnet`,
  },
  {
    id: "closing-a-trove",
    title: "Close a Trove",
    group: "Trove",
    content: `**Close** finishes your position: you **repay all debt**, **withdraw your collateral**, and **burn your Trove NFT** in one flow.

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
|---|---|
| FnUSD in wallet | You need **FnUSD** at least equal to **outstanding debt** |
| Trove exists | Closing only applies when you already have an open Trove |
| NFT ownership | You must own the Trove NFT (if you transferred it, you can't close) |

---

## What the Close tab summarizes

| Section | Meaning |
|---|---|
| **What you repay** | Outstanding debt in **FnUSD** (total to repay) |
| **What you receive** | **wzkLTC** collateral returned to you |

---

## Steps to close

| Step | Action |
|---|---|
| 1 | **Trove** → tab **Close** |
| 2 | Confirm you hold enough **FnUSD** for the stated debt |
| 3 | Submit **Close Trove** |
| 4 | Confirm in wallet |

---

## After closing

| Item | Expected result |
|---|---|
| Trove | Position cleared no active Trove until you **Open** again |
| Wallet | **FnUSD** reduced by debt paid; **wzkLTC** increased by returned collateral |
| NFT | **Trove NFT burned** it will disappear from your wallet and NFT marketplaces |

---

## Important: Debt includes redistribution

Your **outstanding debt** shown in the Close tab includes:

- Your original borrowed amount
- Any origination fees
- **Redistribution debt** from liquidated troves

This is why the debt amount might be higher than what you originally borrowed.

---

## If close seems impossible

| Issue | What to do |
|---|---|
| Not enough FnUSD | **Repay** partially on **Repay** tab, or acquire **FnUSD** |
| Transaction error | Verify network, balance, and try again |

---

## Close vs repay quick distinction

| | Repay | Close |
|---|---|---|
| Debt | Can be partial | Intended to finish the Trove |
| Collateral | Stays locked until you also withdraw separately | Returned as part of closing |
| Use when | Adjusting risk | Exiting completely |`,
  },
  {
    id: "collateral-ratio",
    title: "Collateral Ratio Explained",
    group: "Trove",
    content: `Your **collateral ratio** is the main safety dial for a Trove. The app shows it as a **percentage**.

---

## Plain definition

| Concept | Meaning |
|---|---|
| **Collateral ratio** | (Value of your **wzkLTC** in USD) ÷ (Your **FnUSD** debt) |
| Higher ratio | Safer more collateral per dollar borrowed |
| Lower ratio | Riskier closer to liquidation |

The app labels regions such as **Safe**, **Moderate**, **Risky**, and **Below minimum** based on ratio bands.

---

## Key protocol numbers

**FENUS targets a 135% collateral ratio** that is the number to remember.

| Term | Value | Plain meaning |
|---|---|---|
| **Collateral ratio** | **135%** | Keep collateral value ÷ debt at or above 135%. Below it you face blocked actions and liquidation risk. |
| **Origination fee** | **0.5%** | On borrowed FnUSD |
| **Interest** | **0% APR** | No ongoing borrow rate |

---

## Liquidation price

| Field | Meaning |
|---|---|
| **Liquidation price** | Rough **wzkLTC** price at which your position approaches dangerous territory |

Use it alongside ratio: when market price falls toward that zone, consider **adding collateral** or **repaying**.

---

## Ratio bands (typical UI interpretation)

| Approximate ratio | Label | Practical takeaway |
|---|---|---|
| ≥ **200%** | Safe | Comfortable cushion |
| **160%–200%** | Moderate | Monitor markets |
| **135%–160%** | Risky | You meet the **135%** rule but have little spare room |
| **< 135%** | Below minimum | Operations that worsen ratio are blocked; liquidation risk |

---

## What moves ratio up or down

| Action | Typical ratio change |
|---|---|
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
|---|---|
| Price loading | Preview may show **Loading…** or N/A |
| Stale / down oracle | Transactions may fail try later |`,
  },
  {
    id: "pools",
    title: "Pools & Liquidity",
    group: "Beyond Borrowing",
    content: `The **Pools** screen points to **external venues** where you can supply liquidity using **FnUSD** and other assets for example **FnUSD / wzkLTC** or **FnUSD / USDC** on **Addax**.

---

## Relationship to Trove

| Activity | Where | Purpose |
|---|---|---|
| Borrow FnUSD against wzkLTC | **Trove** | Collateralized debt |
| Earn fees on token pairs | **Pools** → external DEX | Liquidity provision different product |

---

## What you typically see

| Row | Meaning |
|---|---|
| **Total LP TVL** | Aggregate liquidity metric |
| **24h Volume** | Trading volume summary |
| **Your LP Value** | Your share if connected and tracked |

---

## Available pools table

Each row links out to the venue's website.

| Pair | Venue | Notes |
|---|---|---|
| FnUSD / wzkLTC | Addax | Opens in new tab from app |
| FnUSD / USDC | Addax | Stable pairing |

APR and TVL in the app may show **0** until pools are live or wired to live stats.

---

## Before you LP

| Risk area | Plain note |
|---|---|
| Impermanent loss | Pair exposure differs from holding Trove collateral alone |
| Smart contracts | External protocol terms apply |

---

## Navigation

Open **Pools** from the bottom navigation or follow links from the Dashboard pending redistribution / pools section when shown.`,
  },
  {
    id: "protocol-parameters",
    title: "Protocol Parameters",
    group: "Beyond Borrowing",
    content: `Single-page reference for the numbers repeated across the Trove UI unless your deployment differs. **FENUS uses a 135% collateral ratio** as the standard users maintain.

---

## Money & collateral

| Parameter | Value | Notes |
|---|---|---|
| Collateral asset | **wzkLTC** | Wrapped zkLitecoin (ERC-20 collateral) |
| Debt asset | **FnUSD** | Borrowed stablecoin |
| Troves per wallet | **1** | Open a second Trove from same address is not supported |

---

## Fees & carrying cost

| Parameter | Value | Notes |
|---|---|---|
| Interest | **0% APR** | No ongoing interest |
| Origination fee | **0.50%** | Applied on borrowed FnUSD at **open** and when **borrowing more** |

---

## Risk thresholds

| Parameter | Value | Role |
|---|---|---|
| **Collateral ratio** | **135%** | Stay at or above 135%. Falling below puts you at liquidation risk. |

---

## Display & tooling

| Item | Detail |
|---|---|
| Price source | **LTC/USD** oracle strip on Trove screen |
| Block explorer | Linked from successful transactions |

---

## Liquidations and Trove holders

When other Troves are liquidated, **remaining Trove holders can earn fees** from that process. The Dashboard lines **Pending Coll. Gain**, **Pending Debt Absorbed**, **Default Pool Coll.**, and **Default Pool Debt** are where that activity surfaces.

---

## Disclaimer

Deployments on testnets vs mainnets can differ. If product or legal terms are published separately, those documents govern in case of conflict with this summary.`,
  },
];
