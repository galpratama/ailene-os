"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import HeroFloatCardBIZ, { ENTER_DELAY, HeroScoreBarBIZ } from "@/components/heroes/HeroFloatCardBIZ";

const MENTOR_PHOTO =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/ailene/ChatGPT%20Image%20Sep%2030,%202026,%2011_37_19%20AM.webp";

const topics = [
  "Struktur prompt",
  "Menghindari halusinasi",
  "AI reasoning multistep",
  "Skill MD",
  "Connector ke aplikasi lain",
];

export default function HeroMentorBIZ() {
  return (
    <div className="relative size-full">
      {/* Rendered before the portrait so the mentors stand in front of it. */}
      <div className="pointer-events-none absolute inset-0">
        <HeroFloatCardBIZ
          index={0}
          title="Materi yang dipelajari"
          className="top-[3%] left-0 w-56 sm:w-64 lg:top-[10%] lg:-left-20"
        >
          <ul className="flex flex-col gap-2 text-[13px] text-biz-copy sm:text-sm">
            {topics.map((topic) => (
              <li key={topic} className="flex items-start gap-2">
                <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-biz-check text-biz-forest-mid">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {topic}
              </li>
            ))}
            <li className="pl-6.5 text-biz-muted">dan materi lainnya</li>
          </ul>
        </HeroFloatCardBIZ>
      </div>

      {/* Cut-out portrait, sunk past the hero's bottom edge (the section clips it) so the mentors read larger. */}
      <Image
        src={MENTOR_PHOTO}
        alt="Mentor Ailene"
        width={1122}
        height={1402}
        priority
        className="absolute -bottom-[8%] left-1/2 h-[104%] w-auto max-w-none -translate-x-1/2 lg:-bottom-[12%] lg:h-[114%]"
      />

      <div className="pointer-events-none absolute inset-0">

        <HeroFloatCardBIZ
          index={1}
          title="Produktivitas tim"
          className="right-[4%] bottom-[4%] w-56 sm:w-68 lg:right-[3%] lg:bottom-[10%]"
        >
          <p className="text-4xl leading-none font-medium tracking-[-0.04em] text-biz-forest-mid sm:text-5xl">
            +47%
          </p>
          <p className="mt-1.5 mb-3.5 text-[13px] text-biz-muted sm:text-sm">setelah pakai AI</p>
          <div className="flex flex-col gap-2.5">
            <HeroScoreBarBIZ label="Sebelum" value={35} display="35%" tone="bg-biz-dot" delay={ENTER_DELAY + 0.8} />
            <HeroScoreBarBIZ label="Sesudah" value={82} display="82%" tone="bg-biz-forest-mid" delay={ENTER_DELAY + 1.1} />
          </div>
        </HeroFloatCardBIZ>
      </div>
    </div>
  );
}
