"use client";

import { specialistDivisions } from "@/lib/biz-specialists";
import { KeyboardEvent, useEffect, useState } from "react";

const firstDivisionId = specialistDivisions[0].id;

export default function SpecialistDivisionExplorerBIZ() {
  const [activeId, setActiveId] = useState(firstDivisionId);

  const activeIndex = Math.max(
    0,
    specialistDivisions.findIndex((division) => division.id === activeId),
  );
  const activeDivision = specialistDivisions[activeIndex];

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (!specialistDivisions.some((division) => division.id === hash)) return;

      setActiveId(hash);
      window.requestAnimationFrame(() => {
        document.getElementById("divisi")?.scrollIntoView();
        document.getElementById(`division-tab-${hash}`)?.scrollIntoView({ block: "nearest", inline: "center" });
      });
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selectDivision = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % specialistDivisions.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + specialistDivisions.length) % specialistDivisions.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = specialistDivisions.length - 1;

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextDivision = specialistDivisions[nextIndex];
    selectDivision(nextDivision.id);
    const nextTab = document.getElementById(`division-tab-${nextDivision.id}`);
    nextTab?.focus();
    nextTab?.scrollIntoView({ block: "nearest", inline: "center" });
  };

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="Jalur specialist per divisi"
        className="flex min-w-0 gap-1.5 overflow-x-auto rounded-xl border border-biz-line bg-biz-paper p-1.5 [scrollbar-width:thin]"
      >
        {specialistDivisions.map((division, index) => {
          const isActive = division.id === activeId;

          return (
            <button
              key={division.id}
              id={`division-tab-${division.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`division-panel-${division.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectDivision(division.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`min-h-11 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biz-forest sm:px-5 ${
                isActive
                  ? "bg-biz-forest text-white"
                  : "text-biz-copy hover:bg-biz-sage hover:text-biz-forest active:bg-biz-lime/30"
              }`}
            >
              {division.short}
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-w-0">
        {specialistDivisions.map((division, index) => {
          const isActive = division.id === activeDivision.id;

          return (
            <section
              key={division.id}
              id={`division-panel-${division.id}`}
              role="tabpanel"
              aria-labelledby={`division-tab-${division.id}`}
              hidden={!isActive}
              tabIndex={0}
              className="min-w-0 overflow-hidden rounded-2xl border border-biz-line bg-biz-panel focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-biz-forest lg:rounded-3xl"
            >
              <header className="border-b border-biz-line bg-white px-5 py-7 sm:px-8 sm:py-9 lg:px-11 lg:py-10">
                <div className="flex flex-col gap-3 text-xs text-biz-muted sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-biz-forest-light tabular-nums">
                    {String(index + 1).padStart(2, "0")} / {division.name}
                  </p>
                  <p>{division.audience}</p>
                </div>
                <p className="mt-8 text-xs text-biz-muted">Hasil lab</p>
                <h3 className="mt-3 max-w-230 text-[clamp(2.25rem,5vw,4.85rem)] leading-[0.96] font-medium tracking-[-0.06em] text-balance text-biz-forest">
                  {division.labOutput}
                </h3>
              </header>

              <div className="specialist-route" aria-hidden="true">
                <span className="specialist-route-track">
                  <span className="specialist-route-runner" />
                </span>
              </div>

              <div className="grid min-w-0 lg:grid-cols-[minmax(13rem,0.72fr)_minmax(0,1.48fr)_minmax(14rem,0.8fr)]">
                <div className="border-b border-biz-line px-5 py-7 sm:px-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-9">
                  <p className="text-xs font-medium text-biz-forest-light">Titik kerja</p>
                  <p className="mt-3 text-base leading-[1.7] text-biz-copy">{division.challenge}</p>
                </div>

                <div className="border-b border-biz-line px-5 py-7 sm:px-8 lg:border-r lg:border-b-0 lg:px-9 lg:py-9">
                  <p className="text-xs font-medium text-biz-forest-light">Yang dikerjakan di kelas</p>
                  <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                    {division.useCases.map((useCase, caseIndex) => (
                      <li
                        key={useCase}
                        className="grid min-w-0 grid-cols-[2rem_1fr] gap-3 rounded-xl border border-biz-line bg-white p-4"
                      >
                        <span className="text-xs font-medium text-biz-forest-light tabular-nums">
                          {String(caseIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-[1.55] text-biz-ink">{useCase}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <dl className="divide-y divide-biz-line px-5 sm:px-8 lg:px-8">
                  <div className="py-7 lg:py-9">
                    <dt className="text-xs text-biz-muted">Yang ditinjau setelah kelas</dt>
                    <dd className="mt-2 text-xl leading-snug font-medium tracking-[-0.025em] text-biz-forest">{division.measure}</dd>
                  </div>
                  <div className="py-7">
                    <dt className="text-xs text-biz-muted">Tools latihan</dt>
                    <dd className="mt-2 text-sm leading-relaxed font-medium text-biz-forest">{division.tools.join(", ")}</dd>
                  </div>
                </dl>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
