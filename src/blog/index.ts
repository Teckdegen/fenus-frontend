import { post as whyFenus } from "./posts/why-fenus";
import { post as whatIsACdp } from "./posts/what-is-a-cdp";
import { post as fnusdTheDollar } from "./posts/fnusd-the-decentralized-dollar";

export const allPosts = [whyFenus, whatIsACdp, fnusdTheDollar];

export type BlogPost = typeof whyFenus;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getLatestPosts(count = 3): BlogPost[] {
  return [...allPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
