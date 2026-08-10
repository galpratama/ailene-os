"use client";

import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

const modules = [
  {
    title: "AI Baseline & Safe Use",
    copy: "Memahami peluang, batasan, dan prinsip penggunaan AI yang bertanggung jawab.",
    kicker: "Fondasi bersama",
    lead: "Samakan cara kerja AI sebelum tim mulai bereksperimen.",
    points: ["Cara kerja AI dan batas penggunaannya", "Keamanan data dan prinsip penggunaan yang aman", "Standar prompt awal untuk seluruh tim"],
    result: "Baseline & guardrails tim",
  },
  {
    title: "Prompting & Context",
    copy: "Menyusun instruksi yang jelas dengan konteks kerja yang cukup.",
    kicker: "Instruksi yang jelas",
    lead: "Ubah kebutuhan kerja menjadi instruksi yang menghasilkan output lebih konsisten.",
    points: ["Struktur prompt yang mudah diulang", "Konteks, format, dan contoh yang relevan", "Prompt starter untuk workflow prioritas"],
    result: "Prompt starter kit",
  },
  {
    title: "Workflow Design",
    copy: "Memetakan pekerjaan berulang dan memilih bagian yang layak dibantu AI.",
    kicker: "Pemetaan workflow",
    lead: "Temukan titik kerja yang paling masuk akal untuk dibantu AI.",
    points: ["Peta alur kerja dan pekerjaan berulang", "Shortlist use case yang relevan", "Batas antara judgment manusia dan bantuan AI"],
    result: "Workflow map & use-case shortlist",
  },
  {
    title: "Role-based Lab",
    copy: "Menguji workflow pada contoh nyata dari fungsi yang ikut program.",
    kicker: "Praktik per role",
    lead: "Latihan langsung menggunakan konteks dan contoh kerja tiap fungsi.",
    points: ["Studi kasus sesuai tanggung jawab role", "Praktik menggunakan tools AI yang relevan", "Feedback untuk memperbaiki workflow"],
    result: "Contoh workflow per divisi",
  },
  {
    title: "Quality & Review",
    copy: "Memeriksa output, menjaga judgment, dan membuat standar kerja sederhana.",
    kicker: "Standar kualitas",
    lead: "Pastikan output AI tetap akurat, relevan, dan siap digunakan.",
    points: ["Checklist review untuk kualitas dan fakta", "Cara menjaga judgment manusia", "Standar output yang bisa dipakai bersama"],
    result: "Quality checklist & review standard",
  },
  {
    title: "Adoption Plan",
    copy: "Menentukan owner, ritme follow-up, dan langkah implementasi berikutnya.",
    kicker: "Langkah adopsi",
    lead: "Tutup program dengan langkah nyata agar penggunaan AI terus bergerak.",
    points: ["Owner dan workflow prioritas", "Ritme follow-up dan coaching", "Langkah implementasi 30 hari"],
    result: "Adoption plan 30 hari",
  },
];

export default function CurriculumHomeBIZ() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeModule = modules[activeIndex];

  return (
    <section id="curriculum" className="bg-[linear-gradient(180deg,var(--color-biz-paper),var(--color-biz-paper-end))] py-18 sm:py-28">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <SectionHeaderHomeBIZ
          eyebrow="Curriculum"
          title="Enam langkah terstruktur untuk hasil yang nyata."
          copy="Kurikulum membawa tim dari baseline yang aman, praktik yang relevan, sampai rencana adopsi yang bisa dijalankan."
        />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)]">
          <div role="tablist" aria-orientation="vertical" aria-label="Enam modul kurikulum" className="overflow-hidden rounded-xl border border-biz-forest-light/15 bg-white/78">
            {modules.map((module, index) => {
              const active = activeIndex === index;
              return (
                <button
                  key={module.title}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveIndex(index)}
                  className={`grid min-h-21 w-full cursor-pointer grid-cols-[34px_minmax(0,1fr)_20px] items-center gap-3 border-b border-biz-forest/10 px-3.5 py-3.5 text-left transition-colors last:border-b-0 sm:grid-cols-[42px_minmax(0,1fr)_24px] sm:px-5 ${active ? "bg-biz-lime/15 shadow-[inset_3px_0_0_var(--color-biz-forest-light)]" : "bg-transparent hover:bg-white"}`}
                >
                  <span className="grid size-8.5 place-items-center rounded-full bg-biz-lime text-[13px] font-semibold text-biz-forest">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong className="block text-[15px] font-medium tracking-[-0.03em] text-biz-ink">{module.title}</strong>
                    <span className="mt-1 block max-w-117.5 text-xs leading-[1.45] text-biz-muted">{module.copy}</span>
                  </span>
                  <ArrowRight size={18} className={`text-biz-forest-light transition-transform ${active ? "translate-x-1" : ""}`} />
                </button>
              );
            })}
          </div>

          <div className="relative pb-7">
            <figure className="overflow-hidden rounded-2xl border border-biz-forest-light/15 bg-biz-forest shadow-[0_20px_60px_rgba(6,35,25,0.1)]">
              <Image
                src="/biz/curriculum-training.jpg"
                alt="Tim sedang berkolaborasi dalam sesi AI training"
                width={1400}
                height={933}
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="h-80 w-full object-cover lg:h-135"
              />
              <figcaption className="px-4.5 pt-3.5 pb-4 text-xs leading-relaxed text-white/72">
                Latihan dirancang untuk bergerak dari pemahaman ke workflow yang dipakai.
              </figcaption>
            </figure>

            <aside role="tabpanel" className="relative mx-3.5 -mt-12 rounded-2xl border border-biz-forest-light/15 bg-white/96 p-5 shadow-[0_18px_50px_rgba(6,35,25,0.16)] lg:absolute lg:right-0 lg:bottom-0 lg:m-0 lg:w-[min(86%,360px)] lg:p-5.5">
              <span className="block text-[9px] font-semibold tracking-[0.12em] text-biz-forest-light uppercase">{String(activeIndex + 1).padStart(2, "0")} · {activeModule.kicker}</span>
              <h3 className="mt-2 text-xl font-medium tracking-[-0.045em] text-biz-forest">Tim Anda akan:</h3>
              <p className="mt-2 text-xs leading-[1.55] text-biz-muted">{activeModule.lead}</p>
              <ul className="mt-4.5 grid gap-2.5 border-t border-biz-forest/10 pt-4">
                {activeModule.points.map((point) => (
                  <li key={point} className="grid grid-cols-[16px_1fr] gap-2 text-xs leading-[1.45] text-biz-muted"><Check size={15} className="mt-0.5 text-biz-forest-light" />{point}</li>
                ))}
              </ul>
              <div className="mt-4.5 border-t border-biz-forest/10 pt-4">
                <span className="text-[11px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">Output utama</span>
                <p className="mt-2 text-xs leading-normal text-biz-muted">{activeModule.result}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
