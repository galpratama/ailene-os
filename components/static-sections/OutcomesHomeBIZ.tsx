import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";
import { ArrowRight, Check } from "lucide-react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

function EfficiencyVisual() {
  const manual = ["Kumpulkan data", "Buat laporan", "Rangkum temuan", "Revisi akhir"];
  const ai = ["Data dikumpulkan", "Laporan dibuat", "Rangkuman siap", "Siap digunakan"];

  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-white/48">
      <div className="flex justify-between border-b border-biz-forest/10 px-3 py-2.5 font-mono text-[8px] tracking-[0.08em] text-biz-muted uppercase">
        <span>Waktu kerja yang kembali</span>
        <span>Contoh workflow</span>
      </div>
      <div className="grid grid-cols-[1fr_20px_1fr] items-center gap-1.5 p-3">
        {[
          { label: "Manual", time: "04:30:00", rows: manual },
          { label: "Dengan AI", time: "01:15:00", rows: ai },
        ].map((column, index) => (
          <div key={column.label} className="contents">
            {index === 1 && <ArrowRight size={18} className="text-biz-forest-light" />}
            <div className="min-h-33 rounded-lg bg-white/62 p-2.5">
              <span className="text-[10px] font-semibold text-biz-muted">{column.label}</span>
              <strong className="mt-1 block text-lg font-medium tracking-[-0.04em] text-biz-forest">
                {column.time}
              </strong>
              <ul className="mt-2 grid gap-1 text-[9px] leading-snug text-biz-muted">
                {column.rows.map((row) => (
                  <li key={row}>{row}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
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
      <svg viewBox="0 0 520 160" className="mt-2 h-29 w-full" aria-hidden="true">
        <path d="M18 34H502M18 78H502M18 122H502" fill="none" stroke="currentColor" className="text-biz-forest/10" />
        <path d="M24 132L118 100L210 112L304 68L386 82L490 30V144H24Z" className="fill-biz-forest-light/15" />
        <path d="M24 132L118 100L210 112L304 68L386 82L490 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" className="text-biz-forest-light" />
        {[ [24, 132], [118, 100], [210, 112], [304, 68], [386, 82], [490, 30] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" className="fill-biz-forest-light" />
        ))}
      </svg>
      <div className="flex justify-between font-mono text-[8px] text-biz-muted">
        <span>Minggu 1</span><span>Minggu 2</span><span>Minggu 3</span><span>Minggu 4</span>
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
          Ringkasan pekerjaan disusun dengan struktur yang mudah dibaca dan siap diteruskan ke langkah berikutnya.
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
          <div key={label} className="grid grid-cols-[22px_1fr] gap-2 text-[11px] font-medium">
            <Check size={20} className="text-biz-forest-light" />
            <span>{label}<small className="block text-[9px] font-normal text-biz-muted">{note}</small></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ type }: { type: "line" | "bar" | "zigzag" }) {
  if (type === "bar") {
    return (
      <svg viewBox="0 0 140 52" className="mt-2 h-13 w-full" aria-hidden="true">
        {[ [5,38,10], [29,25,23], [53,35,13], [77,13,35], [101,26,22], [125,4,44] ].map(([x, y, height], index) => (
          <rect key={x} x={x} y={y} width="17" height={height} rx="2" className={index === 3 || index === 5 ? "fill-biz-forest-light" : "fill-biz-forest-light/45"} />
        ))}
      </svg>
    );
  }

  const points = type === "line" ? "4,46 28,30 50,38 76,19 101,30 136,6" : "4,44 22,16 41,38 61,10 82,33 101,23 119,4 136,29";
  return (
    <svg viewBox="0 0 140 52" className="mt-2 h-13 w-full" aria-hidden="true">
      <polygon points={`${points} 136,50 4,50`} className="fill-biz-forest-light/15" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="text-biz-forest-light" />
    </svg>
  );
}

function CapacityVisual() {
  const metrics = [
    { label: "Pelanggan", value: "+28%", type: "line" as const },
    { label: "Proyek", value: "+19%", type: "bar" as const },
    { label: "Peluang", value: "+34%", type: "zigzag" as const },
  ];

  return (
    <div className="mt-5 rounded-xl bg-biz-paper p-3.5">
      <div className="flex justify-between font-mono text-[8px] tracking-[0.08em] text-biz-muted uppercase">
        <span>Kapasitas & pertumbuhan</span><span>Contoh indikator</span>
      </div>
      <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl bg-white/70">
        {metrics.map((metric) => (
          <div key={metric.label} className="border-r border-biz-forest/10 p-2.5 last:border-r-0">
            <span className="text-[9px] text-biz-muted">{metric.label}</span>
            <strong className="mt-1 block text-xl font-medium tracking-[-0.04em] text-biz-forest-light">{metric.value}</strong>
            <MiniChart type={metric.type} />
          </div>
        ))}
      </div>
    </div>
  );
}

const outcomes = [
  {
    label: "Efisiensi operasional",
    title: <>Kerja selesai lebih cepat, tanpa <span className="text-biz-forest-light">tambah orang.</span></>,
    copy: "Tim mengurangi pekerjaan berulang dan memindahkan waktu ke tugas yang menghasilkan dampak lebih besar.",
    tone: "bg-biz-mint",
    visual: <EfficiencyVisual />,
  },
  {
    label: "Keputusan lebih cepat",
    title: <>Dari data jadi <span className="text-biz-forest-light">keputusan</span> dalam hitungan menit.</>,
    copy: "Tim mendapatkan ringkasan, pola, dan rekomendasi yang bisa langsung dipakai untuk menentukan langkah berikutnya.",
    tone: "bg-biz-sage",
    visual: <DecisionVisual />,
  },
  {
    label: "Kualitas konsisten",
    title: <>Output tim lebih rapi, standar tetap <span className="text-biz-forest-light">terjaga.</span></>,
    copy: "AI membantu tim menulis, merangkum, dan memeriksa pekerjaan dengan standar yang sama di setiap proses.",
    tone: "bg-white",
    visual: <QualityVisual />,
  },
  {
    label: "Kapasitas untuk tumbuh",
    title: <>Lebih banyak yang bisa dikerjakan, tanpa <span className="text-biz-forest-light">menambah beban.</span></>,
    copy: "Bangun sistem kerja yang membantu bisnis menangani lebih banyak pelanggan, proyek, dan peluang dengan tim yang sama.",
    tone: "bg-white",
    visual: <CapacityVisual />,
  },
];

export default function OutcomesHomeBIZ() {
  return (
    <section id="how-we-work" className="bg-biz-paper py-18 sm:py-29">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <SectionHeaderHomeBIZ
          centered
          eyebrow="Outcome training"
          title={<>AI yang bikin tim bekerja lebih cepat, <span className="text-biz-forest-light">rapi, dan siap tumbuh.</span></>}
          copy="Bangun cara kerja yang lebih efisien dengan AI—supaya waktu kembali, kualitas naik, keputusan lebih cepat, dan bisnis punya ruang untuk berkembang."
        />

        <div className="grid gap-3.5 lg:grid-cols-2">
          {outcomes.map((outcome, index) => (
            <article key={outcome.label} className={`h-full min-h-90 rounded-xl border border-biz-forest/10 p-5.5 shadow-[0_12px_30px_rgba(0,59,43,0.06)] sm:p-6 ${outcome.tone}`}>
              <span className="mr-2 inline-block text-[17px] font-semibold text-biz-forest-light underline decoration-biz-lime decoration-2 underline-offset-4">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-medium tracking-[0.04em] text-biz-forest-light uppercase">{outcome.label}</span>
              <h3 className="mt-3.5 max-w-130 text-[clamp(1.8rem,2.3vw,2.15rem)] leading-[1.02] font-medium tracking-[-0.055em]">{outcome.title}</h3>
              <p className="mt-2.5 max-w-135 text-[13px] leading-[1.5] text-biz-muted">{outcome.copy}</p>
              {outcome.visual}
            </article>
          ))}
        </div>

        <aside className="mt-5.5 flex flex-col gap-5 rounded-xl bg-biz-forest p-5.5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[12px] font-medium tracking-[0.08em] text-biz-lime uppercase">Langkah berikutnya</p>
            <h3 className="mt-1.5 text-[clamp(1.45rem,2.5vw,2.1rem)] leading-none font-medium tracking-[-0.055em]">Ubah cara kerja tim. Buka ruang untuk pertumbuhan.</h3>
          </div>
          <LinkButtonBIZ href="#adoption-gap" variant="lime" className="shrink-0">Lihat dampak untuk bisnis Anda</LinkButtonBIZ>
        </aside>
      </div>
    </section>
  );
}
