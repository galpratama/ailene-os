import type { ReactNode } from "react";

// Starts after the hero visual's reveal is underway so the cards read as riding in on it.
export const ENTER_DELAY = 0.55;

// CSS keyframes (biz-float-in / biz-float-y in globals.css) so the hero animates before, and without, hydration.
export default function HeroFloatCardBIZ({
  index,
  className,
  title,
  badge,
  children,
}: {
  index: number;
  className: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute motion-safe:animate-[biz-float-in_0.9s_cubic-bezier(0.22,1,0.36,1)_both] ${className}`}
      style={{ animationDelay: `${ENTER_DELAY + index * 0.18}s` }}
    >
      <div
        className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_24px_60px_-24px_rgba(1,30,22,0.35)] backdrop-blur-md motion-safe:animate-[biz-float-y_5s_ease-in-out_infinite] sm:p-5"
        style={{ animationDuration: `${5 + index * 1.3}s`, animationDelay: `${index * 0.7}s` }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-[13px] leading-snug font-semibold text-biz-copy sm:text-sm">{title}</p>
          {badge}
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function HeroScoreBarBIZ({
  label,
  value,
  display,
  tone,
  delay,
}: {
  label: string;
  value: number;
  display?: string;
  tone: string;
  delay: number;
}) {
  return (
    <div className="flex items-center gap-3 text-[13px] sm:text-sm">
      <span className="w-15 shrink-0 text-biz-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-biz-panel-soft">
        {/* Grows with scaleX rather than width, so the fill animates on the compositor. */}
        <div
          className={`h-full origin-left rounded-full motion-safe:animate-[biz-grow-x_1.1s_cubic-bezier(0.22,1,0.36,1)_both] ${tone}`}
          style={{ width: `${value}%`, animationDelay: `${delay}s` }}
        />
      </div>
      <span className="min-w-6 text-right font-semibold tabular-nums text-biz-ink">{display ?? value}</span>
    </div>
  );
}
