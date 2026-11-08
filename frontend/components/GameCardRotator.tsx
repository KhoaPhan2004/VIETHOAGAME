"use client";

import GameCard from "@/components/GameCard";
import type { GameCardData } from "@/types/game";
import { useEffect, useMemo, useState } from "react";

type GameCardRotatorProps = { games: GameCardData[] };
const groupSize = 4;
const rotateDelay = 30000;
const curtainColumns = Array.from({ length: 8 }, (_, index) => index);

export default function GameCardRotator({ games }: GameCardRotatorProps) {
  const groups = useMemo(() => chunkGames(games, groupSize), [games]);
  const [activeGroup, setActiveGroup] = useState(0);
  const [phase, setPhase] = useState<"idle" | "covering" | "revealing">("idle");
  const currentGroup = groups.length ? activeGroup % groups.length : 0;

  useEffect(() => {
    if (groups.length <= 1) return;
    let swapTimer: number | undefined;
    let finishTimer: number | undefined;
    const intervalId = window.setInterval(() => {
      const next = () => setActiveGroup((current) => (current + 1) % groups.length);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        next();
        return;
      }
      setPhase("covering");
      // The last strip finishes covering at 400ms. Swap behind the curtain.
      swapTimer = window.setTimeout(() => {
        next();
        setPhase("revealing");
      }, 420);
      finishTimer = window.setTimeout(() => setPhase("idle"), 1100);
    }, rotateDelay);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(swapTimer);
      window.clearTimeout(finishTimer);
    };
  }, [groups.length]);

  if (!groups.length) return null;

  return <div className="game-grid game-rotator" data-transition={phase}>
    {Array.from({ length: Math.min(groupSize, games.length) }, (_, slot) => (
      <div className="game-rotator-slot" key={slot} data-empty={!groups[currentGroup][slot] ? "true" : undefined}>
        {groups.map((group, groupIndex) => group[slot] ? (
          <div className={`game-rotator-panel ${groupIndex === currentGroup ? "is-active" : ""}`} key={group[slot].id} inert={groupIndex !== currentGroup} aria-hidden={groupIndex !== currentGroup}>
            <GameCard game={group[slot]} />
          </div>
        ) : null)}
        {phase !== "idle" ? <div className={`game-rotator-curtain is-${phase}`} aria-hidden="true">
          {curtainColumns.map((column) => <span key={column} />)}
        </div> : null}
      </div>
    ))}
  </div>;
}

function chunkGames(games: GameCardData[], size: number) {
  const chunks: GameCardData[][] = [];
  for (let index = 0; index < games.length; index += size) chunks.push(games.slice(index, index + size));
  return chunks;
}
