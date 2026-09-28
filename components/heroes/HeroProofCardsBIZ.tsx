"use client";

import Label from "@/components/labels/Label";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Starts after the tube's reveal is underway so the cards read as riding in on it.
const ENTER_DELAY = 0.55;

function FloatCard({
  index,
  className,
  title,
  children,
}: {
  index: number;
  className: string;
  title: string;
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
          <Label variant="gray" className="shrink-0 font-medium">
            Ilustrasi
          </Label>
        </div>
        <div className="mt-3">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function ScoreBar({ label, value, tone, delay }: { label: string; value: number; tone: string; delay: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-3 text-[13px] sm:text-sm">
      <span className="w-15 text-biz-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-biz-panel-soft">
        <motion.div
          className={`h-full rounded-full ${tone}`}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-6 text-right font-semibold tabular-nums text-biz-ink">{value}</span>
    </div>
  );
}

export default function HeroProofCardsBIZ() {
  return (
    <div className="pointer-events-none relative size-full">
      <FloatCard index={0} title="AI Readiness · Divisi Finance" className="top-[3%] left-[4%] w-62 sm:w-72 lg:top-[9%] lg:left-0">
        <div className="flex flex-col gap-2.5">
          <ScoreBar label="Sebelum" value={38} tone="bg-biz-dot" delay={ENTER_DELAY + 0.6} />
          <ScoreBar label="Sesudah" value={72} tone="bg-biz-forest-mid" delay={ENTER_DELAY + 0.9} />
        </div>
      </FloatCard>

      <FloatCard index={1} title="Prompt library · Marketing" className="top-[40%] right-[4%] w-52 max-sm:hidden sm:w-60 lg:max-xl:hidden lg:top-[57%] lg:right-[3%]">
        <p className="text-5xl leading-none font-medium tracking-[-0.04em] text-biz-ink">24</p>
        <p className="mt-2 text-[13px] text-biz-muted sm:text-sm">prompt siap pakai milik tim</p>
      </FloatCard>

      <FloatCard index={2} title="Workflow baru, dipakai mingguan" className="bottom-[5%] left-[4%] w-64 sm:w-76 lg:bottom-[6%] lg:left-[2%]">
        <ul className="flex flex-col gap-2 text-[13px] text-biz-copy sm:text-sm">
          {["Rekap penjualan untuk rapat Senin", "Notulen rapat jadi daftar tugas"].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-biz-check text-biz-forest-mid">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </FloatCard>
    </div>
  );
}
