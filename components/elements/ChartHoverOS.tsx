"use client";

import { osTypeClassName } from "@/lib/os-fonts";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ChartTooltipRow = { label: string; value: string; color?: string };

// The one dark readout every chart shares: the value leads, its name follows, a short stroke keys the series.
export function ChartTooltipCard({ title, rows, note }: { title?: string; rows: ChartTooltipRow[]; note?: string }) {
  return (
    <div className={`${osTypeClassName} min-w-36 max-w-72 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg ring-1 ring-white/10`}>
      {title && <p className="mb-1.5 font-medium leading-snug text-white/70">{title}</p>}
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            {row.color && <span aria-hidden="true" className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />}
            <span className="font-semibold tabular-nums">{row.value}</span>
            <span className="truncate text-white/70">{row.label}</span>
          </div>
        ))}
      </div>
      {note && <p className="mt-1.5 border-t border-white/15 pt-1.5 leading-snug text-white/70">{note}</p>}
    </div>
  );
}

// Wraps an HTML mark so hover and keyboard focus show the same dark readout; portaled so cards never clip it.
export default function ChartHoverOS({
  title,
  rows,
  note,
  label,
  className,
  style,
  children,
}: {
  title?: string;
  rows: ChartTooltipRow[];
  note?: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  function focus() {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPosition({ x: rect.left + rect.width / 2, y: rect.top });
  }

  const below = position ? position.y < 130 : false;
  const left = position ? Math.min(Math.max(position.x, 150), (typeof window === "undefined" ? 1200 : window.innerWidth) - 150) : 0;

  return (
    <>
      <div
        ref={ref}
        role="img"
        tabIndex={0}
        aria-label={label}
        className={`outline-none focus-visible:ring-2 focus-visible:ring-claude dark:focus-visible:ring-lime-bright ${className ?? ""}`}
        style={style}
        onPointerMove={(event) => setPosition({ x: event.clientX, y: event.clientY })}
        onPointerLeave={() => setPosition(null)}
        onFocus={focus}
        onBlur={() => setPosition(null)}
      >
        {children}
      </div>
      {position &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50"
            style={{ left, top: below ? position.y + 16 : position.y - 12, transform: below ? "translateX(-50%)" : "translate(-50%, -100%)" }}
          >
            <ChartTooltipCard title={title} rows={rows} note={note} />
          </div>,
          document.body,
        )}
    </>
  );
}
