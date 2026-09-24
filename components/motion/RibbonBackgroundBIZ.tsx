"use client";

import { useEffect, useRef } from "react";

// Drawn in a 1200x1200 box sliced to the card: desktop sees the middle band, mobile sees it rotated 90deg.
// Each ribbon's frames share one path command structure so SMIL can morph between them.
const ARCH_FRAMES = [
  "M 560 1140 C 290 870 40 760 30 560 C 20 400 110 280 380 80",
  "M 510 1150 C 240 860 10 730 0 540 C -10 380 80 260 340 70",
  "M 590 1130 C 330 880 70 790 60 590 C 50 420 150 300 410 90",
];

const LOOP_FRAMES = [
  "M 640 120 C 980 220 1260 430 1200 700 C 1150 920 930 960 890 830 C 850 700 1060 650 1120 790 C 1180 930 1080 1080 900 1180",
  "M 620 110 C 970 230 1280 450 1210 710 C 1160 930 920 950 880 820 C 850 690 1070 660 1130 800 C 1190 940 1070 1070 880 1170",
  "M 660 130 C 990 210 1240 420 1190 690 C 1140 910 940 970 900 840 C 860 710 1050 640 1110 780 C 1170 920 1090 1090 920 1190",
];

// On the portrait mobile card the composition is mirrored and rotated so ribbons frame the text top and bottom.
const ARCH_MOBILE =
  "max-md:[transform:translate(600px,480px)_scale(-1,1)_rotate(90deg)_scale(1.05)_translate(-600px,-600px)]";
const LOOP_MOBILE =
  "max-md:[transform:translate(600px,720px)_scale(-1,1)_rotate(90deg)_scale(1.3)_translate(-600px,-600px)]";

const EASE_IN_OUT = "0.45 0 0.55 1";

function Morph({ frames, dur }: { frames: string[]; dur: string }) {
  return (
    <animate
      attributeName="d"
      dur={dur}
      repeatCount="indefinite"
      calcMode="spline"
      values={[...frames, frames[0]].join(";")}
      keyTimes="0;0.33;0.67;1"
      keySplines={Array(3).fill(EASE_IN_OUT).join(";")}
    />
  );
}

export default function RibbonBackgroundBIZ() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Pause the SMIL timeline off-screen and for reduced-motion users.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    const sync = () => {
      if (inView && !reduceMotion.matches) svg.unpauseAnimations();
      else svg.pauseAnimations();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(svg);
    reduceMotion.addEventListener("change", sync);
    sync();

    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 1200"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
      >
        <g className={LOOP_MOBILE}>
          <path
            d={LOOP_FRAMES[0]}
            fill="none"
            stroke="white"
            strokeOpacity="0.14"
            strokeWidth={100}
            strokeLinecap="round"
          >
            <Morph frames={LOOP_FRAMES} dur="18s" />
          </path>
        </g>

        <g className={ARCH_MOBILE}>
          <path
            d={ARCH_FRAMES[0]}
            fill="none"
            stroke="white"
            strokeOpacity="0.09"
            strokeWidth={220}
            strokeLinecap="round"
          >
            <Morph frames={ARCH_FRAMES} dur="14s" />
          </path>
        </g>
      </svg>

      <div className="absolute inset-0 bg-radial from-white/6 to-transparent to-70%" />
    </div>
  );
}
