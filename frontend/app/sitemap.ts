import type { MetadataRoute } from "next";
import { getGames } from "@/lib/games";
import { getCategories } from "@/lib/categories";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  if (!origin) return [];
  const [games, categories] = await Promise.all([getGames(), getCategories()]);
  return [
    ...["", "/games", "/categories", "/in-progress", "/about"].map(path => ({ url: origin + path })),
    ...games.map(game => ({ url: `${origin}/games/${encodeURIComponent(game.slug)}`, ...(game.updated_at ? { lastModified: game.updated_at } : {}) })),
    ...categories.map(category => ({ url: `${origin}/categories/${encodeURIComponent(category.slug)}` })),
  ];
}
