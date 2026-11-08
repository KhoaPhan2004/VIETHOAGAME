"use client";

import { useEffect, useState } from "react";

export const GAME_BACKGROUND_EVENT = "game-background-change";

type StoredBackground = {
  image: string;
  name?: string | null;
};

type SiteBackgroundProps = {
  image?: string | null;
  name?: string | null;
};

export default function SiteBackground({ image, name }: SiteBackgroundProps) {
  const [background, setBackground] = useState<StoredBackground | null>(() =>
    image ? { image, name } : null,
  );

  useEffect(() => {
    function handleBackgroundChange(event: Event) {
      const nextBackground = (event as CustomEvent<StoredBackground>).detail;
      setBackground(nextBackground);
    }

    window.addEventListener(GAME_BACKGROUND_EVENT, handleBackgroundChange);

    return () => {
      window.removeEventListener(GAME_BACKGROUND_EVENT, handleBackgroundChange);
    };
  }, []);

  if (!background?.image) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="site-background"
      style={{ backgroundImage: `url("${background.image}")` }}
      title={background.name ?? undefined}
    />
  );
}
