import { AcademyProgressMockV2BIZ } from "@/components/elements/AcademyMocksV2BIZ";
import { IconCircleCheckFilled, IconSparkles, IconStarFilled } from "@tabler/icons-react";

// A product-led view of the student journey: progress, XP, and verified work.
export default function LmsHeroVisualV2BIZ() {
  return (
    <div className="lms-hero-scene relative isolate mx-auto w-full max-w-170 py-7 sm:py-11">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-8 -z-10 h-4/5 rounded-full bg-v2-lime/25 blur-3xl" />
      <div aria-hidden="true" className="lms-hero-orbit pointer-events-none absolute inset-2 -z-10 rounded-full border border-dashed border-v2-green/20 sm:inset-0" />

      <div className="lms-hero-enter relative z-10">
        <div className="lms-hero-drift">
          <AcademyProgressMockV2BIZ hero />
        </div>
      </div>

      <div aria-hidden="true" className="lms-hero-reward pointer-events-none absolute -top-1 right-1 z-20 sm:-top-2 sm:-right-3">
        <div className="lms-hero-reward-drift flex items-center gap-2.5 rounded-xl border border-v2-rule bg-white/95 px-3 py-2.5 shadow-[0_18px_34px_-18px_rgb(10_32_22/0.35)] backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3">
          <span className="grid size-9 place-items-center rounded-lg bg-v2-lime-wash text-v2-green sm:size-10">
            <IconStarFilled size={20} />
          </span>
          <span>
            <span className="block text-[0.67rem] font-semibold text-v2-ink-3 sm:text-xs">Tugas selesai</span>
            <strong className="block font-jakarta text-base leading-tight text-v2-ink sm:text-lg">+120 XP</strong>
          </span>
          <IconSparkles size={18} className="ml-1 text-v2-green" />
        </div>
      </div>

      <div aria-hidden="true" className="lms-hero-proof pointer-events-none absolute -bottom-1 left-1 z-20 sm:-bottom-2 sm:-left-4">
        <div className="lms-hero-proof-drift flex items-center gap-2.5 rounded-xl border border-v2-rule bg-white/95 px-3 py-2.5 shadow-[0_18px_34px_-18px_rgb(10_32_22/0.3)] backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3">
          <span className="grid size-9 place-items-center rounded-lg bg-v2-green-soft text-v2-green sm:size-10">
            <IconCircleCheckFilled size={22} />
          </span>
          <span>
            <span className="block text-[0.67rem] font-semibold text-v2-ink-3 sm:text-xs">Use case diverifikasi</span>
            <strong className="block font-jakarta text-sm leading-tight text-v2-ink sm:text-base">11 jam hemat / bulan</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
