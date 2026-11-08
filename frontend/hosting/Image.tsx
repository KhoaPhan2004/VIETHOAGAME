import type { ImgHTMLAttributes } from "react";
export default function Image({ src, priority, fill, quality: _quality, unoptimized: _unoptimized, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string; priority?: boolean; fill?: boolean; quality?: number; unoptimized?: boolean }) {
  const local = src.startsWith("/game-media/");
  return <img {...props} src={src} srcSet={local ? [480, 640, 960, 1280].map(w => `${src}?w=${w} ${w}w`).join(", ") : props.srcSet}
    loading={priority ? "eager" : props.loading} decoding="async" style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...props.style } : props.style} />;
}
