"use client";

import { useScrollFrame } from "@/hooks/useScrollFrame";
import { V2_H2, V2_LEAD, V2_SOURCE, V2_WRAP } from "@/lib/biz-home-v2";
import { useRef, useState } from "react";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// While the section is pinned, 69% (tried AI) counts down to 16% (uses it daily); reduced motion shows both figures.
export default function ProblemV2BIZ() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const triedRef = useRef<HTMLSpanElement>(null);
  const dailyRef = useRef<HTMLSpanElement>(null);
  const [figure, setFigure] = useState(69);
  const [low, setLow] = useState(false);

  useScrollFrame(sectionRef, (rect, vh) => {
    const total = rect.height - vh;
    if (total <= 0) return;
    const p = clamp(-rect.top / total);
    const n = Math.round(69 - 53 * easeInOut(clamp((p - 0.2) / 0.55)));
    setFigure(n);
    if (barRef.current) barRef.current.style.transform = `scaleX(${(n / 100).toFixed(3)})`;
    const k = clamp((p - 0.42) / 0.16);
    if (triedRef.current) triedRef.current.style.opacity = (1 - k).toFixed(3);
    if (dailyRef.current) dailyRef.current.style.opacity = k.toFixed(3);
    setLow(k > 0.5);
  });

  return (
    <section ref={sectionRef} aria-labelledby="v2-problem" className="relative bg-v2-paper motion-safe:h-[250vh]">
      <div className="motion-safe:sticky motion-safe:top-18 motion-safe:flex motion-safe:h-[calc(100svh-72px)] motion-safe:items-center motion-safe:overflow-hidden max-[860px]:motion-safe:items-start">
        <div
          className={`${V2_WRAP} grid items-end gap-5 py-10 [grid-template-areas:'h'_'num'_'lead'_'src'] min-[860px]:grid-cols-[5fr_7fr] min-[860px]:gap-x-[clamp(32px,6vw,96px)] min-[860px]:py-[clamp(64px,8vw,104px)] min-[860px]:[grid-template-areas:'h_num'_'lead_num'_'src_num']`}
        >
          <h2 id="v2-problem" className={`${V2_H2} [grid-area:h]`}>
            Hampir semua sudah mencoba AI. Sedikit yang memakainya setiap hari.
          </h2>
          <div aria-hidden="true" className="self-center [grid-area:num] motion-reduce:hidden">
            <div
              className={`font-jakarta text-[clamp(7rem,21vw,18rem)] leading-[0.82] font-extrabold tracking-[-0.065em] tabular-nums transition-colors duration-400 ${
                low ? "text-v2-red" : "text-v2-ink"
              }`}
            >
              {figure}%
            </div>
            <div className="relative mt-4.5 min-h-[3.4em] max-w-[30ch] text-[clamp(1.05rem,1.6vw,1.3rem)] font-bold">
              <span ref={triedRef} className="absolute top-0 left-0">pernah memakai AI untuk pekerjaan, setahun terakhir</span>
              <span ref={dailyRef} className="absolute top-0 left-0 text-v2-red opacity-0">memakai GenAI setiap hari</span>
            </div>
            <div className="mt-3.5 h-4 overflow-hidden rounded-lg bg-v2-paper-3">
              <i
                ref={barRef}
                className={`v2-scrub block h-full w-full origin-left scale-x-[0.69] rounded-lg ${low ? "bg-v2-red" : "bg-v2-ink-3"}`}
              />
            </div>
          </div>
          <div className="hidden self-center text-[1.3rem] [grid-area:num] motion-reduce:block">
            <p>
              <b className="mr-2 font-jakarta text-5xl tracking-[-0.04em] tabular-nums">69%</b> pernah memakai AI untuk pekerjaan, setahun terakhir.
            </p>
            <p className="mt-2.5">
              <b className="mr-2 font-jakarta text-5xl tracking-[-0.04em] text-v2-red tabular-nums">16%</b> memakai GenAI setiap hari.
            </p>
          </div>
          <p className={`${V2_LEAD} [grid-area:lead]`}>
            Celah 53 poin itu bukan karena tim kurang pelatihan. Cara kerjanya yang belum berubah. Lebih sedikit lagi yang memakainya dengan aman, di alat yang disetujui perusahaan.
          </p>
          <p className={`${V2_SOURCE} [grid-area:src]`}>
            Sumber:{" "}
            <a
              href="https://www.pwc.com/id/en/media-centre/press-release/2026/indonesian/hopes-and-fears-2025-indonesia.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              PwC Global Workforce Hopes and Fears Survey 2025, Indonesia
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
