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
  content: `For most of Litecoin's history, holders had exactly two options. They could hold their LTC and wait, or they could sell it and get liquidity. Neither option was particularly satisfying. Holding meant watching your capital sit idle while opportunities passed. Selling meant giving up your position and potentially missing the next move up. FENUS is the third option that Litecoin holders have never had before. It lets you borrow against your zkLTC, access real liquidity in the form of FnUSD, and keep your long position intact the entire time.

FENUS is a Collateralized Debt Position protocol built on LitVM, the ZK rollup for Litecoin. You deposit zkLTC as collateral, and the protocol mints FnUSD against it. When you want your zkLTC back, you repay the FnUSD debt and the collateral is returned to you. The protocol is governed entirely by smart contracts. There is no company, no compliance team, and no one who can freeze your position or deny your transaction. It runs on code and math, the same way for every user.

The problem FENUS solves is real and it affects every serious Litecoin holder. You believe in Litecoin long term. You do not want to sell. But you need liquidity today, whether for living expenses, for other investments, or for operational costs if you are running a team or a DAO. Before FENUS, your only path to liquidity was selling. Now you can borrow instead, keep your zkLTC, and repay the debt on your own timeline.

Your position in FENUS is called a Trove. Think of it as your personal vault in the protocol. It holds your zkLTC collateral and tracks how much FnUSD you have borrowed against it. Each wallet can have one Trove, and that Trove is the single record of your relationship with the protocol. When you open a Trove, you are creating a position that you can add to, borrow more from, repay, or close entirely at any time.

What makes the Trove design particularly interesting is that it is represented on-chain as an NFT. Your Trove is not just a record in a database. It is a transferable on-chain asset. This means you can move your Trove to another wallet, sell it, or hand it off to a DAO treasury. The NFT carries both the collateral and the debt with it, so whoever holds the NFT owns the position and is responsible for managing it. This design opens up possibilities that a traditional lending position cannot offer.

The NFT structure also means your Trove is composable. Future protocols on LitVM can build on top of Trove NFTs, accept them as collateral, or integrate them into other DeFi strategies. The same way Uniswap V3 LP positions are NFTs that other protocols can work with, FENUS Troves are designed to be a building block for the broader LitVM DeFi ecosystem.

FnUSD is the stablecoin you receive when you borrow from FENUS. It is pegged to one US dollar and backed entirely by zkLTC collateral locked in the protocol. There is no issuer behind FnUSD. No company minted it and no company can freeze it. It exists as a smart contract on LitVM, and the rules that govern it are written in code that anyone can read and verify.

The peg is maintained by a PegKeeper that operates on Addax DEX, the native decentralized exchange on LitVM. When FnUSD trades above one dollar, the PegKeeper sells FnUSD into the market to increase supply and bring the price back down. When it trades below one dollar, it buys FnUSD to reduce supply and push the price back up. This is automated arbitrage that runs continuously without any human intervention. The result is a stablecoin that holds its peg through market mechanics rather than through the promises of a reserve manager.

Because FnUSD has no issuer, it also has no blacklist. USDC and USDT can freeze wallets at the request of regulators or law enforcement. FnUSD cannot. There is no entity to receive that request. Every wallet on LitVM can hold, send, and use FnUSD on equal terms, regardless of who they are or where they live. For a Litecoin ecosystem that values decentralization, this is the only kind of stablecoin that makes sense.

Getting started with FENUS is straightforward. The first step is getting zkLTC, which you do by bridging LTC to LitVM through the official bridge. Once your zkLTC is in your LitVM wallet, go to fenus.xyz and connect your wallet. Navigate to the Trove page and select the Open tab. You will see a field where you enter how much zkLTC you want to deposit as collateral.

Once you enter your collateral amount, the system automatically fills in a safe borrow amount that puts you at a 150% collateral ratio. This is the recommended starting point and you can edit it if you want to borrow more or less. Below the input fields you will see your collateral ratio, your liquidation price, the origination fee of 0.5%, and the exact amount of FnUSD you will receive after the fee. Review these numbers carefully before proceeding.

When you are ready, click Open Trove. The first transaction will ask you to approve the wzkLTC spend, which is a standard ERC20 approval that lets the protocol move your collateral. After you confirm that, a second transaction opens the Trove and mints your FnUSD. Both transactions happen in your wallet and you can see exactly what is happening at each step. Once confirmed, your Trove is open and your FnUSD is in your wallet.

The collateral ratio is the most important number in your Trove. It is the ratio of your collateral value to your debt. If you have $150 worth of zkLTC and $100 of FnUSD debt, your collateral ratio is 150%. The minimum ratio to open a Trove is 135%. If your ratio falls below 130%, your Trove becomes eligible for liquidation. The gap between 135% and 130% is your safety buffer, and it is intentionally narrow to encourage users to maintain healthy ratios.

Your collateral ratio changes as the price of zkLTC moves. If zkLTC goes up, your ratio improves because your collateral is worth more relative to your fixed debt. If zkLTC goes down, your ratio drops because your collateral is worth less. This is the core dynamic you need to monitor as a Trove owner. A ratio that looks comfortable at today's price can become dangerous if the market moves against you.

The recommended range for most users is 150% to 200%. At 150%, you have a 20 percentage point buffer above the liquidation threshold. At 200%, you have a 70 point buffer. The higher your ratio, the more protected you are against price drops, but the less FnUSD you are extracting from your collateral. Finding the right balance depends on your risk tolerance and your view on where zkLTC is headed.

Deciding how much to borrow is a risk management decision as much as a financial one. The conservative approach is to stay between 150% and 200% collateral ratio and never go below 140% unless you are actively watching the position. The auto-fill at 150% exists for a reason. It is the protocol's way of suggesting a starting point that gives you meaningful liquidity while keeping you well above the danger zone.

The right mental model is to think about worst case scenarios before you borrow. If zkLTC drops 30% from your entry price, what does your collateral ratio become? If it drops 40%? Work through those numbers before you decide how much to borrow. If a 30% drop would put you close to liquidation, you are borrowing too much. Leave room for the market to move against you without forcing you into a crisis.

Never borrow the maximum amount the protocol will allow. The minimum ratio to open is 135%, but opening at 135% means a very small price drop will put you in liquidation territory. The origination fee is 0.5% of the borrowed amount, which is a one-time cost paid at opening. Factor that into your calculations. The goal is to borrow an amount that gives you useful liquidity while keeping your position safe through normal market volatility.

The tax argument for borrowing instead of selling is one of the most compelling reasons to use FENUS. In most jurisdictions, selling a cryptocurrency is a taxable event. If you bought zkLTC at a low price and sell it at a higher price, you owe capital gains tax on the difference. Borrowing against your zkLTC is not a sale. You are not disposing of the asset. You are using it as collateral. In most jurisdictions, this does not trigger a taxable event. Always consult a tax professional for your specific situation, but the general principle is that borrowing is not selling.

Beyond taxes, selling means you lose your position. If you sell zkLTC to get liquidity and the price of zkLTC doubles over the next year, you missed that gain. Borrowing lets you access liquidity today while keeping your long position intact. When you repay the debt and close your Trove, you get your zkLTC back at whatever price it is trading at then. If it doubled while you held it, you kept that gain. If you sold, you did not.

The combination of tax efficiency and position preservation makes borrowing a fundamentally different tool than selling. Selling is a one-way door. You exit your position and you are done. Borrowing is a two-way door. You access liquidity now and you can return to your full position later by repaying the debt. For long-term holders who believe in Litecoin, this distinction matters enormously.

Once you have FnUSD in your wallet, you have several options for what to do with it. The most direct use is trading on Addax DEX. FnUSD is a stable dollar, so you can use it to buy other assets on LitVM without first converting to a volatile token. It is the native stable unit of account for the LitVM DeFi ecosystem.

Providing liquidity is another strong option. The FnUSD and aUSDC pool on Addax DEX earns trading fees from every swap that passes through it. If you are holding FnUSD anyway, putting it to work in a liquidity pool lets you earn yield on your stable position. This is a way to make your borrowed capital productive rather than just letting it sit.

For teams and DAOs, FnUSD is a practical tool for operational expenses. If your treasury holds zkLTC and you need to pay contributors or cover costs, borrowing FnUSD against your zkLTC lets you meet those obligations without selling your treasury assets. You preserve the long-term value of the treasury while funding current operations. You can also simply hold FnUSD as a stable dollar while you wait for the right opportunity to deploy it, or send it to anyone on LitVM as a stable payment for goods or services.

Transferring a Trove is one of the more unique features of the FENUS design. Because your Trove is an NFT, you can transfer it to any other wallet on LitVM using the Transfer page in the FENUS app. The process is straightforward: enter the destination wallet address and confirm the transaction. The Trove NFT moves to the new wallet, and with it goes both the collateral and the debt.

The new owner of the Trove NFT inherits the full position. They receive the zkLTC collateral and they take on the FnUSD debt. They are responsible for managing the collateral ratio and repaying the debt when they want to close the position. This is important to understand before transferring: you are not just sending an asset, you are handing off a financial obligation along with it.

This transfer mechanism is useful in several scenarios. If you want to move your position to a cold wallet for security, you can transfer the Trove NFT there. If you want to sell your position to another user, you can transfer the Trove as part of that transaction. If you are a DAO and want to move a Trove from a personal wallet to the DAO treasury, the transfer function handles that cleanly. The NFT design makes all of these scenarios possible without closing and reopening the position.

Managing your Trove over time is an ongoing responsibility. The most common action is adding collateral when your ratio gets low. If zkLTC drops and your ratio approaches 140%, depositing more zkLTC raises your ratio and gives you more buffer. You can do this at any time from the Trove page by selecting the Add Collateral tab and entering the amount you want to deposit.

You can also borrow more FnUSD if your ratio is high enough to support it. If zkLTC has gone up since you opened your Trove and your ratio is now 250%, you have room to borrow more without taking on excessive risk. The Borrow More tab lets you do this in a single transaction. On the other side, you can repay debt at any time to improve your ratio or reduce your exposure. The Repay tab includes 50% and Max buttons that make partial and full repayment easy without having to calculate the exact amount manually.

Closing your Trove entirely means repaying all outstanding FnUSD debt and receiving your full zkLTC collateral back. Use the Max button on the Repay tab to repay the full balance, then confirm the close transaction. Your zkLTC is returned to your wallet and the Trove is closed. There is no penalty for closing early and no minimum time you are required to hold the position open.

Liquidation is the mechanism that keeps the protocol solvent, and understanding it is essential for every Trove owner. If your collateral ratio drops below 130%, an automated liquidation bot is authorized to close your Trove. The bot repays your FnUSD debt using the collateral in your Trove and the position is closed. You lose your zkLTC collateral. Your FnUSD debt is cleared. You do not owe anything after liquidation, but you have lost the collateral you deposited.

The way to avoid liquidation is to keep your ratio well above 130% at all times. Add collateral when the price drops. Repay some debt if your ratio is getting close to the danger zone. Set price alerts so you know when zkLTC is moving against you. The oracle down banner on the Trove page is also important to understand: when the price feed is unavailable, all Trove transactions are paused. This protects users from opening or closing positions during periods of price uncertainty.

Liquidation is not a punishment. It is a safety mechanism that protects the protocol and all FnUSD holders. If Troves were allowed to become undercollateralized, the value of FnUSD would be at risk. The liquidation system ensures that every FnUSD in circulation is always backed by more than one dollar of collateral. Understanding this helps you see why maintaining a healthy ratio is not just good for you personally but is part of how the whole system stays sound.

The Trove NFT design has implications beyond just transferability. It makes your position a composable on-chain asset that other protocols can interact with. In the current DeFi landscape, composability is one of the most powerful properties a protocol can have. When your position is an NFT, it can be used as collateral in other lending protocols, integrated into yield strategies, or accepted by other applications as proof of your position in FENUS.

This is the same design philosophy behind Uniswap V3 LP positions, which are also NFTs. That design choice allowed an entire ecosystem of protocols to build on top of Uniswap V3 positions, creating strategies and tools that the original protocol never anticipated. FENUS Troves are designed with the same future in mind. As the LitVM DeFi ecosystem grows, the Trove NFT will become a building block that other protocols can use in ways that are not yet fully imagined.

The composability of Trove NFTs also means that the value of holding a Trove may increase over time as more protocols integrate with FENUS. A Trove that today is just a borrowing position may tomorrow be usable as collateral in a second protocol, or as a ticket to participate in a yield strategy, or as a governance token in a future DAO. The NFT design keeps these possibilities open.

FENUS is built for a specific kind of user. The primary audience is Litecoin holders who want liquidity without selling. If you have been holding LTC for years and you believe in its long-term value, FENUS gives you a way to put that holding to work without giving it up. You can access dollars today and return to your full position later.

Teams and DAOs that hold zkLTC in their treasury are another natural fit. Operational expenses are a constant reality for any organization, and selling treasury assets to cover costs is a painful trade-off. FENUS lets treasury managers borrow against their zkLTC holdings to fund operations while preserving the long-term value of the treasury. This is a more sophisticated approach to treasury management than simply selling assets when you need cash.

DeFi users on LitVM who want a native decentralized stablecoin are also a core audience. FnUSD is the first decentralized dollar on Litecoin. It is the stable unit of account that the LitVM DeFi ecosystem needs to function. Traders, liquidity providers, and protocol builders all benefit from having a censorship-resistant stable asset that is native to the chain they are building on.

FENUS is the first CDP protocol on LitVM and FnUSD is the first decentralized dollar on Litecoin. These are not incremental improvements to existing tools. They are genuinely new capabilities for an ecosystem that has never had them before. Litecoin holders have waited a long time for a way to participate in DeFi with their native asset, and FENUS is the answer to that wait.

The protocol is live, the contracts are deployed, and the first era of Litecoin DeFi has begun. Every zkLTC holder now has a third option beyond hold or sell. They can borrow, stay long, and put their capital to work. That is what FENUS is built to do, and it is available right now at fenus.xyz.`,
};
