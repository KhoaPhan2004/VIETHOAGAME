"use client";

import { useState, type TouchEvent } from "react";
import GameCardCoverImage from "@/components/GameCardCoverImage";

export default function GameDetailGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const current = active % Math.max(images.length, 1);
  function move(direction: number) {
    setActive((index) => (index + direction + images.length) % images.length);
  }
  function endTouch(event: TouchEvent<HTMLDivElement>) {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
    setTouchStart(null);
  }
  if (!images.length) return <p className="gd-empty">Hình ảnh của game đang được cập nhật.</p>;

  return (
    <div className="gd-gallery" role="region" aria-label={`Ảnh ${name}`} aria-roledescription="bộ ảnh" tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={(event) => setTouchStart({ x: event.touches[0].clientX, y: event.touches[0].clientY })}
      onTouchEnd={endTouch} onTouchCancel={() => setTouchStart(null)}>
      <div className={`gd-gallery-stage ${images.length === 1 ? "gd-single-image" : ""}`}>
        {images.length > 1 ? <button type="button" className="gd-gallery-side" onClick={() => move(-1)} aria-label="Ảnh trước">
          <GameCardCoverImage image={images[(current - 1 + images.length) % images.length]} name={name} /><span aria-hidden="true">‹</span>
        </button> : null}
        <figure className="gd-gallery-main">
          <GameCardCoverImage key={images[current]} image={images[current]} name={`${name} — ảnh ${current + 1}`} />
          <figcaption aria-live="polite">{current + 1} / {images.length}</figcaption>
        </figure>
        {images.length > 1 ? <button type="button" className="gd-gallery-side" onClick={() => move(1)} aria-label="Ảnh tiếp theo">
          <GameCardCoverImage image={images[(current + 1) % images.length]} name={name} /><span aria-hidden="true">›</span>
        </button> : null}
      </div>
      {images.length > 1 ? <div className="gd-gallery-dots" aria-label="Chọn ảnh">
        {images.map((image, index) => <button type="button" key={`${image}-${index}`} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={current === index} onClick={() => setActive(index)} />)}
      </div> : null}
    </div>
  );
}
