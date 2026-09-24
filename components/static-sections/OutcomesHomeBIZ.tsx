import { Check } from "lucide-react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";
import PageMargin from "@/components/layouts/PageMargin";

function EfficiencyVisual() {
  return (
    <div className="relative -mx-5.5 -mb-5.5 mt-5 aspect-[3/2] overflow-hidden sm:-mx-6 sm:-mb-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- external illustration is intentionally rendered without image optimization */}
      <img
        src="https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/ailene/ChatGPT%20Image%20Sep%2024,%202026,%2003_03_48%20PM.webp"
        alt="Ilustrasi kerja selesai lebih cepat tanpa menambah orang"
        loading="lazy"
        decoding="async"
        className="absolute inset-x-0 bottom-0 block h-auto w-full object-contain object-left-bottom"
      />
    </div>
  );
}

function DecisionVisual() {
  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-biz-paper/75 p-3">
      <div className="flex justify-between font-mono text-[8px] tracking-[0.08em] text-biz-muted uppercase">
        <span>Ringkasan kinerja</span>
        <span>30 hari terakhir</span>
      </div>
      <svg
        viewBox="0 0 520 160"
        className="mt-2 h-29 w-full"
        aria-hidden="true"
      >
        <path
          d="M18 34H502M18 78H502M18 122H502"
          fill="none"
          stroke="currentColor"
          className="text-biz-forest/10"
        />
        <path
          d="M24 132L118 100L210 112L304 68L386 82L490 30V144H24Z"
          className="fill-biz-forest-light/15"
        />
        <path
          d="M24 132L118 100L210 112L304 68L386 82L490 30"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          className="text-biz-forest-light"
        />
        {[
          [24, 132],
          [118, 100],
          [210, 112],
          [304, 68],
          [386, 82],
          [490, 30],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="5"
            className="fill-biz-forest-light"
          />
        ))}
      </svg>
      <div className="flex justify-between font-mono text-[8px] text-biz-muted">
        <span>Minggu 1</span>
        <span>Minggu 2</span>
        <span>Minggu 3</span>
        <span>Minggu 4</span>
      </div>
    </div>
  );
}

function QualityVisual() {
  return (
    <div className="mt-5 grid grid-cols-[1.08fr_0.92fr] gap-4 rounded-xl bg-biz-paper p-3.5">
      <div className="flex min-h-35 flex-col rounded-xl bg-white p-4">
        <span className="h-1.5 w-2/5 rounded-full bg-biz-sage" />
        <p className="mt-4 text-[10px] leading-[1.55] text-biz-muted">
          Ringkasan pekerjaan disusun dengan struktur yang mudah dibaca dan siap
          diteruskan ke langkah berikutnya.
        </p>
        <div className="mt-2.5 grid gap-2">
          <i className="h-1.25 w-3/5 rounded-full bg-biz-sage" />
          <i className="h-1.25 w-4/5 rounded-full bg-biz-sage" />
        </div>
      </div>
      <div className="grid content-center gap-3.5">
        {[
          ["Jelas", "Bahasa mudah dipahami"],
          ["Lengkap", "Semua poin penting ada"],
          ["Siap dikirim", "Struktur dan format sesuai"],
        ].map(([label, note]) => (
          <div
            key={label}
            className="grid grid-cols-[22px_1fr] gap-2 text-[11px] font-medium"
          >
            <Check size={20} className="text-biz-forest-light" />
            <span>
              {label}
              <small className="block text-[9px] font-normal text-biz-muted">
                {note}
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapacityVisual() {
  return (
    <div className="relative -mx-5.5 -mb-5.5 mt-2 aspect-[5/4] overflow-hidden sm:-mx-6 sm:-mb-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- external illustration is intentionally rendered without image optimization */}
      <img
        src="https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/ailene/ChatGPT%20Image%20Sep%2024,%202026,%2003_27_47%20PM.webp"
        alt="Ilustrasi lebih banyak yang bisa dikerjakan tanpa menambah beban"
        loading="lazy"
        decoding="async"
        className="absolute bottom-0 left-1/2 block h-auto w-2/3 -translate-x-1/2 object-contain object-bottom"
      />
    </div>
  );
}

const outcomes = [
  {
    label: "Efisiensi operasional",
    title: (
      <>
        Kerja selesai lebih cepat, tanpa{" "}
        <span className="text-biz-forest-light">tambah orang.</span>
      </>
    ),
    copy: "AI mengurangi pekerjaan berulang agar tim fokus pada hal yang lebih strategis.",
    tone: "bg-biz-mint",
    visual: <EfficiencyVisual />,
  },
  {
    label: "Keputusan lebih cepat",
    title: (
      <>
        Dari data jadi <span className="text-biz-forest-light">keputusan</span>{" "}
        dalam hitungan menit.
      </>
    ),
    copy: "Dapatkan ringkasan, pola, dan rekomendasi untuk menentukan langkah berikutnya.",
    visualBeforeTitle: true,
    tone: "bg-biz-sage",
    visual: <DecisionVisual />,
  },
  {
    label: "Kualitas konsisten",
    title: (
      <>
        Output tim lebih rapi, standar tetap{" "}
        <span className="text-biz-forest-light">terjaga.</span>
      </>
    ),
    copy: "AI membantu menulis, merangkum, dan memeriksa pekerjaan dengan standar konsisten.",
    visualBeforeTitle: true,
    tone: "bg-white",
    visual: <QualityVisual />,
  },
  {
    label: "Kapasitas untuk tumbuh",
    title: (
      <>
        Lebih banyak yang bisa dikerjakan, tanpa{" "}
        <span className="text-biz-forest-light">menambah beban.</span>
      </>
    ),
    copy: "Tangani lebih banyak pelanggan, proyek, dan peluang dengan tim yang sama.",
    tone: "bg-white",
    visual: <CapacityVisual />,
  },
];

export default function OutcomesHomeBIZ() {
  return (
    <section id="how-we-work" className="bg-white py-18 sm:py-29">
      <PageMargin>
        <SectionHeaderHomeBIZ
          centered
          eyebrow="Outcome training"
          title={
            <>
              AI yang bikin tim bekerja lebih cepat,{" "}
              <span className="text-biz-forest-light">
                rapi, dan siap tumbuh.
              </span>
            </>
          }
        />

        {/* Two independent columns on desktop so cards differ in height and stagger; on mobile the
            column wrappers dissolve (contents) and `order` restores the 01-04 reading order. */}
        <div className="flex flex-col gap-3.5 lg:flex-row">
          {[
            [0, 2],
            [1, 3],
          ].map((column) => (
            <div
              key={column[0]}
              className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-3.5"
            >
              {column.map((index) => {
                const outcome = outcomes[index];
                return (
                  <article
                    key={outcome.label}
                    style={{ order: index }}
                    className={`relative flex flex-col overflow-hidden rounded-xl border border-biz-forest/10 p-5.5 shadow-[0_12px_30px_rgba(0,59,43,0.06)] sm:p-6 ${outcome.tone}`}
                  >
                    {outcome.visualBeforeTitle && (
                      <div className="mb-3">{outcome.visual}</div>
                    )}
                    <h3 className="max-w-130 text-[clamp(1.8rem,2.3vw,2.15rem)] leading-[1.02] font-medium tracking-[-0.055em]">
                      {outcome.title}
                    </h3>
                    <p className="mt-2.5 max-w-135 text-base leading-[1.5] text-biz-muted">
                      {outcome.copy}
                    </p>
                    {!outcome.visualBeforeTitle && outcome.visual}
                  </article>
                );
              })}
            </div>
          ))}
        </div>

      </PageMargin>
    </section>
  );
}
