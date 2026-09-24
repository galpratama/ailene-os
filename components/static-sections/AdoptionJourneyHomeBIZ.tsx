"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Cog,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const divisions: Array<{
  name: string;
  icon: LucideIcon;
  target: number;
  impact: string;
}> = [
  {
    name: "Marketing",
    icon: BarChart3,
    target: 88,
    impact: "10+ konten baru/minggu, tanpa tambah headcount",
  },
  {
    name: "HR",
    icon: Users,
    target: 76,
    impact: "Reporting payroll otomatis nyampe ke WhatsApp",
  },
  {
    name: "Finance",
    icon: TrendingUp,
    target: 82,
    impact: "Forecast harian, bukan lagi berminggu-minggu",
  },
  {
    name: "Sales",
    icon: Target,
    target: 90,
    impact: "Draft proposal personalized ke 20+ prospek sekaligus",
  },
  {
    name: "Operations",
    icon: Cog,
    target: 71,
    impact: "SOP akhirnya terdokumentasi, bukan cuma di kepala senior",
  },
  {
    name: "Customer Service",
    icon: MessageSquare,
    target: 85,
    impact: "Draft respon keluhan turun ke di bawah 2 menit",
  },
];

const adoptionScore = Math.round(
  divisions.reduce((sum, division) => sum + division.target, 0) /
    divisions.length,
);

const DASHBOARD_DELAY = 1.5;
const FLOW_HUB_CX = 590;
const FLOW_HUB_CY = 260;
const FLOW_HUB_R = 66;
const FLOW_NODE_CX = 62;
const FLOW_NODE_R = 27;
const FLOW_Y_SPACING = 88;
const FLOW_Y_START = 44;

function JourneyParticleFlow({
  inView,
  shouldReduceMotion,
}: {
  inView: boolean;
  shouldReduceMotion: boolean;
}) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = shouldReduceMotion ? 0 : 1200;
    const start =
      performance.now() + (shouldReduceMotion ? 0 : DASHBOARD_DELAY * 1000);
    let raf = 0;
    const tick = (now: number) => {
      const progress =
        duration === 0 ? 1 : Math.min(1, Math.max(0, (now - start) / duration));
      setScore(Math.round(adoptionScore * (1 - (1 - progress) ** 3)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, shouldReduceMotion]);

  return (
    <svg
      viewBox="0 0 700 520"
      className="h-auto w-full"
      role="img"
      aria-label={`Alur adopsi AI dari enam divisi menuju skor adopsi gabungan, ilustrasi ${adoptionScore} persen`}
    >
      {divisions.map((division, index) => {
        const nodeY = FLOW_Y_START + index * FLOW_Y_SPACING;
        const startX = FLOW_NODE_CX + FLOW_NODE_R + 5;
        const endX = FLOW_HUB_CX - FLOW_HUB_R - 5;
        const midX = (startX + endX) / 2;
        const pathId = `adoption-flow-${index}`;
        const Icon = division.icon;

        return (
          <g key={division.name}>
            <path
              id={pathId}
              d={`M ${startX} ${nodeY} C ${midX} ${nodeY} ${midX} ${FLOW_HUB_CY} ${endX} ${FLOW_HUB_CY}`}
              className="stroke-white/20"
              strokeWidth={1.5}
              fill="none"
            />

            {inView &&
              !shouldReduceMotion &&
              [0, 1, 2].map((particle) => (
                <circle
                  key={particle}
                  r={3.6}
                  className="fill-biz-lime"
                  opacity={0}
                >
                  <animateMotion
                    dur="3.2s"
                    begin={`${index * 0.22 + particle * (3.2 / 3)}s`}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.06;0.9;1"
                    dur="3.2s"
                    begin={`${index * 0.22 + particle * (3.2 / 3)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}

            <circle
              cx={FLOW_NODE_CX}
              cy={nodeY}
              r={FLOW_NODE_R}
              className="fill-white stroke-white/25"
              strokeWidth={1.5}
            />
            <Icon
              x={FLOW_NODE_CX - 11}
              y={nodeY - 11}
              width={22}
              height={22}
              strokeWidth={1.7}
              className="text-biz-forest"
            />
            <title>{`${division.name} — ${division.impact}`}</title>
            <text
              x={FLOW_NODE_CX + FLOW_NODE_R + 14}
              y={nodeY + 5}
              className="fill-white/80 text-[15px] font-semibold"
            >
              {division.name}
            </text>
          </g>
        );
      })}

      <circle
        cx={FLOW_HUB_CX}
        cy={FLOW_HUB_CY}
        r={FLOW_HUB_R}
        className="fill-biz-lime"
      />

      {inView && !shouldReduceMotion && (
        <motion.circle
          cx={FLOW_HUB_CX}
          cy={FLOW_HUB_CY}
          fill="none"
          className="stroke-white"
          strokeWidth={2}
          initial={{ r: FLOW_HUB_R, opacity: 0 }}
          animate={{
            r: [FLOW_HUB_R, FLOW_HUB_R, FLOW_HUB_R * 1.045],
            opacity: [0, 0.4, 0],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <text
        x={FLOW_HUB_CX}
        y={FLOW_HUB_CY - 11}
        textAnchor="middle"
        className="fill-biz-forest font-mono text-[11px] tracking-[0.05em] uppercase"
      >
        Adoption score
      </text>
      <text
        x={FLOW_HUB_CX}
        y={FLOW_HUB_CY + 18}
        textAnchor="middle"
        className="fill-biz-forest text-[26px] font-bold tracking-[-0.02em]"
      >
        {score}%
      </text>
    </svg>
  );
}

export default function AdoptionJourneyHomeBIZ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const shouldReduceMotion = !!useReducedMotion();

  return (
    <div
      ref={ref}
      className="min-w-0 rounded-2xl border border-white/15 bg-black/10 p-3 sm:p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      >
        <JourneyParticleFlow
          inView={inView}
          shouldReduceMotion={shouldReduceMotion}
        />
      </motion.div>
      <p className="mt-2 text-center font-mono text-[10px] tracking-[0.06em] text-white/45 uppercase">
        Pemakaian AI dari tiap divisi, mengalir terus ke LMS
      </p>
    </div>
  );
}
