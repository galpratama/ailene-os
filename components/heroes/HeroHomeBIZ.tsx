"use client";

import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";
import { sendLeadEvent } from "@/lib/fbq";
import { sendConversionEvent } from "@/lib/gtag";
import Image from "next/image";

export default function HeroHomeBIZ() {
  return (
    <section className="relative isolate overflow-hidden bg-biz-forest text-white">
      <Image
        src="/biz/hero-training.jpg"
        alt="Tim mengikuti sesi training AI bersama trainer"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_center] md:object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,24,17,0.97)_0%,rgba(1,24,17,0.86)_30%,rgba(1,24,17,0.42)_60%,rgba(1,24,17,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(1,24,17,0.82)_0%,rgba(1,24,17,0)_45%)]" />

      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-315 items-center gap-10 px-4.5 pt-35 pb-12 sm:px-7.5 sm:pt-39 sm:pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:gap-14 lg:pt-37 lg:pb-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md bg-biz-lime px-3.5 py-2 text-[11px] font-semibold text-biz-forest before:size-1.5 before:rounded-full before:bg-biz-forest before:content-['']">
            Workshop AI + LMS dalam Satu Program
          </span>
          <h1 className="mt-6 max-w-150 text-[clamp(2.75rem,5vw,4.2rem)] leading-[0.98] font-medium tracking-[-0.055em] lg:mt-7">
            Solusi terbaik untuk transformasi AI tim kamu
          </h1>
          <p className="mt-4 max-w-125 text-lg leading-[1.4] font-medium text-biz-lime sm:text-xl">
            Dari training sampai adopsi yang kelihatan hasilnya.
          </p>
          <p className="mt-4 max-w-125 text-[15px] leading-[1.65] text-white/78">
            Workshop dipandu langsung per divisi, progress-nya kelihatan di LMS,
            sampai tim presentasi solusinya sendiri di depan leadership.
          </p>
          <div className="mt-7.5 flex flex-wrap gap-3">
            <LinkButtonBIZ
              href="https://wa.me/6285110545698"
              variant="lime"
              onClick={() => {
                sendConversionEvent();
                sendLeadEvent();
              }}
            >
              Diskusikan kebutuhan tim
            </LinkButtonBIZ>
            <LinkButtonBIZ href="#curriculum" variant="outlineDark">
              Lihat kurikulum
            </LinkButtonBIZ>
          </div>
        </div>

        <figure className="w-full max-w-155 justify-self-center rotate-[0.35deg] overflow-hidden rounded-xl border border-white/15 bg-biz-dashboard shadow-2xl lg:justify-self-end lg:rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-biz-dashboard-bar px-3.5 py-2.5 font-mono text-[8px] tracking-[0.08em] text-white/70 uppercase">
            <span className="flex items-center gap-1.5 before:h-1.5 before:w-7 before:bg-[radial-gradient(circle_at_3px_3px,currentColor_0_2px,transparent_2.5px),radial-gradient(circle_at_13px_3px,currentColor_0_2px,transparent_2.5px),radial-gradient(circle_at_23px_3px,currentColor_0_2px,transparent_2.5px)] before:text-white/25 before:content-['']">
              Adoption Hub
            </span>
            <span>Preview</span>
          </div>
          <Image
            src="/biz/hero-dashboard.jpg"
            alt="Dashboard LMS yang menampilkan progres adopsi AI"
            width={1400}
            height={1050}
            sizes="(max-width: 1024px) calc(100vw - 36px), 620px"
            className="aspect-4/3 w-full object-cover object-top"
          />
        </figure>
      </div>
    </section>
  );
}
