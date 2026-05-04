export const post = {
  slug: "what-is-a-cdp",
  title: "What Is a CDP and Why Does It Matter for LitVM?",
  date: "2026-05-04",
  readTime: "5 min read",
  tags: ["Education", "CDP", "DeFi", "LitVM"],
  excerpt:
    "Collateralized Debt Positions are the backbone of decentralized lending. Here is how they work, why they matter, and why FENUS brings them to LitVM for the first time.",
  coverImage:
    "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
  content: `A Collateralized Debt Position, or CDP, is one of the most important primitives in all of decentralized finance. It is the mechanism that allows you to borrow against your crypto assets without selling them, and it is the foundation that FENUS is built on.

The concept is simple. You lock up an asset as collateral. The protocol mints a stablecoin against that collateral. You use the stablecoin. When you want your collateral back, you repay the stablecoin debt and the protocol releases your locked assets. The entire process is governed by smart contracts. No bank, no credit check, no application, no waiting.

MakerDAO pioneered this model on Ethereum with DAI. Liquity refined it with $BOLD. FENUS brings it to LitVM, the first ZK rollup on Litecoin, with zkLTC as the collateral and FnUSD as the Decentralized Digital Dollar.

The reason CDPs matter is that they solve a fundamental problem for crypto holders. You believe in your asset long-term. You do not want to sell. But you need liquidity today, for expenses, for opportunities, for operations. In traditional finance, wealthy individuals solve this by borrowing against their assets. They pledge their stock portfolio or real estate as collateral and take out a loan. They keep their long-term position. They get the cash they need. They repay when it suits them. CDPs bring this exact mechanism to crypto, permissionlessly, on-chain, available to anyone.

On FENUS, the collateral is zkLTC, the native representation of Litecoin on LitVM. The stablecoin is FnUSD, a Decentralized Digital Dollar with no issuer, no freeze risk, and no centralized control. The minimum collateral ratio is 135%, meaning you must always have $1.35 worth of zkLTC for every $1 of FnUSD you have minted. This overcollateralization is what keeps the system solvent even when zkLTC prices fall.

Each position in FENUS is called a Trove. When you open a Trove, you deposit zkLTC and specify how much FnUSD you want to mint. The protocol calculates your collateral ratio, checks that it meets the minimum requirement, and mints your FnUSD directly to your wallet. Your Trove is represented by an NFT, a unique token that proves your ownership of that position. You can manage your Trove at any time: add more collateral, borrow more FnUSD, repay debt, or close the position entirely.

The system protects itself through liquidations. If the price of zkLTC falls and your collateral ratio drops below 130%, your Trove becomes eligible for liquidation. An automated bot monitors every Trove on every block. When it detects an undercollateralized position, it triggers a liquidation, clearing the debt and distributing the collateral. This happens automatically, without any human decision-making, ensuring the protocol always remains solvent.

There is also a 0.5% origination fee on every borrow. This fee goes to the protocol treasury and helps fund ongoing development, security audits, and ecosystem growth. There is no ongoing interest rate. You pay once when you borrow, and that is it. No compounding interest eating into your position over time.

CDPs are not new. But on LitVM, they are. FENUS is the first CDP protocol on the first ZK rollup on Litecoin. For the first time, Litecoin holders can access the same DeFi primitives that Ethereum users have had for years without leaving the Litecoin ecosystem, without trusting a centralized bridge, and without giving up their zkLTC exposure.

This is what LitVM was built for. This is what FENUS delivers.`,
};
