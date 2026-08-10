import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";
import { Check } from "lucide-react";

export default function AdoptionProofHomeBIZ() {
  return (
    <section id="adoption-gap" className="overflow-hidden py-18 sm:py-28">
      <div className="mx-auto grid w-full max-w-315 items-center gap-11 px-4.5 sm:px-7.5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-biz-lime uppercase">The adoption gap</p>
          <h2 className="mt-3.5 max-w-146 text-[clamp(3rem,5.1vw,5.25rem)] leading-[0.92] font-medium tracking-[-0.06em]">
            Training selesai. <span className="text-biz-lime">Adopsi belum tentu dimulai.</span>
          </h2>
          <p className="mt-6 max-w-126 text-base leading-[1.7] text-white/68">
            Banyak tim selesai belajar, tetapi belum punya ritme untuk memakai AI di pekerjaan nyata.
          </p>
          <ul className="mt-7 grid max-w-120 gap-4">
            {[
              "Tim siap menerapkan AI pada workflow prioritas.",
              "Progres adopsi terjaga sampai berdampak pada bisnis.",
            ].map((point) => (
              <li key={point} className="grid grid-cols-[20px_1fr] items-start gap-3 text-sm leading-[1.5] text-white/70">
                <Check size={19} className="mt-0.5 text-biz-lime" />
                <strong className="font-semibold text-white">{point}</strong>
              </li>
            ))}
          </ul>
          <LinkButtonBIZ href="#how-we-work" variant="outlineDark" className="mt-7.5">
            Lihat cara Ailene bekerja
          </LinkButtonBIZ>
        </div>

        <div className="min-w-0 rounded-2xl border border-biz-lime/35 bg-white/3 p-4 sm:p-7.5">
          <h3 className="text-[clamp(1.7rem,2.45vw,2.2rem)] leading-none font-medium tracking-[-0.035em] text-white">
            Yang membedakan bukan hari pertama.
          </h3>
          <p className="mt-2 max-w-110 text-sm leading-relaxed text-white/58">Minggu ke berapa AI berhenti dipakai?</p>
          <div className="mt-5 flex flex-wrap gap-4 text-[10px] text-white/65">
            <span className="flex items-center gap-2 before:h-0.75 before:w-6 before:rounded-full before:bg-biz-lime before:content-['']">Dengan Ailene</span>
            <span className="flex items-center gap-2 before:w-6 before:border-t-2 before:border-dashed before:border-white/35 before:content-['']">Provider corporate AI lain</span>
          </div>

          <svg viewBox="0 0 620 280" className="mt-2 h-auto w-full overflow-visible" role="img" aria-labelledby="adoption-chart-title adoption-chart-desc">
            <title id="adoption-chart-title">Adoption rate setelah AI training</title>
            <desc id="adoption-chart-desc">Dengan Ailene, adopsi terus meningkat setelah follow-through. Tanpa follow-through, momentum penggunaan AI menurun.</desc>
            <g fill="none" strokeWidth="1">
              <path d="M72 66H580M72 132H580" className="stroke-white/8" />
              <path d="M72 232H580M72 42V232" className="stroke-white/20" />
              <path d="M250 42V232" strokeDasharray="4 6" className="stroke-biz-lime/50" strokeWidth="1.5" />
            </g>
            <path d="M72 86 C126 42 190 54 250 112 C318 172 376 211 448 222 C500 230 536 220 560 205" fill="none" strokeDasharray="5 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" className="stroke-white/35" />
            <path d="M72 86 C126 42 190 54 250 112 C318 70 376 38 448 26 C500 20 536 22 560 30" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" className="stroke-biz-lime" />
            <circle cx="72" cy="86" r="5" className="fill-white" />
            <circle cx="250" cy="112" r="6" className="fill-biz-forest stroke-biz-lime" strokeWidth="3" />
            <circle cx="560" cy="30" r="6" className="fill-biz-lime" />
            <circle cx="560" cy="205" r="6" className="fill-white/50" />
            <g className="fill-white/45 text-[10px]">
              <text x="28" y="69">100%</text><text x="35" y="135">50%</text><text x="42" y="235">0%</text>
              <text x="53" y="256">Training</text><text x="210" y="256">Minggu 1</text><text x="358" y="256">Minggu 4</text><text x="510" y="256">Minggu 6</text>
              <text x="445" y="198">momentum turun</text>
            </g>
            <g className="fill-biz-lime text-[10px] font-semibold">
              <text x="202" y="96">follow-through dimulai</text>
              <text x="466" y="20">terus dipakai</text>
            </g>
          </svg>
          <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-white/40">Ilustrasi konsep, bukan benchmark statistik.</p>
        </div>
      </div>
    </section>
  );
}
