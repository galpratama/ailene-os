import AppButton from "@/components/buttons/AppButton";
import RaporStatusLabelBIZ from "@/components/labels/RaporStatusLabelBIZ";
import { V2_FORM_ANCHOR, V2_WRAP } from "@/lib/biz-home-v2";
import { IconBrandWhatsapp, IconCircleCheck } from "@tabler/icons-react";
import type { CSSProperties } from "react";

// Torn tape ends, seeded so the server and every visit draw the same edges.
function tapeClipPaths(count: number): string[] {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => {
    const left: string[] = [];
    const right: string[] = [];
    for (let i = 0; i <= 6; i++) {
      const y = ((i / 6) * 100).toFixed(1);
      left.push(`${(i % 2 ? 4 + rnd() * 3 : rnd() * 1.5).toFixed(1)}% ${y}%`);
      right.push(`${(100 - (i % 2 ? 4 + rnd() * 3 : rnd() * 1.5)).toFixed(1)}% ${(100 - (i / 6) * 100).toFixed(1)}%`);
    }
    return `polygon(${left.join(",")},${right.join(",")})`;
  });
}

const HEADLINE_TAPE = "clamp(52px,6vw,108px)";
const SUB_TAPE = "clamp(46px,4.4vw,70px)";
const clips = tapeClipPaths(6);

const tapes: { tw: string; r: number; d: number; place: CSSProperties }[] = [
  { tw: HEADLINE_TAPE, r: -14, d: 980, place: { left: `calc(${HEADLINE_TAPE} * -0.5)`, top: "14%" } },
  { tw: HEADLINE_TAPE, r: 9, d: 1100, place: { right: `calc(${HEADLINE_TAPE} * -0.42)`, bottom: "18%" } },
  { tw: HEADLINE_TAPE, r: 11, d: 1260, place: { left: `calc(${HEADLINE_TAPE} * -0.48)`, bottom: "24%" } },
  { tw: HEADLINE_TAPE, r: -10, d: 1360, place: { right: `calc(${HEADLINE_TAPE} * -0.4)`, top: "20%" } },
  { tw: SUB_TAPE, r: -28, d: 1560, place: { left: -22, top: -12 } },
  { tw: SUB_TAPE, r: 24, d: 1640, place: { right: -18, top: -10 } },
];

function Tape({ index }: { index: number }) {
  const { tw, r, d, place } = tapes[index];
  const style = { ...place, "--tw": tw, "--r": `${r}deg`, "--d": `${d}ms`, "--cp": clips[index] } as CSSProperties;
  return <i className="v2-tape" style={style} aria-hidden="true" />;
}

export default function HeroV2BIZ() {
  return (
    <section
      aria-labelledby="v2-hero-title"
      className="relative isolate flex min-h-[calc(100svh-72px)] flex-col justify-end overflow-hidden bg-linear-to-b from-v2-hero-top via-v2-paper-2 to-v2-paper-2 pt-[clamp(88px,12vh,140px)] pb-[clamp(40px,7vh,80px)] text-v2-ink max-md:pt-6"
    >
      <div
        aria-hidden="true"
        className="v2-liquid v2-hero-liquid top-[-30%] right-[calc(max(var(--v2-gutter),(100vw-var(--v2-wrap))/2+var(--v2-gutter))-330px)] aspect-square w-[min(64vw,920px)] max-md:top-[-8%] max-md:right-[-30%] max-md:w-[120vw]"
      >
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[30%] bg-linear-to-t from-v2-paper-2 from-[4%] to-transparent" />

      <aside
        aria-label="Contoh Rapor AI"
        className="v2-glass v2-glass-in relative mx-5 mb-auto max-w-85 rounded-[22px] px-4 pt-4 pb-3.5 sm:mx-8 md:absolute md:top-[clamp(24px,4.5vh,56px)] md:right-[max(var(--v2-gutter),calc((100vw-var(--v2-wrap))/2+var(--v2-gutter)))] md:mx-0 md:w-75 md:max-w-none"
      >
        <div className="mb-1.5 flex items-center justify-between gap-2.5 text-[0.92rem]">
          <b>Rapor AI · Q4</b>
          <span className="rounded-[5px] border border-dashed border-v2-ink-3 px-2 py-0.5 text-[0.72rem] font-bold text-v2-ink-3">Contoh</span>
        </div>
        {(
          [
            ["Finance", "ok"],
            ["Operations", "ok"],
            ["Human Capital", "warn"],
          ] as const
        ).map(([division, status]) => (
          <div key={division} className="flex items-center justify-between gap-2.5 border-t border-v2-forest/8 py-2 text-[0.86rem] font-semibold">
            <span>{division}</span>
            <RaporStatusLabelBIZ status={status} size="sm" />
          </div>
        ))}
        <div className="v2-press mt-2.5 flex items-center gap-2.5 rounded-xl bg-v2-lime px-3 py-2.5 text-[0.8rem] leading-[1.3] font-semibold text-v2-forest">
          <IconCircleCheck size={20} aria-hidden="true" className="flex-none" />
          <b className="font-jakarta text-2xl tracking-[-0.04em] tabular-nums">1.240</b>
          <span>jam dihemat per bulan, terverifikasi</span>
        </div>
      </aside>

      <div className={`${V2_WRAP} max-md:mt-10`}>
        <h1
          id="v2-hero-title"
          lang="en"
          className="font-jakarta text-[clamp(3.6rem,17vw,5rem)] leading-[0.86] font-extrabold tracking-[-0.058em] text-v2-forest md:text-[clamp(4.2rem,13vw,11.5rem)]"
        >
          <span className="relative block w-max max-w-full">
            <span className="v2-line">
              <span>Make AI</span>
            </span>
            <Tape index={0} />
            <Tape index={1} />
          </span>
          <span className="relative block w-max max-w-full">
            <span className="v2-line v2-line-2">
              <span>stick.</span>
            </span>
            <Tape index={2} />
            <Tape index={3} />
          </span>
        </h1>
        <div className="mt-[clamp(28px,5vh,56px)] flex flex-wrap items-end justify-between gap-x-12 gap-y-7">
          <p className="v2-rise max-w-[30ch] text-[clamp(1.12rem,1.7vw,1.5rem)] leading-[1.35] font-medium tracking-[-0.025em] text-v2-ink-2 [animation-delay:260ms]">
            <span className="relative inline-block">
              <b className="mb-[0.2em] block font-bold text-v2-forest">Pelatihan AI untuk perusahaan yang ingin hasil.</b>
              Kami latih tim Anda pada pekerjaan nyata, lalu lacak ROI-nya per orang dan per tim, setiap kuartal.
              <Tape index={4} />
              <Tape index={5} />
            </span>
          </p>
          <div className="v2-rise flex flex-col items-start gap-3 [animation-delay:340ms]">
            <AppButton href={`#${V2_FORM_ANCHOR}`} variant="forestV2" size="cta" trackPlacement="hero">
              <IconBrandWhatsapp size={19} aria-hidden="true" />
              Jadwalkan konsultasi 20 menit
            </AppButton>
            <p className="text-[0.88rem] text-v2-ink-3">Gratis, tanpa kewajiban. Langsung dengan konsultan kami.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
