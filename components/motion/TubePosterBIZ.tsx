"use client";

import { useEffect, useRef, useState } from "react";

// Still frames of TubeSceneBIZ (re-capture if its design changes), framed like the live scene: wide boxes pin right, narrow ones center.
const POSTERS = {
  wide: { src: "/biz/tube-wide.webp", width: 1749, height: 957, className: "right-0" },
  narrow: { src: "/biz/tube-narrow.webp", width: 696, height: 960, className: "left-1/2 -translate-x-1/2" },
} as const;

export default function TubePosterBIZ() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<keyof typeof POSTERS | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => {
      setLayout(host.clientWidth / host.clientHeight > 1.2 ? "wide" : "narrow");
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const poster = layout && POSTERS[layout];

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none relative size-full overflow-hidden">
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element -- decorative, already sized; next/image adds nothing here
        <img
          src={poster.src}
          alt=""
          width={poster.width}
          height={poster.height}
          decoding="async"
          className={`absolute top-0 h-full w-auto max-w-none motion-safe:animate-[biz-fade-in_0.8s_ease-out_both] ${poster.className}`}
        />
      )}
    </div>
  );
}
