"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

export default function RouteViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const solid = pathname === "/about" || (pathname.startsWith("/admin") || pathname.startsWith("/quan-tri-")) || /^\/games\/[^/]+\/?$/.test(pathname);

  const lastPath = useRef(pathname);
  const pendingEntry = useRef(false);

  useLayoutEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      pendingEntry.current = true;
    }
    const viewport = ref.current;
    if (!viewport) return;
    let animations: Animation[] = [];

    function animateReadyContent() {
      if (!viewport || !pendingEntry.current || viewport.querySelector(".route-loading")) return;
      const main = Array.from(viewport.querySelectorAll("main")).find((element) => element.getClientRects().length > 0);
      if (!main) return;
      pendingEntry.current = false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      animations = Array.from(main.children).flatMap((element) => {
        if (!(element instanceof HTMLElement) || getComputedStyle(element).position === "fixed" || !element.getClientRects().length) return [];
        // Animate live elements without fading a parent of frosted-glass boxes.
        // Parent opacity and snapshot layers interrupt their backdrop sampling.
        const textOnly = /^(H1|H2|H3|P)$/.test(element.tagName);
        return [element.animate([
          { translate: "0 6px", ...(textOnly ? { opacity: 0.7 } : {}) },
          { translate: "0 0", ...(textOnly ? { opacity: 1 } : {}) },
        ], { duration: 240, easing: "cubic-bezier(.22, 1, .36, 1)" })];
      });
    }

    animateReadyContent();
    const observer = new MutationObserver(animateReadyContent);
    observer.observe(viewport, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);


  useLayoutEffect(() => {
    const viewport = ref.current;
    if (!viewport) return;
    const header = document.querySelector("header.site-header");
    function measure() {
      if (!viewport) return;
      if (header) viewport.style.setProperty("--site-header-height", `${header.getBoundingClientRect().height}px`);
      // Suspense temporarily replaces a tall page with its short loading fallback.
      // Keep the last settled height until the destination content is ready.
      if (!viewport.querySelector(".route-loading")) {
        viewport.style.setProperty("--route-content-height", `${viewport.getBoundingClientRect().height}px`);
      }
    }
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    if (header) observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="route-viewport" data-solid-background={solid ? "true" : undefined}>{children}</div>;
}
