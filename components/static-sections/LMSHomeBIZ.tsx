"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import {
  BarChart3,
  Check,
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

function ScoreRing({ inView, shouldReduceMotion }: { inView: boolean; shouldReduceMotion: boolean }) {
  const [display, setDisplay] = useState(shouldReduceMotion ? adoptionScore : 0);
  const r = 30;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    if (!inView || shouldReduceMotion) return;
    const duration = 1400;
    let raf = 0;
    const start = performance.now() + DASHBOARD_DELAY * 1000;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      setDisplay(Math.round(adoptionScore * (1 - (1 - progress) ** 3)));
      if (now < start + duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, shouldReduceMotion]);

  return (
    <div className="relative size-19 shrink-0">
      <svg viewBox="0 0 76 76" className="size-full -rotate-90">
        <circle cx="38" cy="38" r={r} strokeWidth="7" className="fill-none stroke-biz-panel-soft" />
        <motion.circle
          cx="38"
          cy="38"
          r={r}
          strokeWidth="7"
          strokeLinecap="round"
          className="fill-none stroke-biz-lime"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: circumference - (circumference * adoptionScore) / 100 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 1.4, delay: shouldReduceMotion ? 0 : DASHBOARD_DELAY, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[15px] font-bold tracking-[-0.02em] text-biz-forest">{display}%</div>
    </div>
  );
}

function DivisionRow({
  division,
  index,
  inView,
  shouldReduceMotion,
}: {
  division: (typeof divisions)[number];
  index: number;
  inView: boolean;
  shouldReduceMotion: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "done">(shouldReduceMotion ? "done" : "loading");
  const barDelay = DASHBOARD_DELAY + index * 0.15;
  const barDuration = 0.95;

  useEffect(() => {
    if (!inView || shouldReduceMotion) return;
    const timer = setTimeout(() => setStatus("done"), (barDelay + barDuration) * 1000);
    return () => clearTimeout(timer);
  }, [inView, shouldReduceMotion, barDelay]);

  const Icon = division.icon;

  return (
    <div className="grid grid-cols-[18px_100px_1fr_60px] items-center gap-3 border-b border-biz-line py-2.5 last:border-0 sm:grid-cols-[20px_128px_1fr_72px]">
      <Icon size={16} className="text-biz-forest-light" />
      <span className="truncate text-[13px] font-semibold text-biz-ink">{division.name}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-biz-panel-soft">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-biz-forest),var(--color-biz-forest-light))]"
          initial={{ width: "0%" }}
          animate={inView ? { width: `${division.target}%` } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : barDuration, delay: shouldReduceMotion ? 0 : barDelay, ease: [0.5, 0, 0.15, 1] }}
        />
      </div>
      <span className={`text-right font-mono text-[10px] whitespace-nowrap ${status === "done" ? "text-biz-forest-light" : "text-biz-muted"}`}>
        {status === "done" ? "aktif" : "memuat…"}
      </span>
    </div>
  );
}

function ActivityItem({
  division,
  index,
  inView,
  shouldReduceMotion,
}: {
  division: (typeof divisions)[number];
  index: number;
  inView: boolean;
  shouldReduceMotion: boolean;
}) {
  return (
    <motion.div
      className="mb-2 flex items-start gap-2.5 rounded-lg bg-biz-panel-soft px-3 py-2.5 last:mb-0"
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : DASHBOARD_DELAY + 1.3 + index * 0.22 }}
    >
      <Check size={15} className="mt-0.5 shrink-0 text-biz-forest-light" />
      <p className="text-[12.5px] leading-[1.45] text-biz-copy">
        <strong className="font-semibold text-biz-ink">{division.name}</strong> — {division.impact}
      </p>
    </motion.div>
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
            <p className="mb-4 font-mono text-[11px] tracking-[0.1em] text-white/55 uppercase">
              Bulan ke-3 — cuplikan dashboard adopsi lintas divisi
            </p>

            <motion.div
              className="overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl"
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : DASHBOARD_DELAY }}
            >
              <div className="flex items-center justify-between border-b border-biz-line bg-biz-panel-soft px-4.5 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-biz-dot" />
                  <span className="size-2 rounded-full bg-biz-dot" />
                  <span className="size-2 rounded-full bg-biz-dot" />
                </div>
                <span className="font-mono text-[10px] text-biz-muted">ailene-lms.app/dashboard</span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.06em] text-biz-forest-light uppercase">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-biz-lime opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-biz-lime" />
                  </span>
                  Live
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-5 border-b border-dashed border-biz-line pb-6">
                  <ScoreRing inView={inView} shouldReduceMotion={shouldReduceMotion} />
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.08em] text-biz-muted uppercase">Adoption score</p>
                    <p className="text-base font-semibold text-biz-ink">Rata-rata lintas divisi</p>
                    <p className="mt-0.5 text-[12.5px] text-biz-muted">Naik dari sesi terakhir workshop, terus ter-update lewat LMS.</p>
                  </div>
                </div>

                <div className="mt-5">
                  {divisions.map((division, index) => (
                    <DivisionRow key={division.name} division={division} index={index} inView={inView} shouldReduceMotion={shouldReduceMotion} />
                  ))}
                </div>

                <p className="mt-5 font-mono text-[10px] tracking-[0.08em] text-biz-muted uppercase">Aktivitas terbaru</p>
                <div className="mt-2.5">
                  {divisions.map((division, index) => (
                    <ActivityItem key={division.name} division={division} index={index} inView={inView} shouldReduceMotion={shouldReduceMotion} />
                  ))}
                </div>
              </div>
            </motion.div>

            <p className="mt-4 font-mono text-[10px] text-white/45 italic">
              Ilustrasi peran &amp; dampak per divisi — bukan data klien aktual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
