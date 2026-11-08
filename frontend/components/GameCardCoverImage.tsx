"use client";

import Image from "next/image";
import { useState } from "react";

type GameCardCoverImageProps = {
  image: string | null;
  name: string;
  optimize?: boolean;
  sizes?: string;
};

export default function GameCardCoverImage({ image, name, optimize = false, sizes = "(max-width: 560px) 100vw, (max-width: 900px) 50vw, 340px" }: GameCardCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const [original, setOriginal] = useState(false);

  if (!image || failed) return <span>{name.slice(0, 2).toUpperCase()}</span>;

  // Only proxy this app's public uploads. Other image hosts retain their original behavior.
  let localSource: string | null = optimize && !original && image.startsWith("/game-media/") ? image : null;
  if (optimize && !original) {
    try {
      const url = new URL(image);
      if (url.origin === "http://127.0.0.1:8000" && url.pathname.startsWith("/storage/games/")) {
        localSource = "/game-media/" + url.pathname.slice("/storage/games/".length);
      }
    } catch { /* Relative and external images use the original source below. */ }
  }

  if (localSource) {
    return <Image src={localSource} alt={name} width={1280} height={720} sizes={sizes}
      loading="eager" decoding="async" onError={() => setOriginal(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image} alt={name} loading="eager" decoding="async" onError={() => setFailed(true)} />;
}
