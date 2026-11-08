import "server-only";

export const API_BASE_URL = (process.env.API_BASE_URL ?? "http://127.0.0.1:8000/api").replace(/\/$/, "");
export const API_CACHE_TAG = "site-data";

function publicImage(value: string) {
  if (value.startsWith("/storage/games/")) return value.replace("/storage/games/", "/game-media/");
  try {
    const url = new URL(value);
    const knownOrigins = [new URL(API_BASE_URL).origin, "http://127.0.0.1:8000", "http://localhost:8000", process.env.PUBLIC_BACKEND_URL];
    if (knownOrigins.includes(url.origin) && url.pathname.startsWith("/storage/games/")) {
      return "/game-media/" + url.pathname.slice("/storage/games/".length);
    }
  } catch { /* Preserve other relative paths. */ }
  return value;
}
export function normalizeMedia<T>(value: T): T {
  if (Array.isArray(value)) return value.map(normalizeMedia) as T;
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if ((key === "image" || key === "background_image") && typeof item === "string") return [key, publicImage(item)];
    if (key === "gallery_images" && Array.isArray(item)) return [key, item.map(publicImage)];
    return [key, normalizeMedia(item)];
  })) as T;
}
