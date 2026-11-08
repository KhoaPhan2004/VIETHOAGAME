export type GameVideo = { kind: "embed" | "file" | "external"; url: string };

export function getGameVideo(value?: string | null): GameVideo | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let youtubeId: string | null = null;
    if (host === "youtu.be") youtubeId = url.pathname.split("/")[1];
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const [, route, id] = url.pathname.split("/");
      youtubeId = route === "watch" ? url.searchParams.get("v")
        : ["embed", "shorts", "live"].includes(route) ? id : null;
    }
    if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
      return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${youtubeId}` };
    }
    if (host === "streamable.com") {
      const match = url.pathname.match(/^\/(?:e\/)?([a-z0-9]+)\/?$/i);
      if (match) return { kind: "embed", url: "https://streamable.com/e/" + match[1] };
    }
    if (["vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return { kind: "embed", url: `https://player.vimeo.com/video/${id}` };
    }
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: "file", url: url.href };
    return { kind: "external", url: url.href };
  } catch {
    return null;
  }
}

export function getGameVideoPreview(value?: string | null): GameVideo | null {
  const video = getGameVideo(value);
  if (!video || video.kind === "external") return null;
  if (video.kind === "file") return video;
  const url = new URL(video.url);
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("loop", "1");
  url.searchParams.set("controls", "0");
  url.searchParams.set("playsinline", "1");
  if (url.hostname === "www.youtube-nocookie.com") {
    url.searchParams.set("mute", "1");
    url.searchParams.set("playlist", url.pathname.split("/").pop()!);
    url.searchParams.set("disablekb", "1");
    url.searchParams.set("rel", "0");
  } else if (url.hostname === "streamable.com") {
    url.searchParams.delete("controls");
    url.searchParams.set("nocontrols", "1");
    url.searchParams.set("muted", "1");
  } else {
    url.searchParams.set("muted", "1");
    url.searchParams.set("dnt", "1");
  }
  return { ...video, url: url.href };
}
