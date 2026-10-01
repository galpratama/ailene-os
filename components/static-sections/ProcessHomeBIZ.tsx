"use client";

import PageMargin from "@/components/layouts/PageMargin";
import { useRef, useState } from "react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

const phases = [
  {
    title: "Workshop",
    start: 0,
    end: 5.2,
    description: "Belajar memakai AI dengan contoh dari pekerjaan sehari-hari.",
  },
  {
    title: "Penerapan",
    start: 5.2,
    end: 10.6,
    description: "Coba AI langsung pada pekerjaan yang sedang dikerjakan.",
  },
  {
    title: "Demo Day",
    start: 10.6,
    end: 16,
    description: "Tunjukkan hasilnya kepada tim dan pimpinan.",
  },
] as const;

export default function ProcessHomeBIZ() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activePhase, setActivePhase] = useState(0);

  function syncPhase(currentTime: number) {
    const index = phases.findIndex(
      (phase) => currentTime >= phase.start && currentTime < phase.end,
    );
    if (index < 0) return;

    setActivePhase(index);
  }

  function selectPhase(index: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = phases[index].start + 0.05;
    setActivePhase(index);
    void video.play().catch(() => undefined);
  }

  return (
    <section id="how-it-works" className="bg-biz-paper py-18 sm:py-28">
      <PageMargin>
        <SectionHeaderHomeBIZ
          centered
          eyebrow="How it works"
          title="Belajar AI, terapkan dalam pekerjaan, lalu lihat hasilnya."
        />

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] lg:gap-8">
            <ol className="grid gap-2.5">
              {phases.map((phase, index) => {
                const isActive = activePhase === index;
                return (
                  <li key={phase.title}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectPhase(index)}
                      className={`relative grid w-full grid-cols-[2.125rem_minmax(0,1fr)] gap-x-4 overflow-hidden rounded-xl border p-4.5 text-left transition-colors sm:p-5 ${
                        isActive
                          ? "border-biz-forest bg-biz-lime"
                          : "border-biz-forest/12 bg-white hover:bg-biz-panel"
                      }`}
                    >
                      <span
                        className={`row-span-2 grid size-8.5 place-items-center rounded-full border font-mono text-xs ${
                          isActive
                            ? "border-biz-forest bg-biz-forest text-biz-lime"
                            : "border-biz-forest/18 text-biz-muted"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <h3 className="text-[21px] leading-tight font-medium tracking-[-0.035em] text-biz-forest">
                        {phase.title}
                      </h3>
                      <p className={`mt-1.5 text-[14px] leading-[1.55] ${isActive ? "text-biz-forest/75" : "text-biz-muted"}`}>
                        {phase.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="order-first overflow-hidden rounded-2xl border border-biz-forest/12 bg-white shadow-xl shadow-biz-forest/10 lg:order-none">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/biz/how-poster.jpg"
                onTimeUpdate={(event) => syncPhase(event.currentTarget.currentTime)}
                className="aspect-video w-full object-cover"
                aria-label="Animasi alur program Ailene: workshop, penerapan di pekerjaan, dan Demo Day"
              >
                <source src="/biz/how.mp4" type="video/mp4" />
              </video>
            </div>
        </div>
      </PageMargin>
    </section>
  );
}
