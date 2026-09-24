"use client";

import AppButton from "@/components/buttons/AppButton";
import { trackFeatureView } from "@/lib/feature-tracking";
import { useEffect } from "react";
import PageMargin from "@/components/layouts/PageMargin";
import RibbonBackgroundBIZ from "@/components/motion/RibbonBackgroundBIZ";

export default function HeroHomeBIZ() {
  useEffect(() => {
    trackFeatureView({ name: "home_section", block: "hero" });
  }, []);

  return (
    <div className="bg-white">
      <PageMargin className="py-5">
        <section className="relative isolate flex aspect-2/4 overflow-clip rounded-2xl bg-black text-white md:aspect-4/2 lg:rounded-3xl">
          <RibbonBackgroundBIZ />
          <div className="relative z-10 flex w-full flex-col items-center justify-center px-5 py-12 text-center sm:px-10 sm:py-16 lg:px-12">
            <div className="flex flex-col items-center">
              <h1 className="max-w-200 text-[clamp(2.75rem,5vw,4.2rem)] text-balance leading-[0.98] font-medium tracking-[-0.055em]">
                Bangun kapabilitas AI. Tingkatkan produktivitas tim.
              </h1>
              <p className="mt-4 max-w-125 text-[15px] leading-[1.65] lg:text-base text-white">
                Bangun transformasi AI yang benar untuk tim kamu dan tingkatkan
                cara kerja produktivitas bisnis.
              </p>
              <div className="mt-7.5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                <AppButton
                  href="#contact"
                  variant="lime"
                  size="lg"
                  trackPlacement="hero"
                >
                  Book Meeting
                </AppButton>
                <AppButton
                  href="#curriculum"
                  variant="white"
                  size="lg"
                  trackPlacement="hero"
                >
                  Lihat kurikulum
                </AppButton>
              </div>
            </div>
          </div>
        </section>
      </PageMargin>
    </div>
  );
}
