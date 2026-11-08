"use client";

import { useEffect, useRef } from "react";

type Player = {
  mute(): void;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
  unloadModule(name: string): void;
  getOptions(): string[];
  setOption(module: string, option: string, value: unknown): void;
  getIframe(): HTMLIFrameElement;
};
type PlayerEvent = { target: Player; data: number };
type YouTubeApi = { Player: new (element: HTMLElement, options: {
  videoId: string; host: string; playerVars: Record<string, string | number>;
  events: { onReady(event: PlayerEvent): void; onStateChange(event: PlayerEvent): void; onApiChange(event: PlayerEvent): void; onError(): void; onAutoplayBlocked(): void };
}) => Player };
type ApiWindow = Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
let apiPromise: Promise<YouTubeApi> | undefined;

function loadApi(): Promise<YouTubeApi> {
  const apiWindow = window as ApiWindow;
  if (apiWindow.YT?.Player) return Promise.resolve(apiWindow.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = apiWindow.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => { apiPromise = undefined; reject(new Error("Video API timeout")); }, 12000);
    apiWindow.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timeout);
      if (apiWindow.YT) resolve(apiWindow.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => { window.clearTimeout(timeout); apiPromise = undefined; script.remove(); reject(new Error("Video API unavailable")); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export default function YouTubePreviewPlayer({ url, title, playing, onReady, onError }: {
  url: string; title: string; playing: boolean; onReady(): void; onError(): void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const wantsPlayback = useRef(playing);
  useEffect(() => {
    wantsPlayback.current = playing;
    const player = playerRef.current;
    if (player) {
      if (playing) player.playVideo();
      else player.pauseVideo();
    }
  }, [playing]);
  useEffect(() => {
    let cancelled = false;
    let player: Player | undefined;
    function disableCaptions(target: Player) {
      if (target.getOptions().includes("captions")) {
        target.setOption("captions", "track", {});
        target.unloadModule("captions");
      }
    }
    loadApi().then((api) => {
      if (cancelled || !root.current) return;
      const target = document.createElement("div");
      root.current.appendChild(target);
      const videoId = new URL(url).pathname.split("/").pop()!;
      player = new api.Player(target, {
        videoId, host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, playsinline: 1, loop: 1, playlist: videoId, rel: 0, cc_load_policy: 0, origin: window.location.origin },
        events: {
          onReady(event) {
            playerRef.current = event.target;
            event.target.getIframe().title = title;
            event.target.getIframe().tabIndex = -1;
            disableCaptions(event.target);
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange(event) {
            if (cancelled) return;
            if (event.data !== 1) return;
            disableCaptions(event.target);
            onReady();
            if (!wantsPlayback.current) event.target.pauseVideo();
          },
          onApiChange(event) { disableCaptions(event.target); },
          onError() { if (!cancelled) onError(); },
          onAutoplayBlocked() { if (!cancelled) onError(); },
        },
      });
    }).catch(() => { if (!cancelled) onError(); });
    return () => { cancelled = true; playerRef.current = null; player?.destroy(); };
  }, [url, title, onReady, onError]);
  return <div ref={root} className="random-game-youtube-player" />;
}
