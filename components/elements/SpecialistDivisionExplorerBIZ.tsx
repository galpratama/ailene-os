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

    if (event.key === "ArrowDown") nextIndex = (index + 1) % specialistDivisions.length;
    if (event.key === "ArrowUp") nextIndex = (index - 1 + specialistDivisions.length) % specialistDivisions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = specialistDivisions.length - 1;

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextDivision = specialistDivisions[nextIndex];
    selectDivision(nextDivision.id);
    document.getElementById(`division-tab-${nextDivision.id}`)?.focus();
  };

  return (
    <div className="border-y border-biz-line bg-white lg:grid lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
      <div className="border-b border-biz-line p-4 sm:p-5 lg:border-r lg:border-b-0 lg:p-0">
        <label htmlFor="division-select" className="mb-2 block text-sm font-medium text-biz-forest lg:hidden">
          Divisi yang ingin dilatih
        </label>
        <select
          id="division-select"
          value={activeId}
          onChange={(event) => selectDivision(event.target.value)}
          className="min-h-12 w-full cursor-pointer rounded-lg border border-biz-forest bg-white px-3.5 text-base font-medium text-biz-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biz-forest lg:hidden"
        >
          {specialistDivisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name}
            </option>
          ))}
        </select>

        <div role="tablist" aria-label="Jalur specialist per divisi" aria-orientation="vertical" className="hidden lg:block">
          {specialistDivisions.map((division, index) => {
            const isActive = division.id === activeId;

            return (
              <button
                key={division.id}
                id={`division-tab-${division.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={division.id}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectDivision(division.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`group grid min-h-15 w-full cursor-pointer grid-cols-[2.25rem_1fr] items-center border-b border-biz-line px-5 text-left transition-colors last:border-b-0 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-biz-forest ${
                  isActive ? "bg-biz-forest text-white" : "bg-white text-biz-forest hover:bg-biz-paper-end active:bg-biz-lime/20"
                }`}
              >
                <span className={`text-xs tabular-nums ${isActive ? "text-biz-lime" : "text-biz-muted"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-tight font-medium">{division.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 bg-biz-paper-end">
        {specialistDivisions.map((division, index) => {
          const isActive = division.id === activeDivision.id;

          return (
            <section
              key={division.id}
              id={division.id}
              role="tabpanel"
              aria-labelledby={`division-tab-${division.id}`}
              hidden={!isActive}
              className="min-w-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-11 lg:py-12"
            >
              <header className="grid gap-5 border-b border-biz-line pb-7 sm:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.9fr)] sm:gap-8">
                <div>
                  <p className="text-sm font-medium text-biz-forest-light tabular-nums">
                    {String(index + 1).padStart(2, "0")} / {String(specialistDivisions.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-[34px] leading-[0.98] font-medium tracking-[-0.06em] text-biz-forest sm:text-[44px]">
                    {division.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-biz-copy">{division.audience}</p>
                </div>
                <div className="sm:border-l sm:border-biz-line sm:pl-8">
                  <p className="text-xs font-medium text-biz-forest-light">Titik kerja</p>
                  <p className="mt-2 text-base leading-[1.65] text-biz-copy">{division.challenge}</p>
                </div>
              </header>

              <div className="py-7">
                <p className="text-sm font-medium text-biz-forest">Yang dikerjakan di kelas</p>
                <ol className="mt-3 border-t border-biz-line sm:grid sm:grid-cols-2">
                  {division.useCases.map((useCase, caseIndex) => (
                    <li
                      key={useCase}
                      className="grid grid-cols-[2rem_1fr] gap-3 border-b border-biz-line py-4 sm:pr-6 sm:odd:border-r sm:even:pl-6"
                    >
                      <span className="text-xs text-biz-forest-light tabular-nums">
                        {String(caseIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] leading-[1.55] text-biz-ink">{useCase}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <dl className="grid border-t border-biz-line sm:grid-cols-2">
                <div className="border-b border-biz-line py-5 sm:border-r sm:border-b-0 sm:pr-7">
                  <dt className="text-xs text-biz-copy">Hasil lab</dt>
                  <dd className="mt-1.5 text-lg leading-snug font-medium tracking-[-0.025em] text-biz-forest">
                    {division.labOutput}
                  </dd>
                </div>
                <div className="py-5 sm:pl-7">
                  <dt className="text-xs text-biz-copy">Yang ditinjau setelah kelas</dt>
                  <dd className="mt-1.5 text-lg leading-snug font-medium tracking-[-0.025em] text-biz-forest">
                    {division.measure}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-biz-line pt-4">
                <p className="text-xs text-biz-copy">Tools latihan</p>
                <p className="mt-1 text-sm font-medium text-biz-forest">{division.tools.join(", ")}</p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
