"use client";

import RaporStatusLabelBIZ from "@/components/labels/RaporStatusLabelBIZ";
import {
  preselectLeadForm,
  V2_FORM_ANCHOR,
  V2_H2,
  V2_LEAD,
  V2_SAMPLE,
  V2_SECTION,
  V2_WRAP,
  type ServiceInterest,
} from "@/lib/biz-home-v2";
import { trackCTAClick } from "@/lib/conversion";
import { IconArrowRight } from "@tabler/icons-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const verbs: {
  name: string;
  what: string;
  detail: string;
  go: string;
  interest?: ServiceInterest;
}[] = [
  {
    name: "Consult",
    what: "Temukan di mana AI paling cepat memberi hasil. 2 minggu.",
    detail: "Ailene Score (indeks kesiapan AI), use case teratas berdasarkan ROI, kebijakan penggunaan AI (UU PDP), roadmap 12 bulan.",
    go: "Bahas Ailene Readiness",
    interest: "consult",
  },
  {
    name: "Train",
    what: "Dari Komisaris sampai tim, pada pekerjaan nyata.",
    detail: "Komisaris 2 jam, Direksi setengah hari, Manajer 1 hari, tim dengan jalur per peran. Transformation Sprint 10 minggu.",
    go: "Bahas program pelatihan",
    interest: "train",
  },
  {
    name: "Automate",
    what: "Use case yang terbukti, jadi alur kerja harian.",
    detail: "Proses yang sudah terbukti hemat waktu kami bangun di sistem Anda, dengan manusia tetap memegang keputusan.",
    go: "Bahas Ailene Automate",
    interest: "automate",
  },
  {
    name: "Prove",
    what: "Rapor AI setiap kuartal, per divisi.",
    detail: "Skor kompetensi setiap karyawan, use case terverifikasi, dan jam dihemat, dalam satu halaman untuk Direksi.",
    go: "Lihat contoh Rapor AI",
  },
];

function MediaCard({ children, sample = true }: { children: ReactNode; sample?: boolean }) {
  return (
    <div className="relative w-[min(100%,430px)] rounded-[14px] bg-white px-6 pt-6 pb-5.5 text-v2-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)]">
      {sample && <span className={`${V2_SAMPLE} absolute top-5 right-5`}>Contoh</span>}
      {children}
    </div>
  );
}

const media: ReactNode[] = [
  <MediaCard key="consult">
    <p className="text-[0.84rem] font-bold text-v2-ink-3">Ailene Score</p>
    <p className="mt-1.5 font-jakarta text-[4.2rem] leading-none font-extrabold tracking-[-0.05em] tabular-nums">
      41<small className="ml-1.5 text-base tracking-normal text-v2-ink-3">/100</small>
    </p>
    <div className="mt-5 grid gap-3">
      {(
        [
          ["Strategi & kepemimpinan", 52],
          ["Keterampilan tim", 38],
          ["Data & tata kelola", 33],
          ["Pemakaian harian", 41],
        ] as const
      ).map(([label, value]) => (
        <span key={label} className="block text-[0.9rem] font-semibold">
          {label}
          <i className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-v2-paper-3">
            <i className="block h-full bg-v2-green" style={{ width: `${value}%` }} />
          </i>
        </span>
      ))}
    </div>
  </MediaCard>,
  <MediaCard key="train" sample={false}>
    <p className="text-[0.84rem] font-bold text-v2-ink-3">Program per level</p>
    <div className="mt-3.5 grid gap-2">
      {(
        [
          ["Komisaris", "2 jam"],
          ["Direksi", "Setengah hari"],
          ["Manajer", "1 hari"],
          ["Tim", "Jalur per peran"],
        ] as const
      ).map(([level, length], index) => (
        <span
          key={level}
          style={{ marginLeft: `${index * 6}%` }}
          className={`flex justify-between gap-3 rounded-[10px] px-3.5 py-3 text-[0.92rem] ${
            index === 3 ? "bg-v2-forest text-v2-on-forest" : "bg-v2-paper-2"
          }`}
        >
          <b>{level}</b>
          {length}
        </span>
      ))}
    </div>
  </MediaCard>,
  <MediaCard key="automate">
    <p className="text-[0.84rem] font-bold text-v2-ink-3">Contoh alur: invoice</p>
    <ol className="mt-3.5 grid gap-2">
      {["Invoice masuk", "AI mengekstrak dan mencocokkan", "Manusia menyetujui pengecualian", "Masuk ERP, dengan jejak audit"].map((step, index) => (
        <li
          key={step}
          className={`flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[0.92rem] font-semibold ${index === 2 ? "bg-v2-green-soft" : "bg-v2-paper-2"}`}
        >
          <span className="font-extrabold text-v2-ink-3 tabular-nums">{index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  </MediaCard>,
  <MediaCard key="prove">
    <p className="text-[0.84rem] font-bold text-v2-ink-3">Rapor AI · Kuartal IV</p>
    <div className="mt-3 grid">
      {(
        [
          ["Sales", "ok"],
          ["Finance", "ok"],
          ["Operations", "warn"],
          ["Legal", "risk"],
        ] as const
      ).map(([division, status]) => (
        <span key={division} className="flex items-center justify-between border-b border-v2-paper-2 py-2.5 text-[0.95rem] font-bold">
          {division}
          <RaporStatusLabelBIZ status={status} />
        </span>
      ))}
    </div>
    <p className="mt-3.5 flex items-baseline gap-2 rounded-[10px] bg-v2-lime px-3.5 py-3 text-[0.85rem] text-v2-lime-ink">
      <b className="font-jakarta text-[1.8rem] tracking-[-0.04em] text-v2-forest tabular-nums">1.240</b> jam / bulan, terverifikasi
    </p>
  </MediaCard>,
];

export default function ServicesV2BIZ() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // The item crossing the middle of the viewport drives the media panel.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    itemRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="layanan" aria-labelledby="v2-verbs" className={`${V2_SECTION} bg-v2-paper`}>
      <div className={V2_WRAP}>
        <div className="max-w-190">
          <h2 id="v2-verbs" className={V2_H2}>
            Consult. Train. Automate. Prove.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Satu sistem dari diagnosis sampai laporan ke Direksi. Mulai dari langkah mana pun, ukur di langkah terakhir.
          </p>
        </div>
        <div className="mt-[clamp(36px,5vw,64px)] grid items-start gap-[clamp(32px,5vw,80px)] min-[900px]:grid-cols-[6fr_5fr]">
          <ol>
            {verbs.map((verb, index) => {
              const on = active === index;
              return (
                <li
                  key={verb.name}
                  id={`layanan-${verb.name.toLowerCase()}`}
                  data-index={index}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  onFocus={() => setActive(index)}
                  className="group flex items-center border-t border-v2-rule last:border-b min-[900px]:min-h-[60vh]"
                >
                  <a
                    href={verb.interest ? `#${V2_FORM_ANCHOR}` : "#rapor"}
                    onClick={() => {
                      trackCTAClick({ placement: "solution" });
                      if (verb.interest) preselectLeadForm({ interest: verb.interest });
                    }}
                    className="block w-full py-9"
                  >
                    <h3
                      className={`font-jakarta text-[clamp(2.6rem,5.2vw,4.6rem)] leading-[1.04] font-extrabold tracking-[-0.045em] transition-colors duration-300 group-hover:text-v2-green max-[900px]:text-v2-ink ${
                        on ? "text-v2-ink" : "text-v2-faded"
                      }`}
                    >
                      {verb.name}
                    </h3>
                    <div className={`transition-opacity duration-300 max-[900px]:opacity-100 ${on ? "opacity-100" : "opacity-40"}`}>
                      <p className="mt-3 text-[1.2rem] leading-[1.35] font-bold">{verb.what}</p>
                      <p className="mt-2 max-w-[44ch] text-v2-ink-2">{verb.detail}</p>
                      <span className="mt-4.5 inline-flex items-center gap-1.5 font-bold text-v2-green">
                        {verb.go}
                        <IconArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
          <div
            aria-hidden="true"
            className="sticky top-28 hidden h-[min(68vh,560px)] overflow-hidden rounded-2xl bg-v2-paper-2 bg-[radial-gradient(70%_60%_at_82%_8%,color-mix(in_srgb,var(--v2-leaf)_60%,transparent),transparent_62%),radial-gradient(60%_55%_at_8%_100%,color-mix(in_srgb,var(--v2-lime)_38%,transparent),transparent_60%),radial-gradient(50%_50%_at_90%_95%,color-mix(in_srgb,var(--v2-forest)_22%,transparent),transparent_60%)] min-[900px]:block"
          >
            {media.map((card, index) => (
              <div
                key={index}
                className={`v2-media absolute inset-0 grid place-items-center p-[clamp(20px,4vw,48px)] ${active === index ? "is-on" : ""}`}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
