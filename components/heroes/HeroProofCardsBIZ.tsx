"use client";

import Label from "@/components/labels/Label";
import { Check } from "lucide-react";
import HeroFloatCardBIZ, { ENTER_DELAY, HeroScoreBarBIZ } from "@/components/heroes/HeroFloatCardBIZ";

const illustrationBadge = (
  <Label variant="gray" className="shrink-0 font-medium">
    Ilustrasi
  </Label>
);

export default function HeroProofCardsBIZ() {
  return (
    <div className="pointer-events-none relative size-full">
      <HeroFloatCardBIZ index={0} title="AI Readiness · Divisi Finance" badge={illustrationBadge} className="top-[3%] left-[4%] w-62 sm:w-72 lg:top-[9%] lg:left-0">
        <div className="flex flex-col gap-2.5">
          <HeroScoreBarBIZ label="Sebelum" value={38} tone="bg-biz-dot" delay={ENTER_DELAY + 0.6} />
          <HeroScoreBarBIZ label="Sesudah" value={72} tone="bg-biz-forest-mid" delay={ENTER_DELAY + 0.9} />
        </div>
      </HeroFloatCardBIZ>

      <HeroFloatCardBIZ index={1} title="Prompt library · Marketing" badge={illustrationBadge} className="top-[40%] right-[4%] w-52 max-sm:hidden sm:w-60 lg:max-xl:hidden lg:top-[57%] lg:right-[3%]">
        <p className="text-5xl leading-none font-medium tracking-[-0.04em] text-biz-ink">24</p>
        <p className="mt-2 text-[13px] text-biz-muted sm:text-sm">prompt siap pakai milik tim</p>
      </HeroFloatCardBIZ>

      <HeroFloatCardBIZ index={2} title="Workflow baru, dipakai mingguan" badge={illustrationBadge} className="bottom-[5%] left-[4%] w-64 sm:w-76 lg:bottom-[6%] lg:left-[2%]">
        <ul className="flex flex-col gap-2 text-[13px] text-biz-copy sm:text-sm">
          {["Rekap penjualan untuk rapat Senin", "Notulen rapat jadi daftar tugas"].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-biz-check text-biz-forest-mid">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </HeroFloatCardBIZ>
    </div>
  );
}
