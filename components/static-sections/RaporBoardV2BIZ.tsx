"use client";

import RaporStatusLabelBIZ from "@/components/labels/RaporStatusLabelBIZ";
import { prefersReducedMotion, useScrollFrame } from "@/hooks/useScrollFrame";
import {
  formatId,
  raporDivisions,
  raporQuarters,
  V2_H2,
  V2_LEAD,
  V2_SAMPLE,
  V2_SECTION,
  V2_WRAP,
} from "@/lib/biz-home-v2";
import { useEffect, useRef, useState } from "react";

const LAST = raporQuarters.length - 1;
type Totals = { active: number; ready: number; hours: number };
const totalsOf = (index: number): Totals => {
  const { active, ready, hours } = raporQuarters[index];
  return { active, ready, hours };
};

export default function RaporBoardV2BIZ() {
  const [quarter, setQuarter] = useState(LAST);
  const [shown, setShown] = useState<Totals>(totalsOf(LAST));
  const shownRef = useRef(shown);
  const boardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchedRef = useRef(false);

  // Counts the KPIs to the new quarter instead of jumping.
  const goTo = (index: number, animate: boolean) => {
    setQuarter(index);
    const target = totalsOf(index);
    if (!animate) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      const e = 1 - Math.pow(1 - p, 4);
      const next = {
        active: from.active + (target.active - from.active) * e,
        ready: from.ready + (target.ready - from.ready) * e,
        hours: from.hours + (target.hours - from.hours) * e,
      };
      shownRef.current = next;
      setShown(next);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Starts at Q1 and plays through to Q4 once the board is on screen, until the visitor picks a quarter.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || prefersReducedMotion()) return;
    let timer = 0;
    const reset = requestAnimationFrame(() => goTo(0, false));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let index = 0;
        const next = () => {
          if (touchedRef.current || index >= LAST) return;
          index += 1;
          goTo(index, true);
          timer = window.setTimeout(next, 1500);
        };
        timer = window.setTimeout(next, 700);
      },
      { threshold: 0.4 }
    );
    observer.observe(board);
    return () => {
      cancelAnimationFrame(reset);
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // The board rises and settles as it reaches the reading line.
  useScrollFrame(stageRef, (_rect, vh) => {
    const stage = stageRef.current;
    if (!stage) return;
    const p = Math.min(1, Math.max(0, (vh - stage.getBoundingClientRect().top) / (vh * 0.65)));
    const e = 1 - Math.pow(1 - p, 3);
    stage.style.transform = `translate3d(0,${(48 * (1 - e)).toFixed(1)}px,0) scale(${(0.93 + 0.07 * e).toFixed(4)})`;
  });

  const pick = (index: number) => {
    touchedRef.current = true;
    goTo(index, !prefersReducedMotion());
  };

  const rows = raporQuarters[quarter].rows;

  return (
    <section id="board" aria-labelledby="v2-board" className={`${V2_SECTION} bg-v2-paper-2`}>
      <div className={`${V2_WRAP} grid items-center gap-[clamp(32px,5vw,72px)] min-[1000px]:grid-cols-[4fr_7fr]`}>
        <div>
          <h2 id="v2-board" className={V2_H2}>
            Direksi bertanya apa hasil AI. Anda tunjukkan ini.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Satu halaman. Per divisi. Diperbarui setiap kuartal. Pilih kuartal untuk melihat perubahannya.
          </p>
        </div>
        <div ref={stageRef} className="v2-scrub origin-bottom">
          <div
            ref={boardRef}
            aria-labelledby="v2-board-title"
            className="overflow-hidden rounded-2xl bg-white text-v2-ink shadow-[0_40px_80px_-48px_rgb(10_32_22/0.38),0_0_0_1px_var(--v2-rule)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-v2-rule bg-v2-paper px-4.5 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <b id="v2-board-title" className="text-[0.98rem] whitespace-nowrap">Rapor AI</b>
                <span className="truncate text-[0.8rem] text-v2-ink-3 max-sm:hidden">Perusahaan Anda · Tampilan Direksi</span>
              </div>
              <div role="tablist" aria-label="Pilih kuartal" className="inline-flex flex-none gap-0.5 rounded-lg bg-v2-paper-3 p-0.75">
                {raporQuarters.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={quarter === index}
                    tabIndex={quarter === index ? 0 : -1}
                    onClick={() => pick(index)}
                    onKeyDown={(event) => {
                      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                      if (!step) return;
                      event.preventDefault();
                      const next = Math.min(LAST, Math.max(0, index + step));
                      (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                      pick(next);
                    }}
                    className="min-h-8 min-w-9.5 rounded-md px-2.5 text-[0.8rem] font-bold text-v2-ink-3 hover:text-v2-ink aria-selected:bg-white aria-selected:text-v2-ink aria-selected:shadow-[0_1px_2px_rgb(0_0_0/0.12)]"
                  >
                    Q{index + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 border-b border-v2-rule sm:grid-cols-3">
              <Kpi label="Aktif mingguan" value={`${formatId(shown.active)}`} unit="%" />
              <Kpi label="Ailene Score rata-rata" value={formatId(shown.ready)} unit="/ 100" className="border-l border-v2-rule" />
              <Kpi
                label="Jam dihemat, terverifikasi"
                value={formatId(shown.hours)}
                unit="jam / bulan"
                proof
                className="max-sm:col-span-2"
              />
            </div>
            <table className="w-full border-collapse text-[0.86rem] tabular-nums" aria-describedby="v2-board-note">
              <thead>
                <tr className="text-left text-[0.76rem] font-bold text-v2-ink-3">
                  <th scope="col" className="border-b border-v2-rule px-3 py-2.5 sm:px-4.5">Divisi</th>
                  <th scope="col" className="border-b border-v2-rule px-3 py-2.5 sm:px-4.5">Aktif mingguan</th>
                  <th scope="col" className="border-b border-v2-rule px-3 py-2.5 sm:px-4.5">Kesiapan</th>
                  <th scope="col" className="border-b border-v2-rule px-3 py-2.5 max-sm:hidden sm:px-4.5">Use case</th>
                  <th scope="col" className="border-b border-v2-rule px-3 py-2.5 sm:px-4.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([active, ready, useCases, status], index) => (
                  <tr key={raporDivisions[index]} className="border-b border-v2-paper-2 last:border-b-0">
                    <td className="px-3 py-2.75 font-bold sm:px-4.5 sm:whitespace-nowrap">{raporDivisions[index]}</td>
                    <td className="px-3 py-2.75 whitespace-nowrap sm:px-4.5">
                      <span className="relative mr-2 inline-block h-1.5 w-21 overflow-hidden rounded-full bg-v2-paper-3 align-middle max-sm:hidden">
                        <i className="v2-bar absolute inset-y-0 left-0 rounded-full bg-v2-green" style={{ width: `${active}%` }} />
                      </span>
                      {active}%
                    </td>
                    <td className="px-3 py-2.75 sm:px-4.5">{ready}</td>
                    <td className="px-3 py-2.75 max-sm:hidden sm:px-4.5">{useCases}</td>
                    <td className="px-3 py-2.75 sm:px-4.5">
                      <RaporStatusLabelBIZ status={status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between gap-3 border-t border-v2-rule bg-v2-paper px-4.5 py-3 text-[0.78rem] text-v2-ink-3">
              <span id="v2-board-note">Contoh dashboard. Angka ilustrasi, bukan hasil klien.</span>
              <span className={V2_SAMPLE}>Contoh</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  unit,
  proof = false,
  className = "",
}: {
  label: string;
  value: string;
  unit: string;
  proof?: boolean;
  className?: string;
}) {
  return (
    <div className={`px-4.5 py-4 ${proof ? "bg-v2-lime text-v2-forest sm:border-l sm:border-v2-rule max-sm:border-t" : ""} ${className}`}>
      <small className={`block text-[0.78rem] font-semibold ${proof ? "text-v2-lime-ink" : "text-v2-ink-3"}`}>{label}</small>
      <div className="mt-1 flex items-baseline gap-1.5 font-jakarta text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.1] font-extrabold tracking-[-0.03em] tabular-nums">
        <span>{value}</span>
        <em className={`text-[0.8rem] font-semibold tracking-normal not-italic ${proof ? "text-v2-lime-ink" : "text-v2-ink-3"}`}>{unit}</em>
      </div>
    </div>
  );
}
