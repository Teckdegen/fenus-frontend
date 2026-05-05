export const post = {
  slug: "complete-guide-to-fenus",
  title: "The Complete Guide to FENUS: How to Borrow Against Your zkLTC Without Selling",
  date: "2026-05-05",
  readTime: "12 min read",
  tags: ["Guide", "FENUS", "Trove", "FnUSD", "LitVM"],
  excerpt:
    "Everything you need to know about FENUS. How it works, how to open a Trove, how much to borrow, what to do with FnUSD, and why borrowing against your holdings beats selling every time.",
  coverImage:
    "https://www.image2url.com/r2/default/images/1777986038668-dc5c3fae-0569-406d-8dc6-9a2993f4f24d.png",
  content: `You have zkLTC. You need liquidity. Your options used to be simple and bad: sell your zkLTC and lose your position, or hold it and stay illiquid. FENUS is a third option. Deposit your zkLTC, borrow FnUSD against it, keep your exposure, and use the liquidity however you want. When you are ready, repay the debt and get your zkLTC back. No selling. No taxable event. No giving up your upside.

This guide covers everything. How FENUS works, how to open a Trove step by step, how much debt to take, what to do with FnUSD once you have it, and why this approach beats selling in almost every situation.

FENUS is a Collateralized Debt Position protocol built on LitVM, the first ZK rollup on Litecoin. You deposit zkLTC as collateral and mint FnUSD, a decentralized stablecoin pegged to $1. The FnUSD you mint is your debt. The zkLTC you deposit is locked until you repay. The protocol is governed entirely by smart contracts. There is no company, no credit check, no application, and no one who can freeze your funds or block your transaction.

The core mechanic is overcollateralization. For every $1 of FnUSD you mint, you need at least $1.35 worth of zkLTC locked as collateral. This buffer protects the system. If zkLTC prices fall and your collateral ratio drops below 130%, your position gets liquidated automatically. The liquidation bot runs on every block, watching every Trove, and closes undercollateralized positions before the system can become insolvent. This is not a threat. It is the mechanism that keeps FnUSD worth $1.

Your position in FENUS is called a Trove. Each wallet can have one Trove. When you open a Trove, you deposit zkLTC and specify how much FnUSD you want to mint. The protocol calculates your collateral ratio, checks that it meets the minimum, and mints FnUSD directly to your wallet. Your Trove is represented by an NFT, which means your entire position is a transferable on-chain asset. You can sell the Trove NFT to someone else and they inherit both the collateral and the debt.

There is a one-time origination fee of 0.5% on every borrow. If you mint 1,000 FnUSD, you pay 5 FnUSD as a fee and receive 995 FnUSD. Your debt is 995 FnUSD. There is no ongoing interest rate. You pay once when you borrow and nothing after that. This is fundamentally different from traditional lending where interest compounds over time and erodes your position.

To get started, you need zkLTC in your wallet. zkLTC is the native representation of Litecoin on LitVM. You get it by bridging LTC to LitVM through the official bridge. Once you have zkLTC, go to fenus.xyz, connect your wallet, and navigate to the Trove page. If you do not have zkLTC yet, the faucet on the app gives you test zkLTC to try the protocol before committing real funds.

On the Trove page, select the Open tab. Enter the amount of zkLTC you want to deposit. The system will automatically suggest a borrow amount at 150% collateral ratio, which gives you a comfortable buffer above the 135% minimum. You can edit this number up or down. Review the collateral ratio, the liquidation price, and the origination fee. When everything looks right, click Open Trove. Your wallet will ask you to approve the zkLTC spend first, then confirm the transaction. Once confirmed, FnUSD lands in your wallet and your Trove is live.

The collateral ratio is the most important number to understand. It is the value of your collateral divided by your debt, expressed as a percentage. If you deposit $200 worth of zkLTC and borrow 100 FnUSD, your ratio is 200%. The higher your ratio, the safer your position. The lower it goes, the closer you are to liquidation. The minimum to open or adjust a Trove is 135%. The liquidation threshold is 130%. If your ratio hits 130%, the bot liquidates you.

How much should you borrow? The answer depends on your risk tolerance and your view on zkLTC price. A conservative approach is to borrow at 200% or higher. At 200%, the price of zkLTC would need to fall by 35% before you hit the liquidation threshold. A moderate approach is 150% to 175%. At 150%, a 13% price drop puts you at the liquidation line. An aggressive approach is 135% to 145%, which gives you very little buffer and requires active monitoring. For most users, 175% to 200% is the right range. It gives you meaningful liquidity while keeping your position safe through normal market volatility.

You can manage your Trove at any time. The Add tab lets you deposit more zkLTC to increase your ratio. The Remove tab lets you withdraw zkLTC if your ratio is high enough. The Borrow tab lets you mint more FnUSD against your existing collateral. The Repay tab lets you pay down your debt. The Close tab lets you repay everything and get all your zkLTC back. Every operation except repaying and closing requires the oracle to be live, so if the price feed is temporarily unavailable, wait a few minutes and try again.

Now the most important question: why borrow instead of sell?

When you sell zkLTC, three things happen. You lose your position in the asset. You trigger a taxable event in most jurisdictions, meaning you owe capital gains tax on any profit. And you lose all future upside if the price goes up after you sell. If you believe zkLTC is going higher, selling is the worst possible way to access liquidity.

When you borrow against zkLTC through FENUS, none of those things happen. You keep your full position. No taxable event is triggered because you have not sold anything. You retain all future upside. You get the liquidity you need today and repay it when it suits you. The only cost is the 0.5% origination fee, which is a one-time payment, not an ongoing interest rate.

The math makes this clear. Suppose you hold 10 zkLTC worth $500 each, so $5,000 total. You need $1,500 for expenses. If you sell 3 zkLTC, you have $1,500 cash but only 7 zkLTC left. If zkLTC doubles to $1,000, your remaining 7 zkLTC are worth $7,000. If instead you borrow $1,500 of FnUSD against your 10 zkLTC at 200% collateral ratio, you need $3,000 of collateral to borrow $1,500. You deposit 6 zkLTC and keep 4 zkLTC liquid. If zkLTC doubles, your 6 locked zkLTC are worth $6,000, your 4 liquid zkLTC are worth $4,000, and you still owe $1,500 of FnUSD. Your total position is $10,000 minus $1,500 debt, so $8,500. Compare that to $7,000 from selling. Borrowing wins by $1,500 in this scenario, and the gap grows the more zkLTC appreciates.

This is why wealthy people in traditional finance never sell their assets to fund expenses. They borrow against them. FENUS brings that same strategy to the Litecoin ecosystem.

Once you have FnUSD, what can you do with it? The most straightforward use is spending it. FnUSD is a stablecoin pegged to $1. You can use it for any expense where you would normally use dollars. You can also provide liquidity in the FnUSD/aUSDC pool on Addax DEX and earn trading fees. As more protocols launch on LitVM, FnUSD will be usable across the entire ecosystem for trading, farming, and payments.

FnUSD is also a Decentralized Digital Dollar, which means it has properties that USDC and USDT do not. No company can freeze your FnUSD. No government can order it blocked. No blacklist exists. If you are in a country with capital controls, an unstable local currency, or a government that restricts financial activity, FnUSD gives you access to a dollar-denominated asset that no one can take from you. This is not a hypothetical benefit. It is a real and meaningful difference from every centralized stablecoin.

The Trove NFT is worth understanding as a feature in its own right. Because your position is an NFT, it is composable with the rest of DeFi. You can transfer it to another wallet. You can sell it on a secondary market. If you want to exit your position without repaying the debt, you can sell the Trove NFT to someone else and they take on both the collateral and the obligation. This creates a market for Trove positions, which is a genuinely novel financial primitive that does not exist in traditional lending.

A few things to watch. Monitor your collateral ratio regularly, especially during volatile markets. If zkLTC drops sharply, your ratio can fall quickly. Add collateral or repay some debt before you get close to the liquidation threshold. The Trove page shows your current ratio, your liquidation price, and your debt at all times. Set a personal alert if zkLTC falls to a price that would put your ratio below 150%, and take action before it gets to 130%.

Understand that the oracle matters. FENUS uses the DIA price feed for zkLTC/USD. If the oracle is temporarily unavailable, all Trove operations are paused until it recovers. This is a safety feature, not a bug. The protocol will not process transactions with a stale price because doing so could allow undercollateralized positions to open. If you see an oracle warning on the Trove page, wait for it to clear before transacting.

FENUS is the first CDP on LitVM. FnUSD is the first decentralized stablecoin on Litecoin. The protocol is live, the contracts are deployed, and the first Troves are open. If you hold zkLTC and you have ever needed liquidity without wanting to sell, this is what you have been waiting for.

Get zkLTC. Open a Trove. Mint FnUSD. Stay long. Stay liquid.`,
};
