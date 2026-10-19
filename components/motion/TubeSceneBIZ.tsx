"use client";

import { useEffect, useRef } from "react";
import type { TubeSceneMessage } from "./TubeSceneBIZ.worker";

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// The scene itself lives in TubeSceneBIZ.worker.ts; this side only owns the canvas and forwards size, visibility and pointer.
export default function TubeSceneBIZ() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.className = "size-full";
    host.appendChild(canvas);

    const worker = new Worker(new URL("./TubeSceneBIZ.worker.ts", import.meta.url), { type: "module" });
    const post = (message: TubeSceneMessage, transfer: Transferable[] = []) => worker.postMessage(message, transfer);
    const offscreen = canvas.transferControlToOffscreen();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    post(
      {
        type: "init",
        canvas: offscreen,
        width: host.clientWidth,
        height: host.clientHeight,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        reduceMotion,
        tubeColor: readToken("--biz-forest-light"),
        pulseColor: readToken("--biz-lime"),
      },
      [offscreen],
    );

    const resizeObserver = new ResizeObserver(() => {
      post({ type: "resize", width: host.clientWidth, height: host.clientHeight });
    });
    resizeObserver.observe(host);

    const visibility = new IntersectionObserver(([entry]) => {
      post({ type: "visible", visible: entry.isIntersecting });
    });
    visibility.observe(host);

    const onPointer = (event: PointerEvent) => {
      post({
        type: "pointer",
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      });
    };
    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointer);
      visibility.disconnect();
      resizeObserver.disconnect();
      worker.terminate();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none size-full" />;
}
