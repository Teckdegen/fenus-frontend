import { post as whyFenus } from "./posts/why-fenus";
import { post as whatIsACdp } from "./posts/what-is-a-cdp";
import { post as fnusdTheDollar } from "./posts/fnusd-the-decentralized-dollar";
import { post as daoTreasury } from "./posts/dao-treasury-management";
import { post as whyLitecoin } from "./posts/why-litecoin-still-relevant-2026";
import { post as litecoinHalving } from "./posts/litecoin-halving-explained";
import { post as stablecoinModels } from "./posts/stablecoin-models-explained";
import { post as stablecoinRegulation } from "./posts/stablecoin-regulation";
import { post as whyStablecoinsMatter } from "./posts/why-stablecoins-matter-defi";
import { post as censorshipResistant } from "./posts/censorship-resistant-money";

export const allPosts = [
  whyFenus,
  whatIsACdp,
  fnusdTheDollar,
  daoTreasury,
  whyLitecoin,
  litecoinHalving,
  stablecoinModels,
  stablecoinRegulation,
  whyStablecoinsMatter,
  censorshipResistant,
];

export type BlogPost = typeof whyFenus;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getLatestPosts(count = 3): BlogPost[] {
  return [...allPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
