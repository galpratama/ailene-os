"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import {
  BarChart3,
  ClipboardCheck,
  Cog,
  MessageSquare,
  Radar,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

const stages: Array<{ num: string; icon: LucideIcon; title: string; desc: string; delay: number }> = [
  {
    num: "01",
    icon: Users,
    title: "Pre-Training Alignment",
    desc: "Diagnostic singkat dengan C-Level & champion internal — selaraskan target kompetensi dan divisi prioritas sebelum sesi pertama dimulai.",
    delay: 0.15,
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "8 Sesi Workshop, di-track LMS",
    desc: "Materi dari praktisi, bukan template. Setiap progres masuk LMS — jadi terlihat siapa aktif dan siapa masih butuh coaching.",
    delay: 0.55,
  },
  {
    num: "03",
    icon: Radar,
    title: "3 Bulan Adoption — Lintas Divisi",
    desc: "Follow-up jalan terus lewat LMS sampai AI jadi kebiasaan kerja, bukan cuma ramai di minggu pertama.",
    delay: 1,
  },
];

const divisions: Array<{ name: string; icon: LucideIcon; target: number; impact: string }> = [
  { name: "Marketing", icon: BarChart3, target: 88, impact: "10+ konten baru/minggu, tanpa tambah headcount" },
  { name: "HR", icon: Users, target: 76, impact: "Reporting payroll otomatis nyampe ke WhatsApp" },
  { name: "Finance", icon: TrendingUp, target: 82, impact: "Forecast harian, bukan lagi berminggu-minggu" },
  { name: "Sales", icon: Target, target: 90, impact: "Draft proposal personalized ke 20+ prospek sekaligus" },
  { name: "Operations", icon: Cog, target: 71, impact: "SOP akhirnya terdokumentasi, bukan cuma di kepala senior" },
  { name: "Customer Service", icon: MessageSquare, target: 85, impact: "Draft respon keluhan turun ke di bawah 2 menit" },
];

const adoptionScore = Math.round(divisions.reduce((sum, division) => sum + division.target, 0) / divisions.length);

const DASHBOARD_DELAY = 1.5;

const fadeUp: Variants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

// Layout numbers mirror the "ailene-journey-particleflow-v7" HTML reference 1:1.
const FLOW_HUB_CX = 590;
const FLOW_HUB_CY = 260;
const FLOW_HUB_R = 66;
const FLOW_NODE_CX = 62;
const FLOW_NODE_R = 27;
const FLOW_Y_SPACING = 88;
const FLOW_Y_START = 44;

function JourneyParticleFlow({ inView, shouldReduceMotion }: { inView: boolean; shouldReduceMotion: boolean }) {
  // Must start at 0 on both server and client's first render since `shouldReduceMotion` can differ between them.
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = shouldReduceMotion ? 0 : 1200;
    const start = performance.now() + (shouldReduceMotion ? 0 : DASHBOARD_DELAY * 1000);
    let raf = 0;
    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, Math.max(0, (now - start) / duration));
      setScore(Math.round(adoptionScore * (1 - (1 - progress) ** 3)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, shouldReduceMotion]);

  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 700 520"
        className="h-auto w-full max-w-170"
        role="img"
        aria-label={`Alur adopsi AI dari enam divisi menuju skor adopsi gabungan, ilustrasi ${adoptionScore} persen`}
      >
        {divisions.map((division, index) => {
          const nodeY = FLOW_Y_START + index * FLOW_Y_SPACING;
          const startX = FLOW_NODE_CX + FLOW_NODE_R + 5;
          const endX = FLOW_HUB_CX - FLOW_HUB_R - 5;
          const midX = (startX + endX) / 2;
          const pathId = `journey-flow-${index}`;
          const Icon = division.icon;

          return (
            <g key={division.name}>
              <path
                id={pathId}
                d={`M ${startX} ${nodeY} C ${midX} ${nodeY} ${midX} ${FLOW_HUB_CY} ${endX} ${FLOW_HUB_CY}`}
                className="stroke-biz-line"
                strokeWidth={1.5}
                fill="none"
              />

              {inView &&
                !shouldReduceMotion &&
                [0, 1, 2].map((k) => (
                  <circle key={k} r={3.6} className="fill-biz-lime" opacity={0}>
                    <animateMotion dur="3.2s" begin={`${index * 0.22 + k * (3.2 / 3)}s`} repeatCount="indefinite">
                      <mpath href={`#${pathId}`} xlinkHref={`#${pathId}`} />
                    </animateMotion>
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.06;0.9;1"
                      dur="3.2s"
                      begin={`${index * 0.22 + k * (3.2 / 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}

              <circle cx={FLOW_NODE_CX} cy={nodeY} r={FLOW_NODE_R} className="fill-white stroke-biz-line" strokeWidth={1.5} />
              <Icon x={FLOW_NODE_CX - 11} y={nodeY - 11} width={22} height={22} strokeWidth={1.7} className="text-biz-forest" />
              <title>{`${division.name} — ${division.impact}`}</title>

              <text x={FLOW_NODE_CX + FLOW_NODE_R + 14} y={nodeY + 5} className="fill-biz-ink text-[15px] font-semibold">
                {division.name}
              </text>
            </g>
          );
        })}

        <circle cx={FLOW_HUB_CX} cy={FLOW_HUB_CY} r={FLOW_HUB_R} className="fill-biz-forest" />

        {inView && !shouldReduceMotion && (
          <motion.circle
            cx={FLOW_HUB_CX}
            cy={FLOW_HUB_CY}
            fill="none"
            className="stroke-biz-lime"
            strokeWidth={2}
            initial={{ r: FLOW_HUB_R, opacity: 0 }}
            animate={{ r: [FLOW_HUB_R, FLOW_HUB_R, FLOW_HUB_R * 1.045], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <text x={FLOW_HUB_CX} y={FLOW_HUB_CY - 11} textAnchor="middle" className="fill-biz-lime font-mono text-[11px] tracking-[0.05em] uppercase">
          Adoption score
        </text>
        <text x={FLOW_HUB_CX} y={FLOW_HUB_CY + 18} textAnchor="middle" className="fill-white text-[26px] font-bold tracking-[-0.02em]">
          {score}%
        </text>
      </svg>
    </div>
  );
}

export default function LMSHomeBIZ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const shouldReduceMotion = !!useReducedMotion();

  return (
    <section id="lms" className="pt-9 pb-18 sm:pb-28">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <SectionHeaderHomeBIZ
          dark
          eyebrow="Perjalanan 3 bulan"
          title="Dari ruang meeting C-Level, sampai jadi kebiasaan kerja lintas divisi."
          copy={'Satu alur yang sama, tiga tahap. Setiap tahap punya PIC dan output yang jelas — bukan cuma "kelas AI" yang selesai lalu dilupakan.'}
        />

        <div ref={ref} className="mx-auto max-w-245">
          <div className="relative h-px w-full overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-biz-lime"
              initial={{ width: "0%" }}
              animate={inView ? { width: "100%" } : {}}
              transition={{ duration: shouldReduceMotion ? 0 : 1.4, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.5, 0, 0.15, 1] }}
            />
          </div>

          <div className="mt-8.5 grid gap-6 sm:grid-cols-3">
            {stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.title}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : stage.delay }}
                >
                  <span className="inline-block rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-biz-lime">
                    {stage.num}
                  </span>
                  <Icon size={26} strokeWidth={1.5} className="mt-3.5 text-white" />
                  <p className="mt-3 text-[16.5px] font-semibold tracking-[-0.02em] text-white">{stage.title}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.55] text-white/62">{stage.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-14 border-t border-dashed border-white/15 pt-8">
            <motion.div
              className="rounded-2xl border border-biz-line bg-biz-panel-soft p-5 sm:p-6"
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : DASHBOARD_DELAY }}
            >
              <JourneyParticleFlow inView={inView} shouldReduceMotion={shouldReduceMotion} />
              <p className="mt-3.5 text-center font-mono text-[10.5px] tracking-[0.06em] text-biz-muted uppercase">
                Pemakaian AI dari tiap divisi, mengalir terus ke LMS
              </p>
            </motion.div>

            <p className="mt-4 font-mono text-[10px] text-white/45 italic">
              Ilustrasi alur &amp; skor adopsi per divisi — bukan data klien aktual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
