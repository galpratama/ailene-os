"use client";

import { useEffect, useRef } from "react";

// Data-stream bands sliding out through the left and right edges, in the style of composio.dev's hero.
// Colors come from the --biz-stream-* tokens, exposed on the canvas as --stream-* (see its className).
// Lines are electric blue; the dim fill carries the band's tint. Teal lines are the occasional accent.
const TINTS = [
  { token: "--stream-blue", weight: 6 },
  { token: "--stream-cyan", weight: 2 },
  { token: "--stream-violet", weight: 2 },
];
const LINE_TOKEN = "--stream-blue";
const ACCENT_TOKEN = "--stream-teal";

// Each 6px column is a dim 4px fill plus a bright 2px line; bands move one whole column at a time.
const COLUMN = 6;
const LINE = 2;
const FILL_ALPHA = 0.42;
const ACCENT_ALPHA = 0.7;

interface Band {
  side: 1 | -1;
  // Vertical center at the band's inner tip; columns follow the slope outward from there.
  y: number;
  thickness: number;
  slope: number;
  // Inner tip's starting distance from the edge, and how many columns trail behind it toward the edge.
  tip: number;
  columns: number;
  floating: boolean;
  // px/s the band slides outward (negative slides inward, 0 holds) after an initial pause.
  speed: number;
  hold: number;
  tint: string;
  line: string;
  alpha: number;
  born: number;
  life: number;
  // Teal lines within this distance of the edge, for a glow where the band exits.
  accent: number;
  shade: number[];
}

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

export default function StreamBackgroundBIZ() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const styles = getComputedStyle(canvas);
    const read = (token: string) => styles.getPropertyValue(token).trim();
    const tints = TINTS.map((tint) => ({ ...tint, color: read(tint.token) }));
    const lineColor = read(LINE_TOKEN);
    const accentColor = read(ACCENT_TOKEN);
    const totalWeight = tints.reduce((sum, tint) => sum + tint.weight, 0);
    const pickTint = () => {
      let roll = Math.random() * totalWeight;
      for (const tint of tints) {
        roll -= tint.weight;
        if (roll <= 0) return tint;
      }
      return tints[0];
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let bands: Band[] = [];
    const snap = (value: number) => Math.round(value * dpr) / dpr;

    const spawn = (side: 1 | -1, born: number): Band => {
      const tint = pickTint();
      // On narrow (mobile) cards the copy spans nearly the full width, so bands stay shorter and dimmer.
      const narrow = width < 640;
      const reach = width * (narrow ? 0.2 : 0.24);
      const tip =
        Math.round((reach * (0.3 + Math.random() * 0.7)) / COLUMN) * COLUMN;
      const floating = Math.random() < 0.2;
      const ghost = Math.random() < 0.2;
      // Attached bands run past the edge so they stay attached while sliding out.
      const length = floating ? tip * (0.3 + Math.random() * 0.4) : tip + reach;
      const columns = Math.ceil(length / COLUMN);
      const motion = Math.random();
      return {
        side,
        y: Math.random() * height,
        thickness: height * (0.03 + Math.random() * 0.09) * (ghost ? 1.8 : 1),
        slope: Math.random() < 0.4 ? 0 : (Math.random() - 0.5) * 0.5,
        tip,
        columns,
        floating,
        speed:
          motion < 0.6
            ? 100 + Math.random() * 160
            : motion < 0.7
              ? -(40 + Math.random() * 60)
              : 0,
        hold: Math.random() * 600,
        tint: tint.color,
        // A quarter of the cyan bands carry teal lines, the green-lit blocks in the reference.
        line:
          tint.token === "--stream-cyan" && Math.random() < 0.25
            ? accentColor
            : lineColor,
        alpha:
          (ghost ? 0.35 : 0.85 + Math.random() * 0.15) * (narrow ? 0.7 : 1),
        born,
        life: 1400 + Math.random() * 1400,
        accent:
          !floating && !ghost && Math.random() < 0.3
            ? (3 + Math.floor(Math.random() * 5)) * COLUMN
            : 0,
        shade: Array.from({ length: columns }, () => 0.7 + Math.random() * 0.3),
      };
    };

    // Position of the inner tip, stepping one whole column at a time once the hold is over.
    const tipAt = (band: Band, age: number) => {
      const moving = Math.max(0, age - band.hold) / 1000;
      return Math.floor((band.tip - band.speed * moving) / COLUMN) * COLUMN;
    };

    // Seed mid-life so the first frame (and the reduced-motion still) is already full.
    const seed = (now: number) => {
      const perSide = Math.min(20, Math.max(7, Math.round(height / 45)));
      bands = [];
      for (const side of [1, -1] as const) {
        for (let i = 0; i < perSide; i++) {
          const band = spawn(side, now);
          band.born = now - Math.random() * band.life * 0.6;
          bands.push(band);
        }
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const band of bands) {
        const age = now - band.born;
        if (age < 0) continue;
        const presence =
          smoothstep(0, 350, age) *
          (1 - smoothstep(band.life - 600, band.life, age));
        if (presence <= 0) continue;
        const tip = tipAt(band, age);

        for (let j = 0; j < band.columns; j++) {
          // Column j sits j columns behind the tip, toward the edge.
          const distance = tip - j * COLUMN;
          if (distance < 0) break;
          if (distance > width / 2) continue;
          const soft = Math.min(1, (j + 1) / 4);
          const tail = band.floating ? Math.min(1, (band.columns - j) / 3) : 1;
          const alpha = band.alpha * presence * soft * tail * band.shade[j];
          const x = band.side === 1 ? distance : width - distance - COLUMN;
          const top = snap(
            band.y + band.slope * j * COLUMN - band.thickness / 2
          );

          ctx.fillStyle = band.tint;
          ctx.globalAlpha = alpha * FILL_ALPHA;
          ctx.fillRect(
            band.side === 1 ? x : x + LINE,
            top,
            COLUMN - LINE,
            band.thickness
          );
          const accent = distance < band.accent;
          ctx.fillStyle = accent ? accentColor : band.line;
          ctx.globalAlpha = accent ? alpha * ACCENT_ALPHA : alpha;
          ctx.fillRect(
            band.side === 1 ? x + COLUMN - LINE : x,
            top,
            LINE,
            band.thickness
          );
        }
      }
      ctx.globalAlpha = 1;
    };

    // Replace bands that slid fully off the edge or ran out their life, staggered so edges never pulse in sync.
    const step = (now: number) => {
      bands = bands.map((band) => {
        const age = now - band.born;
        const gone = age > band.life || (age > 0 && tipAt(band, age) < 0);
        return gone ? spawn(band.side, now + Math.random() * 300) : band;
      });
    };

    let raf = 0;
    let inView = true;
    const frame = (now: number) => {
      step(now);
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (inView && !reduceMotion.matches) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const now = performance.now();
      seed(now);
      draw(now);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    viewObserver.observe(canvas);
    reduceMotion.addEventListener("change", sync);
    resize();
    sync();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      reduceMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    // Tailwind only emits tokens a class references, so the canvas re-exposes the stream colors for the script to read.
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full [--stream-blue:var(--color-biz-stream-blue)] [--stream-cyan:var(--color-biz-stream-cyan)] [--stream-teal:var(--color-biz-stream-teal)] [--stream-violet:var(--color-biz-stream-violet)]"
    />
  );
}
