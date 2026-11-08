"use client";

import { useCallback, useEffect, useRef } from "react";

// Keep the embed loaded and its first frame buffered between hovers.
export default function EmbeddedPreviewPlayer({ url, title, playing, onReady, onError }: {
  url: string; title: string; playing: boolean; onReady(): void; onError(): void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const wantsPlayback = useRef(playing);
  const buffered = useRef(false);
  const origin = new URL(url).origin;
  const streamable = new URL(url).hostname === "streamable.com";

  const send = useCallback((method: string, value?: unknown) => {
    const message = streamable
      ? { context: "player.js", version: "0.0.11", method, value }
      : { method, value };
    frame.current?.contentWindow?.postMessage(JSON.stringify(message), origin);
  }, [origin, streamable]);

  const connect = useCallback(() => {
    send("addEventListener", "timeupdate");
    if (streamable) send("mute");
    else send("setMuted", true);
    send(buffered.current && !wantsPlayback.current ? "pause" : "play");
  }, [send, streamable]);

  useEffect(() => {
    wantsPlayback.current = playing;
    if (playing || buffered.current) send(playing ? "play" : "pause");
  }, [playing, send]);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== origin || event.source !== frame.current?.contentWindow) return;
      let message;
      try { message = typeof event.data === "string" ? JSON.parse(event.data) : event.data; }
      catch { return; }
      if (!message || typeof message !== "object") return;
      if (message.event === "ready") connect();
      if (message.event === "timeupdate") {
        buffered.current = true;
        onReady();
        if (!wantsPlayback.current) send("pause");
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      send("pause");
    };
  }, [origin, connect, onReady, send]);

  return <iframe ref={frame} src={url} title={title} tabIndex={-1}
    allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"
    onLoad={connect} onError={onError} />;
}
