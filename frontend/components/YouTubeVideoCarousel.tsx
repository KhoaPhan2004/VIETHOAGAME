"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import type { YouTubeVideo } from "@/lib/youtube";

export default function YouTubeVideoCarousel({ videos }: { videos: YouTubeVideo[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const cycleWidth = useRef(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  const resumeAt = useRef(0);
  const suppressClick = useRef(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    offset: number;
    dragging: boolean;
  } | null>(null);

  function paint() {
    if (!trackRef.current || !cycleWidth.current) return;
    const width = cycleWidth.current;
    const position = ((offset.current % width) + width) % width;
    trackRef.current.style.transform = `translateX(${-position}px)`;
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      cycleWidth.current = (track.scrollWidth + gap) / 2;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    let visible = false;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(animate);
      else if (!visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    });
    if (viewportRef.current) visibility.observe(viewportRef.current);
    let previous = 0;
    let frame = 0;
    function animate(now: number) {
      frame = 0;
      if (!visible) return;
      const elapsed = previous ? Math.min(now - previous, 64) : 0;
      previous = now;
      if (!reducedMotion.matches && !document.hidden && !hovered.current &&
          !focused.current && !gesture.current && now >= resumeAt.current) {
        offset.current += (cycleWidth.current / 72000) * elapsed;
        paint();
      }
      frame = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
    };
  }, [videos]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      offset: offset.current, dragging: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.dragging) {
      if (Math.abs(dx) < 6) return;
      if (event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) return;
      current.dragging = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add("is-dragging");
    }
    offset.current = current.offset - dx;
    paint();
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    resumeAt.current = performance.now() + 1500;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      ref={viewportRef}
      className="youtube-video-grid"
      role="region"
      aria-label="Video kênh TKPkpin. Kéo hoặc dùng phím mũi tên để xem thêm."
      tabIndex={0}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onPointerLeave={(event) => {
        hovered.current = false;
        if (!gesture.current?.dragging) endDrag(event);
      }}
      onPointerEnter={(event) => { hovered.current = event.pointerType !== "touch"; }}
      onFocusCapture={(event) => { focused.current = event.target.matches(":focus-visible"); }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false;
      }}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const card = trackRef.current?.firstElementChild as HTMLElement | null;
        const gap = trackRef.current ? parseFloat(getComputedStyle(trackRef.current).columnGap) || 0 : 0;
        offset.current += (event.key === "ArrowRight" ? 1 : -1) * ((card?.offsetWidth ?? 240) + gap);
        paint();
      }}
    >
      <div className="youtube-video-track" ref={trackRef}>
        {[false, true].flatMap((duplicate) => videos.map((video) => (
          <a
            aria-hidden={duplicate || undefined}
            className="youtube-video-card"
            href={video.url}
            key={`${video.id}-${duplicate}`}
            rel="noreferrer"
            tabIndex={duplicate ? -1 : undefined}
            target="_blank"
            draggable={false}
            onFocus={(event) => {
              if (!event.currentTarget.matches(":focus-visible")) return;
              const track = trackRef.current;
              if (!track) return;
              offset.current = event.currentTarget.offsetLeft - track.offsetLeft;
              if (viewportRef.current) viewportRef.current.scrollLeft = 0;
              paint();
            }}
          >
            <div className="youtube-video-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={video.thumbnail} alt={video.title} loading="eager" decoding="async" width={480} height={360} draggable={false} />
            </div>
            <h3>{video.title}</h3>
          </a>
        )))}
      </div>
    </div>
  );
}
