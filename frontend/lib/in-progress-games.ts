import type { InProgressGame } from "@/types/game";
import { API_BASE_URL, API_CACHE_TAG, normalizeMedia } from "./api-config";

export async function getInProgressGames(query?: string): Promise<InProgressGame[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const response = await fetch(`${API_BASE_URL}/in-progress-games${params.size ? `?${params}` : ""}`, {
    signal: AbortSignal.timeout(8000), next: { revalidate: 60, tags: [API_CACHE_TAG] },
  });
  if (!response.ok) throw new Error("Không tải được tiến độ Việt hóa.");
  return normalizeMedia(await response.json() as InProgressGame[]);
}
export async function getInProgressGame(slug: string) {
  return (await getInProgressGames()).find(game => game.slug === slug) ?? null;
}
