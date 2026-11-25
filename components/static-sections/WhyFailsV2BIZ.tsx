import { V2_H2, V2_LEAD, V2_SECTION, V2_WRAP } from "@/lib/biz-home-v2";

const fails = [
  ["Workshop", "Dilupakan dalam seminggu."],
  ["Lisensi", "Sudah dibayar, tidak dipakai."],
  ["Laporan", "Tidak ada yang memegang angkanya."],
] as const;

export default function WhyFailsV2BIZ() {
  return (
    <section aria-labelledby="v2-fails" className={`${V2_SECTION} bg-v2-paper-2`}>
      <div className={`${V2_WRAP} grid items-start gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-[5fr_7fr]`}>
        <div>
          <h2 id="v2-fails" className={V2_H2}>
            Sebagian besar pelatihan AI tidak punya target ROI.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Tanpa target, tidak ada yang diukur. Tanpa ukuran, tidak ada yang bisa dilaporkan ke Direksi.
          </p>
          <ul className="mt-8 border-t border-v2-rule">
            {fails.map(([what, why]) => (
              <li key={what} className="grid grid-cols-[120px_1fr] items-baseline gap-4 border-b border-v2-rule py-4.5">
                <b className="font-extrabold">{what}</b>
                <span className="text-v2-ink-2">{why}</span>
              </li>
            ))}
          </ul>
          <p className="mt-7 font-jakarta text-[clamp(1.4rem,2.4vw,1.8rem)] leading-[1.15] font-extrabold tracking-[-0.03em]">
            Tanpa target. Tanpa pelacakan. <span className="text-v2-green">Tanpa hasil.</span>
          </p>
        </div>
        <figure aria-labelledby="v2-curve-caption" className="rounded-2xl border border-v2-rule bg-white px-5.5 pt-5.5 pb-3.5">
          <svg viewBox="0 0 620 340" role="img" aria-labelledby="v2-curve-title v2-curve-desc" className="h-auto w-full overflow-visible">
            <title id="v2-curve-title">Pemakaian AI dari waktu ke waktu</title>
            <desc id="v2-curve-desc">
              Pelatihan sekali jalan memuncak di minggu pertama lalu turun mendekati nol. Program dengan target ROI dan pelacakan naik terus sampai bulan keenam.
            </desc>
            <g className="stroke-v2-rule" strokeWidth="1.5">
              <line x1="40" y1="290" x2="600" y2="290" />
              <line x1="40" y1="20" x2="40" y2="290" />
            </g>
            <g className="stroke-v2-paper-3" strokeWidth="1">
              <line x1="40" y1="155" x2="600" y2="155" />
              <line x1="40" y1="88" x2="600" y2="88" />
              <line x1="40" y1="222" x2="600" y2="222" />
            </g>
            <path d="M40 288 C 80 288, 92 70, 132 70 C 175 70, 190 230, 260 252 C 340 276, 470 280, 600 282" fill="none" className="stroke-v2-ink-3" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40 288 C 150 278, 230 250, 320 200 C 410 150, 500 80, 600 42" fill="none" className="stroke-v2-green" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="600" cy="42" r="6" className="fill-v2-green" />
            <g className="fill-v2-ink-3 text-[13px] font-semibold">
              <text x="48" y="16">Pemakaian AI</text>
              <text x="40" y="314">Minggu 1</text>
              <text x="600" y="314" textAnchor="end">Bulan 6</text>
              <text x="590" y="268" textAnchor="end">Pelatihan sekali jalan</text>
            </g>
            <text x="590" y="28" textAnchor="end" className="fill-v2-green text-[13px] font-bold">
              Dengan target ROI dan pelacakan
            </text>
          </svg>
          <figcaption id="v2-curve-caption" className="mt-2.5 text-[0.84rem] text-v2-ink-3">
            Ilustrasi pola, bukan data.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
