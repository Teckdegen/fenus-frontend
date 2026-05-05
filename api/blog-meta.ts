// Vercel serverless function — serves dynamic OG meta tags for blog posts
// When WhatsApp/Twitter/Discord scrapes /blog/:slug, this returns HTML with
// the correct og:image, og:title, og:description for that specific post.

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Blog post data — keep in sync with src/blog/posts/
// Cannot import from src/ directly in serverless functions
const posts: Record<string, {
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
}> = {
  "complete-guide-to-fenus": {
    title: "The Complete Guide to FENUS: How to Borrow Against Your zkLTC Without Selling",
    excerpt: "Everything you need to know about FENUS. How it works, how to open a Trove, how much to borrow, what to do with FnUSD, and why borrowing against your holdings beats selling every time.",
    coverImage: "https://www.image2url.com/r2/default/images/1777986038668-dc5c3fae-0569-406d-8dc6-9a2993f4f24d.png",
    tags: ["Guide", "FENUS", "Trove", "FnUSD", "LitVM"],
  },
  "censorship-resistant-money": {
    title: "Why Decentralized Stablecoins Are Censorship Resistant Money",
    excerpt: "Financial systems are programmable. That means they are censorable. FnUSD is built to remove that single point of control from the stablecoin layer entirely.",
    coverImage: "https://www.image2url.com/r2/default/images/1777965422497-277a692b-898f-412c-bee9-b99f2fd1a317.png",
    tags: ["Stablecoins", "Censorship", "FnUSD", "Freedom"],
  },
  "why-fenus": {
    title: "Why FENUS: The First Decentralized Digital Dollar on LitVM and the Litecoin Ecosystem",
    excerpt: "For years, Litecoin holders could only HODL or sell. LitVM changed that. FENUS completes it, bringing the first decentralized stablecoin and CDP protocol natively to Litecoin.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Protocol", "LitVM", "Litecoin", "DeFi"],
  },
  "what-is-a-cdp": {
    title: "What Is a CDP and Why Does It Matter for LitVM?",
    excerpt: "Collateralized Debt Positions are the backbone of decentralized lending. Here is how they work, why they matter, and why FENUS brings them to LitVM for the first time.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Education", "CDP", "DeFi", "LitVM"],
  },
  "fnusd-the-decentralized-dollar": {
    title: "FnUSD: The Decentralized Digital Dollar That Litecoin Has Been Waiting For",
    excerpt: "USDC and USDT can freeze your funds. FnUSD cannot. Here is why a truly decentralized stablecoin matters and why FnUSD is the first one native to Litecoin.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["FnUSD", "Stablecoin", "DDD", "Litecoin"],
  },
  "dao-treasury-management": {
    title: "How DAO Treasuries Should Manage Their Crypto Holdings",
    excerpt: "Most DAO treasuries are doing it wrong. They hold volatile assets, sell at the worst times, and leave millions sitting idle. Here is a better way.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["DAO", "Treasury", "DeFi", "Strategy"],
  },
  "why-litecoin-still-relevant-2026": {
    title: "Why Litecoin Is Still Relevant in 2026",
    excerpt: "Critics have been writing Litecoin's obituary for years. They keep being wrong. Here is why Litecoin is more relevant in 2026 than it has ever been.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Litecoin", "LTC", "Bitcoin", "LitVM"],
  },
  "litecoin-halving-explained": {
    title: "The Litecoin Halving: What It Means for LTC Price and Miners",
    excerpt: "Every four years, the Litecoin block reward gets cut in half. Here is what that means for miners, for price, and for the long-term supply of LTC.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Litecoin", "Halving", "Mining", "LTC"],
  },
  "stablecoin-models-explained": {
    title: "Fiat Backed vs Crypto Backed vs Algorithmic: The Three Stablecoin Models",
    excerpt: "Not all stablecoins are built the same. Understanding the three models, their tradeoffs, and why only one has proven truly reliable is essential for every DeFi user.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Stablecoins", "Education", "DeFi", "FnUSD"],
  },
  "stablecoin-regulation": {
    title: "The Regulatory War on Stablecoins and What It Means for DeFi",
    excerpt: "Governments around the world are moving to regulate stablecoins. Some of those regulations will help. Many will hurt. Here is what is happening and what it means for DeFi.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Regulation", "Stablecoins", "DeFi", "Policy"],
  },
  "why-stablecoins-matter-defi": {
    title: "Why Stablecoins Are the Most Important Asset in DeFi",
    excerpt: "Remove stablecoins from DeFi and the entire ecosystem collapses. Here is why stable assets are the foundation that everything else is built on.",
    coverImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png",
    tags: ["Stablecoins", "DeFi", "FnUSD", "Education"],
  },
};

const SITE_URL = "https://www.fenus.xyz";
const DEFAULT_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c814b8a-fc73-4d2d-aa17-5bb8173aa2fc/id-preview-590058f0--7a328caa-9712-4410-9686-e16566487502.lovable.app-1777075284326.png";
const DEFAULT_DESCRIPTION = "FENUS lets you mint FnUSD with zkLTC collateral. Borrow against your LitVM holdings on a decentralized stablecoin protocol.";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const slug = (req.query.slug as string) || "";
  const post = posts[slug];

  const title    = post ? `${post.title} | FENUS Blog` : "FENUS Blog";
  const desc     = post ? post.excerpt : DEFAULT_DESCRIPTION;
  const image    = post ? post.coverImage : DEFAULT_IMAGE;
  const url      = `${SITE_URL}/blog/${slug}`;

  // Cache for 1 hour
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Return minimal HTML with correct OG tags + redirect to the SPA
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(desc)}" />

  <!-- Open Graph -->
  <meta property="og:type"        content="article" />
  <meta property="og:site_name"   content="FENUS" />
  <meta property="og:url"         content="${escHtml(url)}" />
  <meta property="og:title"       content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:image"       content="${escHtml(image)}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />
  <meta name="twitter:image"       content="${escHtml(image)}" />

  <!-- Redirect to SPA immediately -->
  <meta http-equiv="refresh" content="0; url=${escHtml(url)}" />
  <script>window.location.href = "${escHtml(url)}";</script>
</head>
<body>
  <p>Redirecting to <a href="${escHtml(url)}">${escHtml(title)}</a>…</p>
</body>
</html>`);
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
