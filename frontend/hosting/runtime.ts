import { useSyncExternalStore } from "react";
import type { Game, InProgressGame } from "@/types/game";
import type { Category } from "@/types/category";

export type SitePayload = {
  path: string; title: string; description: string; csrf: string;
  games: Game[]; progress: InProgressGame[]; categories: Category[];
  videos: { id: string; title: string; url: string; thumbnail: string }[];
  adminBase?: string; authenticated?: boolean;
};
export let site: SitePayload = JSON.parse(document.getElementById("site-data")!.textContent!);
const subscribers = new Set<() => void>();
let navigateHandler: (url: URL, replace?: boolean, scroll?: boolean) => Promise<void>;
export function installNavigation(handler: typeof navigateHandler) { navigateHandler = handler; }
export function setSite(payload: SitePayload) { site = payload; }
export function notifyNavigation() { subscribers.forEach(fn => fn()); }
export function usePathname() { return useSyncExternalStore(fn => { subscribers.add(fn); return () => { subscribers.delete(fn); }; }, () => location.pathname); }
export function useSearchParams() { usePathname(); return new URLSearchParams(location.search); }
export function useRouter() { return { push: (href: string, options?: { scroll?: boolean }) => navigateHandler(new URL(href, location.href), false, options?.scroll), replace: (href: string) => navigateHandler(new URL(href, location.href), true), refresh: () => navigateHandler(new URL(location.href), true, false) }; }
export function redirect(href: string): never { throw Object.assign(new Error("Redirect"), { destination: href }); }
export function notFound(): never { throw Object.assign(new Error("Not found"), { status: 404 }); }
export function adminBasePath() { if (!site.adminBase) throw new Error("Không tìm thấy trang."); return site.adminBase; }
export function adminHref(suffix = "") { return adminBasePath() + suffix; }
export async function isAdminAuthenticated() { return Boolean(site.authenticated); }
export function siteUrl() { return location.origin; }
export const API_BASE_URL = "/api";
export const API_CACHE_TAG = "site-data";
export function normalizeMedia<T>(value: T): T { return value; }

type Filters = { query?: string; category?: string; status?: string; downloadable?: string; sort?: string };
export async function getGames(input?: string | Filters, category?: string): Promise<Game[]> {
  const f = typeof input === "object" ? input : { query: input, category };
  const q = f.query?.toLocaleLowerCase("vi");
  const games = site.games.filter(game => (!q || [game.name, game.description, ...(game.categories ?? []).map(c => c.name)].some(v => v?.toLocaleLowerCase("vi").includes(q)))
    && (!f.category || game.categories?.some(c => c.name === f.category || c.slug === f.category))
    && (!f.status || game.status === f.status)
    && (!f.downloadable || game.is_downloadable === (f.downloadable === "true")));
  if (f.sort === "name") games.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  if (f.sort === "downloads") games.sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0));
  return games;
}
export async function getGame(slug: string) { return site.games.find(game => game.slug === slug) ?? null; }
export async function getCategories() { return site.categories; }
export async function getCategoryWithGames(slug: string) { const category = site.categories.find(c => c.slug === slug); return category ? { category, games: site.games.filter(g => g.categories?.some(c => c.id === category.id)) } : null; }
export async function getInProgressGames() { return site.progress; }
export async function getTkpkpinVideos() { return site.videos; }
export async function getAdminGames() { return site.games; }
export async function getAdminInProgressGames() { return site.progress; }
