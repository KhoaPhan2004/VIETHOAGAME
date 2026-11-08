"use client";

import type { ReactNode } from "react";

export default function GameDownloadButton({ slug, className, children }: { slug: string; className: string; children: ReactNode }) {
  const csrf = typeof document === "undefined" ? "" : document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";
  return <form action={`/games/${encodeURIComponent(slug)}/download`} method="post" style={{ display: "contents" }}>
    <input type="hidden" name="_token" value={csrf} />
    <button className={className} type="submit">{children}</button>
  </form>;
}
