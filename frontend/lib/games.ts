import type { Game } from "@/types/game";
import { API_BASE_URL, API_CACHE_TAG, normalizeMedia } from "./api-config";

type GameFilters = { query?: string; category?: string; status?: string; downloadable?: string; sort?: string };
export async function getGames(queryOrFilters?: string | GameFilters, category?: string): Promise<Game[]> {
  const filters = typeof queryOrFilters === "object" ? queryOrFilters : { query: queryOrFilters, category };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ q: filters.query, category: filters.category, status: filters.status, downloadable: filters.downloadable, sort: filters.sort })) {
    if (value) params.set(key, value);
  }
  const response = await fetch(`${API_BASE_URL}/games${params.size ? `?${params}` : ""}`, {
    signal: AbortSignal.timeout(8000), next: { revalidate: 60, tags: [API_CACHE_TAG] },
  });
  if (!response.ok) throw new Error("Không tải được thư viện game.");
  return normalizeMedia(await response.json() as Game[]);
}
export async function getGame(slug: string): Promise<Game | null> {
  const response = await fetch(`${API_BASE_URL}/games/${encodeURIComponent(slug)}`, {
    signal: AbortSignal.timeout(8000), next: { revalidate: 60, tags: [API_CACHE_TAG] },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Không tải được thông tin game.");
  return normalizeMedia(await response.json() as Game);
}
