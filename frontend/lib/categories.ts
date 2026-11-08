import type { Category } from "@/types/category";
import type { Game } from "@/types/game";
import { API_BASE_URL, API_CACHE_TAG, normalizeMedia } from "./api-config";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    signal: AbortSignal.timeout(8000), next: { revalidate: 60, tags: [API_CACHE_TAG] },
  });
  if (!response.ok) throw new Error("Không tải được thể loại game.");
  return await response.json() as Category[];
}
export async function getCategoryWithGames(slug: string): Promise<{ category: Category; games: Game[] } | null> {
  const response = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(slug)}`, {
    signal: AbortSignal.timeout(8000), next: { revalidate: 60, tags: [API_CACHE_TAG] },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Không tải được thể loại game.");
  return normalizeMedia(await response.json() as { category: Category; games: Game[] });
}
