"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const letters = "TKPKPIN".split("");
const columns = Array.from({ length: 8 }, (_, index) => index);

export default function SiteSplash() {
  const pathname = usePathname();
  const [state, setState] = useState<"hidden" | "showing">("showing");
  const isAdminPage = (pathname.startsWith("/admin") || pathname.startsWith("/quan-tri-"));

  useEffect(() => {
    if (isAdminPage) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionTimer = window.setTimeout(() => setState("hidden"), 0);

      return () => window.clearTimeout(reducedMotionTimer);
    }

    const hiddenTimer = window.setTimeout(() => setState("hidden"), 2400);

    return () => {
      window.clearTimeout(hiddenTimer);
    };
  }, [isAdminPage]);

  if (isAdminPage || state === "hidden") {
    return null;
  }

  return (
    <div className="site-splash">
      <div className="site-splash-curtain" aria-hidden="true">
        {columns.map((column) => (
          <span key={column} />
        ))}
      </div>
      <div className="site-splash-content" aria-label="TKPKPIN intro">
        <strong aria-label="TKPKPIN">
          {letters.map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
        </strong>
      </div>
    </div>
  );
}
