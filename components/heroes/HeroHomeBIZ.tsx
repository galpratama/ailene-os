"use client";

import AppButton from "@/components/buttons/AppButton";
import { heroVariants, type HeroAudience } from "@/lib/biz-content";
import { trackFeatureView } from "@/lib/feature-tracking";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import PageMargin from "@/components/layouts/PageMargin";
import HeroProofCardsBIZ from "@/components/heroes/HeroProofCardsBIZ";

// three.js stays out of the first-paint bundle; the headline renders without waiting for WebGL.
const TubeSceneBIZ = dynamic(() => import("@/components/motion/TubeSceneBIZ"), { ssr: false });

export default function HeroHomeBIZ({ audience }: { audience: HeroAudience }) {
  const { headline, subheadline } = heroVariants[audience];

  useEffect(() => {
    trackFeatureView({ name: "home_section", block: "hero" });
  }, []);

  return (
    <div className="bg-white">
      <PageMargin className="py-5">
        <section className="relative isolate grid overflow-clip rounded-2xl border border-biz-line bg-biz-paper lg:min-h-160 lg:grid-cols-2 lg:rounded-3xl">
          {/* Faint orbit rings behind the tube, echoing its loop. */}
          <svg aria-hidden viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 -z-10 size-full max-lg:hidden">
            <g fill="none" className="stroke-biz-line" strokeWidth="2">
              <circle cx="900" cy="330" r="250" />
              <circle cx="840" cy="420" r="380" />
            </g>
          </svg>

          <div className="absolute inset-x-0 bottom-0 -z-10 h-120 sm:h-130 lg:inset-0 lg:h-auto">
            <TubeSceneBIZ />
          </div>

          {/* Keeps the tube's left exit from competing with the headline. */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[55%] bg-linear-to-r from-biz-paper via-biz-paper/70 to-transparent max-lg:hidden" />

          <div className="relative z-10 flex flex-col justify-center px-6 pt-12 pb-6 sm:px-10 lg:py-20 lg:pr-4 lg:pl-10 xl:pl-14">
            <h1 className="max-w-140 text-[clamp(2.6rem,4.6vw,4.2rem)] leading-[0.98] font-medium tracking-[-0.055em] text-balance text-biz-ink">
              {headline}
            </h1>
            <p className="mt-5 max-w-115 text-[15px] leading-[1.65] text-biz-copy lg:text-base">
              {subheadline}
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <AppButton href="#contact" variant="forest" size="lg" trackPlacement="hero" className="whitespace-nowrap lg:px-7 xl:px-9">
                Konsultasi Gratis
              </AppButton>
              <AppButton href="#curriculum" variant="white" size="lg" trackPlacement="hero" className="whitespace-nowrap lg:px-7 xl:px-9">
                Lihat kurikulum
              </AppButton>
            </div>
          </div>

          <div className="relative z-10 h-120 sm:h-130 lg:h-auto">
            <HeroProofCardsBIZ />
          </div>
        </section>
      </PageMargin>
    </div>
  );
}
