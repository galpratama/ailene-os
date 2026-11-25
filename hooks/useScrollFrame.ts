"use client";

import { useEffect, useRef, type RefObject } from "react";

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Calls onFrame once per animation frame while the element is near the viewport, never on idle scrolls elsewhere.
export function useScrollFrame<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onFrame: (rect: DOMRect, viewportHeight: number) => void,
  enabled = true
) {
  const frameRef = useRef(onFrame);
  useEffect(() => {
    frameRef.current = onFrame;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || prefersReducedMotion()) return;

    let active = false;
    let queued = 0;
    const run = () => {
      queued = 0;
      frameRef.current(element.getBoundingClientRect(), window.innerHeight);
    };
    const queue = () => {
      if (active && !queued) queued = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        queue();
      },
      { rootMargin: "25% 0px" }
    );
    observer.observe(element);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(queued);
    };
  }, [ref, enabled]);
}
