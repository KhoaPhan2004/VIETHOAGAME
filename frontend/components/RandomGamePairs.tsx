"use client";

import type { RandomGameData } from "@/types/game";
import Link from "next/link";
import RandomGamePreview from "@/components/RandomGamePreview";
import { useEffect, useMemo, useState } from "react";

type RandomGamePairsProps = {
  games: RandomGameData[];
};

export default function RandomGamePairs({ games }: RandomGamePairsProps) {
  const pairs = useMemo(() => toPairs(games), [games]);
  const [slide, setSlide] = useState({ index: 0, previous: -1, direction: 1, moving: false });

  useEffect(() => {
    if (!slide.moving) return;
    const timer = window.setTimeout(() => setSlide((current) => ({ ...current, previous: -1, moving: false })), 760);
    return () => window.clearTimeout(timer);
  }, [slide.moving]);

  if (pairs.length === 0) {
    return null;
  }

  const canSlide = pairs.length > 1;

  function navigate(direction: number) {
    setSlide((current) => current.moving ? current : {
      index: (current.index + direction + pairs.length) % pairs.length,
      previous: current.index,
      direction,
      moving: true,
    });
  }

  return (
    <section className="random-games" aria-label="Game ngẫu nhiên hôm nay">
      <div className="random-games-stage" data-direction={slide.direction === 1 ? "next" : "previous"}>
        <RandomGamePanel games={pairs.map((pair) => pair[0])} slide={slide} side="left" />
        <RandomGamePanel games={pairs.map((pair) => pair[1])} slide={slide} side="right" />

        <div className="random-game-controls">
          <button
            aria-label="Cặp game trước"
            className="random-game-nav random-game-prev"
            disabled={!canSlide}
            aria-disabled={slide.moving || !canSlide}
            onClick={() => navigate(-1)}
            type="button"
          />
          <button
            aria-label="Cặp game tiếp theo"
            className="random-game-nav random-game-next"
            disabled={!canSlide}
            aria-disabled={slide.moving || !canSlide}
            onClick={() => navigate(1)}
            type="button"
          />
        </div>
      </div>
    </section>
  );
}

type SlideState = { index: number; previous: number; direction: number; moving: boolean };

function RandomGamePanel({ games, slide, side }: { games: RandomGameData[]; slide: SlideState; side: "left" | "right" }) {
  function layerClass(index: number) {
    return index === slide.index ? "is-active" + (slide.moving ? " is-entering" : "")
      : index === slide.previous ? "is-outgoing" : "";
  }
  return <div className={`random-game-frame random-game-${side}`}>
    <article className="random-game-panel">
      <div className="random-game-art">
        {games.map((game, index) => <div key={game.id} className={`random-game-art-layer ${layerClass(index)}`} aria-hidden={index !== slide.index} inert={index !== slide.index}>
          <RandomGamePreview key={index === slide.index ? "active" : "idle"} game={game} active={index === slide.index} />
        </div>)}
      </div>
      <div className="random-game-copy-viewport">
        {games.map((game, index) => <div key={game.id} className={`random-game-copy ${layerClass(index)}`} inert={index !== slide.index} aria-hidden={index !== slide.index}>
          <RandomGameCopy game={game} />
        </div>)}
      </div>
    </article>
  </div>;
}

function RandomGameCopy({ game }: { game: RandomGameData }) {
  const dateValue = game.updated_at ?? game.created_at;
  const date = dateValue ? new Date(dateValue) : null;
  const updatedDate = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).format(date)
    : "chưa rõ ngày";
  const plainDescription = (game.description ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plainDescription.split(" ");
  const description = words.length > 25 ? words.slice(0, 25).join(" ") + "…" : plainDescription;
  return <>
    <h2>{game.name}</h2>
    <div className="random-game-action-row">
      <Link href={`/games/${game.slug}`}>Xem bản Việt hóa</Link>
      {description && <p className="random-game-description">{description}</p>}
    </div>
    <span>Phiên bản {game.version ?? "đang cập nhật"} · Cập nhật {updatedDate}</span>
  </>;
}

function toPairs(games: RandomGameData[]) {
  if (games.length < 2) {
    return [];
  }

  const pairs: Array<[RandomGameData, RandomGameData]> = [];

  for (let index = 0; index < games.length; index += 2) {
    const leftGame = games[index];
    const rightGame = games[index + 1] ?? games[0];

    if (leftGame.id !== rightGame.id) {
      pairs.push([leftGame, rightGame]);
    }
  }

  return pairs;
}
