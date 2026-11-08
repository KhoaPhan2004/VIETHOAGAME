"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const motionGroups = [
  [".about-introduction > .about-picture, .about-developer > .about-picture", "left"],
  [".about-introduction > .about-copy, .about-developer > .about-copy", "right"],
  [".about-purpose, .about-values-heading, .about-compass, .about-library, .about-youtube", "up"],
  [".about-values-layout > .about-copy:first-child", "left"],
  [".about-values-layout > .about-copy:last-child", "right"],
  [".about-features > .about-copy > .about-kicker, .about-features > .about-copy > h2, .about-feature-list > li", "up"],
] as const;

export default function AboutMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = motionGroups.flatMap(([selector, direction]) =>
      Array.from(root.querySelectorAll<HTMLElement>(selector), (element) => {
        element.dataset.aboutMotion = direction;
        return { element, direction, top: 0, height: 0, displayed: Number.NaN };
      }),
    );
    let frame = 0;
    let needsMeasure = true;
    let lastTime = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    function update(now = performance.now()) {
      // Time-based damping fills the gaps between mouse-wheel notches.
      // Keep following the target after the last scroll event, then stop.
      const elapsed = lastTime ? Math.min(now - lastTime, 64) : 16.67;
      const blend = 1 - Math.exp(-elapsed / 85);
      lastTime = now;
      let settling = false;
      frame = 0;
      if (needsMeasure) {
        // offsetTop is unaffected by our transforms, so scrolling cannot
        // feed the animated position back into the reveal calculation.
        for (const target of targets) {
          let top = 0;
          let parent: HTMLElement | null = target.element;
          while (parent) {
            top += parent.offsetTop;
            parent = parent.offsetParent as HTMLElement | null;
          }
          target.top = top;
          target.height = target.element.offsetHeight;
        }
        root!.style.setProperty("--about-snow-height", `${root!.offsetHeight + 36}px`);
        needsMeasure = false;
      }
      const viewport = window.innerHeight;
      const scrollY = window.scrollY;
      for (const target of targets) {
        const { element, direction, top, height } = target;
        const screenTop = top - scrollY;
        const screenBottom = screenTop + height;
        const entering = clamp((viewport * .93 - screenTop) / (viewport * .35));
        const leaving = clamp((screenBottom - viewport * .08) / (viewport * .24));
        const immediate = preference.matches || element.contains(document.activeElement);
        const progress = immediate
          ? 1 : Math.min(entering, leaving);
        const goal = progress * progress * (3 - 2 * progress);
        if (immediate || Number.isNaN(target.displayed)) {
          target.displayed = goal;
        } else {
          target.displayed += (goal - target.displayed) * blend;
          if (Math.abs(goal - target.displayed) < .0005) {
            target.displayed = goal;
          } else {
            settling = true;
          }
        }
        const eased = target.displayed;
        const distance = (1 - eased) * (direction === "up" ? 64 : 90);
        element.style.setProperty("--about-reveal-opacity", String(eased));
        element.style.setProperty("--about-reveal-x", `${direction === "left" ? -distance : direction === "right" ? distance : 0}px`);
        element.style.setProperty("--about-reveal-y", `${direction === "up" ? distance : 0}px`);
      }
      root!.dataset.motionReady = "true";
      if (settling) frame = requestAnimationFrame(update);
      else lastTime = 0;
    }
    function schedule() {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(update);
      }
    }
    function measure() {
      needsMeasure = true;
      schedule();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    targets.forEach(({ element }) => observer.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    root.addEventListener("focusin", schedule);
    root.addEventListener("focusout", schedule);
    preference.addEventListener("change", schedule);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      root.removeEventListener("focusin", schedule);
      root.removeEventListener("focusout", schedule);
      preference.removeEventListener("change", schedule);
      delete root.dataset.motionReady;
      targets.forEach(({ element }) => {
        delete element.dataset.aboutMotion;
        ["--about-reveal-opacity", "--about-reveal-x", "--about-reveal-y"].forEach((name) => element.style.removeProperty(name));
      });
    };
  }, []);

  return (
    <article className="about-story" ref={rootRef}>
      <div className="footer-snow about-snow" aria-hidden="true">
        {Array.from({ length: 56 }, (_, index) => (
          <span key={index} style={{
            "--snow-left": `${(index * 37 + 3) % 100}%`,
            "--snow-size": `${2 + index % 3}px`,
            "--snow-duration": `${36 + index % 23}s`,
            "--snow-delay": `${-(index * 13 % (36 + index % 23))}s`,
            "--snow-drift": `${index % 2 ? -22 : 26}px`,
          } as CSSProperties} />
        ))}
      </div>
      {children}
    </article>
  );
}
