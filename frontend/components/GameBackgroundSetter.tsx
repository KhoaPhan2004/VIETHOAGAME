"use client";

import { useEffect } from "react";
import { GAME_BACKGROUND_EVENT } from "@/components/SiteBackground";

type GameBackgroundSetterProps = {
  image?: string | null;
  name?: string | null;
};

export default function GameBackgroundSetter({ image, name }: GameBackgroundSetterProps) {
  useEffect(() => {
    if (!image) {
      return;
    }

    const background = { image, name };

    window.dispatchEvent(new CustomEvent(GAME_BACKGROUND_EVENT, { detail: background }));
  }, [image, name]);

  return null;
}
