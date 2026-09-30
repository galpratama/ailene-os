"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Starts after the hero visual's reveal is underway so the cards read as riding in on it.
export const ENTER_DELAY = 0.55;

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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute ${className}`}
      initial={reduceMotion ? false : { opacity: 0, x: 90, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay: ENTER_DELAY + index * 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5 + index * 1.3, repeat: Infinity, ease: "easeInOut", delay: index * 0.7 }}
        className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_24px_60px_-24px_rgba(1,30,22,0.35)] backdrop-blur-md sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-[13px] leading-snug font-semibold text-biz-copy sm:text-sm">{title}</p>
          {badge}
        </div>
        <div className="mt-3">{children}</div>
      </motion.div>
    </motion.div>
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
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-3 text-[13px] sm:text-sm">
      <span className="w-15 shrink-0 text-biz-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-biz-panel-soft">
        <motion.div
          className={`h-full rounded-full ${tone}`}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="min-w-6 text-right font-semibold tabular-nums text-biz-ink">{display ?? value}</span>
    </div>
  );
}
