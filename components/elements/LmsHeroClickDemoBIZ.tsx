import { IconCheck } from "@tabler/icons-react";

// A CSS-only multi-step walkthrough in the LMS hero preview:
// click Level 2 -> open popover -> complete a practice task -> progress & XP rise in sync.
export default function LmsHeroClickDemoBIZ() {
  return (
    <span aria-hidden="true" className="pointer-events-none">
      <span className="lms-hero-click-ripple absolute inset-0 z-10 rounded-full bg-v2-lime/60" />

      <span className="absolute top-9 left-1/2 z-20 -translate-x-1/2">
        <span className="lms-hero-popover block w-54 rounded-xl border border-v2-rule bg-white p-3 text-left text-v2-ink shadow-[0_20px_42px_-16px_rgb(10_32_22/0.34)] sm:w-58">
          <span className="block text-[0.65rem] leading-4 font-bold tracking-[0.08em] text-v2-green uppercase">Progres Anda</span>
          <strong className="mt-0.5 block font-jakarta text-[0.86rem] leading-5 text-v2-ink">Level 2 · Practitioner</strong>

          <span className="lms-hero-task-row relative mt-2 flex items-center gap-2 overflow-hidden rounded-lg border border-v2-rule bg-v2-paper-2 px-2 py-1.5">
            <span className="lms-hero-task-bg pointer-events-none absolute inset-0 bg-v2-lime-wash" />
            <span className="relative z-10 grid size-4 shrink-0 place-items-center rounded-[5px] border border-v2-faded bg-white">
              <span className="lms-hero-task-ripple absolute inset-0 rounded-[5px] bg-v2-lime/70" />
              <span className="lms-hero-task-check absolute -inset-px grid place-items-center rounded-[5px] bg-v2-green text-white">
                <IconCheck size={11} stroke={3.2} />
              </span>
            </span>
            <span className="relative z-10 truncate text-[0.72rem] leading-4 font-semibold text-v2-ink">Rekonsiliasi vendor</span>
            <span className="lms-hero-task-xp relative z-10 ml-auto shrink-0 rounded-full bg-v2-green-soft px-1.5 py-px text-[0.64rem] font-extrabold text-v2-green tabular-nums">
              +120 XP
            </span>
          </span>

          <span className="mt-2.5 flex items-center justify-between text-[0.72rem] leading-4 font-semibold text-v2-ink-2">
            <span>Langkah selesai</span>
            <span className="inline-grid overflow-hidden font-bold text-v2-ink tabular-nums">
              <span className="lms-hero-val-before col-start-1 row-start-1">5 dari 8</span>
              <span className="lms-hero-val-after col-start-1 row-start-1 text-v2-green">6 dari 8</span>
            </span>
          </span>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-v2-paper-3">
            <span className="lms-hero-popover-bar block h-full w-full origin-left rounded-full bg-v2-green" />
          </span>
        </span>
      </span>

      <svg
        viewBox="0 0 28 32"
        className="lms-hero-cursor absolute top-1/2 left-1/2 z-30 h-7.5 w-6.5 text-v2-forest drop-shadow-[0_4px_4px_rgb(10_32_22/0.28)]"
        fill="none"
      >
        <path
          d="M4 2.5v24.8l6.3-6.1 4.7 9 5.1-2.7-4.8-8.8 8.8-1.2L4 2.5Z"
          fill="white"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
