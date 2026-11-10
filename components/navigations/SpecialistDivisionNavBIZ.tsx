"use client";

import PageMargin from "@/components/layouts/PageMargin";
import { specialistDivisions } from "@/lib/biz-specialists";
import { useEffect, useRef, useState } from "react";

// Sticky division index under the header; highlights whichever division card is in the reading band.
export default function SpecialistDivisionNavBIZ() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = specialistDivisions
      .map((division) => document.getElementById(division.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Keep the active chip in view on narrow screens, where the chip row scrolls sideways.
  useEffect(() => {
    if (!activeId) return;
    const chip = listRef.current?.querySelector<HTMLElement>(`[data-division="${activeId}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeId]);

  return (
    <nav aria-label="Pilih divisi" className="sticky top-17.5 z-40 border-y border-biz-line bg-white/92 backdrop-blur-md">
      <PageMargin>
        <ul ref={listRef} className="-mx-5 flex gap-1.5 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:justify-center lg:px-0">
          {specialistDivisions.map((division) => {
            const active = division.id === activeId;
            const Icon = division.icon;
            return (
              <li key={division.id} className="shrink-0">
                <a
                  href={`#${division.id}`}
                  data-division={division.id}
                  aria-current={active ? "true" : undefined}
                  className={`flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "border-biz-forest bg-biz-forest text-white"
                      : "border-biz-line bg-white text-biz-copy hover:border-biz-forest/40 hover:text-biz-forest"
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {division.short}
                </a>
              </li>
            );
          })}
        </ul>
      </PageMargin>
    </nav>
  );
}
