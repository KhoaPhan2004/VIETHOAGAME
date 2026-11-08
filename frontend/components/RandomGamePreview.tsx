"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import YouTubePreviewPlayer from "@/components/YouTubePreviewPlayer";
import EmbeddedPreviewPlayer from "@/components/EmbeddedPreviewPlayer";
import GameCardCoverImage from "@/components/GameCardCoverImage";
import { getGameVideoPreview } from "@/lib/game-video";
import type { RandomGameData } from "@/types/game";

export default function RandomGamePreview({ game, active }: { game: RandomGameData; active: boolean }) {
  const preview = getGameVideoPreview(game.preview_video_url);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [nearby, setNearby] = useState(false);
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);
  const prepared = active && nearby && !!preview && !failed;
  const playing = prepared && requested;

  const stop = useCallback(() => setRequested(false), []);

  useEffect(() => {
    if (!active) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNearby(true);
      if (!entry.isIntersecting) stop();
    }, { rootMargin: "300px 0px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [active, stop]);

  useEffect(() => {
    if (!requested) return;
    const hide = () => { if (document.hidden) stop(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", hide);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hide); };
  }, [requested, stop]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) {
      void element.play().catch(() => stop());
    } else {
      element.pause();
    }
  }, [playing, prepared, stop]);

  function start() {
    if (!active || !preview || failed) return;
    setNearby(true);
    setRequested(true);
  }

  return <div ref={root} className="random-game-preview" data-playing={playing ? "true" : undefined}
    onPointerEnter={(event) => { if (event.pointerType === "mouse") start(); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") stop(); }}
    onPointerUp={(event) => { if (event.pointerType === "touch" && playing && !(event.target as Element).closest("button")) stop(); }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) stop(); }}>
    <GameCardCoverImage image={game.background_image ?? game.image} name={game.name} optimize sizes="(max-width: 900px) 100vw, 700px" />
    {prepared && preview ? <div className={"random-game-preview-player" + (playing && ready ? " is-ready" : "")}>
      {preview.kind === "file" ? <video ref={video} src={preview.url} muted loop playsInline preload="auto"
        aria-label={"Video xem trước " + game.name} onLoadedData={markReady} onPlaying={markReady} onError={markFailed}>
        <track kind="captions" />
      </video> : new URL(preview.url).hostname === "www.youtube-nocookie.com"
        ? <YouTubePreviewPlayer url={preview.url} title={"Video xem trước " + game.name} playing={playing} onReady={markReady} onError={markFailed} />
        : <EmbeddedPreviewPlayer url={preview.url} title={"Video xem trước " + game.name} playing={playing} onReady={markReady} onError={markFailed} />}
    </div> : null}
    {active && preview && !failed ? <button className="random-game-preview-toggle" type="button"
      aria-label={(requested ? "Dừng video " : "Xem video ") + game.name} aria-pressed={requested}
      onClick={() => { if (requested) stop(); else start(); }}>
      <span aria-hidden="true">{requested ? "Ⅱ" : "▶"}</span> {requested ? "Dừng video" : "Xem video"}
    </button> : null}
    {active && failed ? <span className="random-game-preview-error">Video chưa phát được</span> : null}
  </div>;
}
