export function publicMediaUrl(value: string) {
  if (value.startsWith("/storage/games/")) return value.replace("/storage/games/", "/game-media/");
  try {
    const url = new URL(value);
    if (["127.0.0.1", "localhost"].includes(url.hostname) && url.pathname.startsWith("/storage/games/")) {
      return "/game-media/" + url.pathname.slice("/storage/games/".length);
    }
  } catch { /* Other relative URLs already work on this site. */ }
  return value;
}
