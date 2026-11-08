import type { CSSProperties } from "react";

export default function AdminSnow() {
  return <div className="admin-snow" aria-hidden="true">
    {Array.from({ length: 56 }, (_, index) => <span key={index} style={{
      "--snow-left": `${(index * 37 + 3) % 100}%`,
      "--snow-size": `${2 + index % 3}px`,
      "--snow-duration": `${24 + index % 19}s`,
      "--snow-delay": `${-(index * 13 % (24 + index % 19))}s`,
      "--snow-drift": `${index % 2 ? -22 : 26}px`,
    } as CSSProperties} />)}
  </div>;
}
