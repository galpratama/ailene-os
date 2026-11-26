"use client";

import RaporStatusLabelBIZ from "@/components/labels/RaporStatusLabelBIZ";
import { AcademyAssessmentMockV2BIZ, AcademyProgressMockV2BIZ, BrowserMock, Row, StatCard } from "@/components/elements/AcademyMocksV2BIZ";
import { V2_H2, V2_LEAD, V2_SECTION, V2_TEXT_LINK, V2_WRAP } from "@/lib/biz-home-v2";
import { useRef, useState, type ReactNode } from "react";

const panels: { tab: string; hint: string; title: string; points: [string, string][]; extra?: ReactNode; mock: ReactNode }[] = [
  {
    tab: "Progres seperti game",
    hint: "Level, XP, leaderboard",
    title: "Logo Anda. Kurikulum Anda. Semua data AI Anda di satu tempat.",
    points: [
      ["Naik level", "dari Foundation ke Practitioner, dengan tugas praktik per chapter"],
      ["XP", "dari use case, prompt, dan latihan yang diselesaikan"],
      ["Leaderboard", "per departemen, kohort, dan tim"],
      ["Domain sendiri", ", misalnya belajar.perusahaananda.co.id"],
    ],
    mock: <AcademyProgressMockV2BIZ />,
  },
  {
    tab: "Setiap karyawan diukur",
    hint: "Pre-assessment",
    title: "Setiap karyawan diukur. Bukan diperkirakan.",
    points: [
      ["Tiga dimensi dan enam pilar kompetensi", ", skor per orang dari 0 sampai 5"],
      ["Band 1 sampai 5", ": tingkat kemampuan AI, dari baru mengenal sampai memimpin perubahan"],
      ["Satu jalur per peran", ", dilacak setiap minggu"],
      ["Bukti nyata", ": progres datang dari pekerjaan yang dikirim, bukan video yang ditonton"],
    ],
    extra: <p className="mt-4 text-sm text-v2-ink-2">Dibangun di atas CFTE AI Proficiency Framework.</p>,
    mock: <AcademyAssessmentMockV2BIZ />,
  },
  {
    tab: "Setiap use case diverifikasi",
    hint: "Bukti kerja",
    title: "Setiap use case diverifikasi. Setiap jam dihitung.",
    points: [
      ["Sebelum dan sesudah", ", diisi oleh karyawan"],
      ["Bukti kerja", " dilampirkan"],
      ["Diperiksa champion", ", karyawan internal yang membimbing rekan di divisinya, sebelum masuk hitungan"],
    ],
    mock: (
      <BrowserMock url="Use case dikirim" label="Contoh use case terverifikasi">
        <div className="p-4.5">
          <p className="text-[0.75rem] text-v2-ink-3">Finance · dikirim minggu 7</p>
          <p className="mt-1 font-jakarta text-[1.35rem] leading-tight font-extrabold">Rekonsiliasi vendor dalam 20 menit</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-[10px] bg-v2-paper-2 px-3.5 py-3">
              <small className="block text-[0.76rem] font-semibold text-v2-ink-3">Sebelum</small>
              <b className="font-jakarta text-[1.35rem] tracking-[-0.03em]">3 jam / minggu</b>
            </div>
            <div className="rounded-[10px] bg-v2-green-soft px-3.5 py-3">
              <small className="block text-[0.76rem] font-semibold text-v2-ink-3">Sesudah</small>
              <b className="font-jakarta text-[1.35rem] tracking-[-0.03em]">20 menit</b>
            </div>
          </div>
          <Row className="mt-3">
            <span>Alat</span>
            <b>Microsoft Copilot</b>
          </Row>
          <Row>
            <span>Bukti</span>
            <b>2 file</b>
          </Row>
          <Row>
            <span>Diperiksa oleh</span>
            <b>Andi, champion Finance</b>
          </Row>
          <Row>
            <span>XP</span>
            <b>+120</b>
          </Row>
          <span className="mt-3.5 inline-flex items-center rounded-md bg-v2-lime px-2.75 py-1 text-[0.78rem] font-extrabold text-v2-forest">Terverifikasi</span>
        </div>
      </BrowserMock>
    ),
  },
  {
    tab: "Tampilan Direksi",
    hint: "ROI per divisi",
    title: "Satu halaman untuk rapat Direksi.",
    points: [
      ["Per divisi", ": terlatih, aktif mingguan, kesiapan, use case, jam"],
      ["Diperbarui", " setiap kuartal"],
      ["Ekspor PDF", " untuk rapat Direksi"],
    ],
    extra: (
      <p className="mt-5.5">
        <a href="#rapor" className={V2_TEXT_LINK}>
          Lihat contoh Rapor AI
        </a>
      </p>
    ),
    mock: (
      <BrowserMock url="ROI & produktivitas · Kuartal ini" label="Contoh tampilan Direksi">
        <div className="p-4.5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatCard label="Jam dihemat / bln" value="1.240" />
            <StatCard label="Karyawan terlatih" value="412" />
            <StatCard label="Aktif mingguan" value="56%" />
            <StatCard label="Ailene Score" value="37→59" />
          </div>
          {(
            [
              ["Sales", "58 → 79", "ok"],
              ["Finance", "41 → 72", "ok"],
              ["Operations", "29 → 44", "warn"],
              ["Legal", "22 → 40", "risk"],
            ] as const
          ).map(([division, change, status], index) => (
            <Row key={division} className={index === 0 ? "mt-3" : ""}>
              <b>{division}</b>
              <span className="tabular-nums">{change}</span>
              <RaporStatusLabelBIZ status={status} />
            </Row>
          ))}
        </div>
      </BrowserMock>
    ),
  },
];

export default function AcademyV2BIZ() {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    setSelected(index);
    tabRefs.current[index]?.focus();
  };

  return (
    <section id="academy" aria-labelledby="v2-academy" className={`${V2_SECTION} bg-v2-paper-2`}>
      <div className={V2_WRAP}>
        <div className="max-w-190">
          <h2 id="v2-academy" className={V2_H2}>
            LMS dengan identitas perusahaan Anda. Adopsi AI terukur sampai tingkat divisi.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Kami berani menjanjikan angka karena setiap hasil tercatat di sini. Setiap karyawan punya level, XP, dan band kompetensi. Direksi melihat adopsinya per divisi.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Fitur LMS perusahaan"
          className="mt-[clamp(36px,5vw,64px)] flex gap-1 overflow-x-auto border-b border-v2-rule [scrollbar-width:none]"
        >
          {panels.map((panel, index) => (
            <button
              key={panel.tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`v2-academy-tab-${index}`}
              aria-controls={`v2-academy-panel-${index}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => {
                const last = panels.length - 1;
                const next =
                  event.key === "ArrowRight" ? (index + 1) % panels.length
                  : event.key === "ArrowLeft" ? (index + last) % panels.length
                  : event.key === "Home" ? 0
                  : event.key === "End" ? last
                  : null;
                if (next === null) return;
                event.preventDefault();
                focusTab(next);
              }}
              className="-mb-px min-h-12 flex-none border-b-2 border-transparent px-4 py-3.5 text-left text-[0.95rem] font-bold text-v2-ink-2 hover:text-v2-ink aria-selected:border-v2-ink aria-selected:text-v2-ink"
            >
              {panel.tab}
              <small className="block text-[0.75rem] font-semibold text-v2-ink-3">{panel.hint}</small>
            </button>
          ))}
        </div>
        {panels.map((panel, index) => (
          <div
            key={panel.tab}
            role="tabpanel"
            id={`v2-academy-panel-${index}`}
            aria-labelledby={`v2-academy-tab-${index}`}
            tabIndex={0}
            hidden={selected !== index}
            className="grid items-center gap-[clamp(28px,4vw,56px)] pt-[clamp(28px,4vw,48px)] min-[900px]:grid-cols-[4fr_8fr]"
          >
            <div>
              <h3 className="font-jakarta text-[clamp(1.6rem,2.8vw,2.3rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance">{panel.title}</h3>
              <ul className="mt-5 text-v2-ink-2">
                {panel.points.map(([strong, rest]) => (
                  <li key={strong} className="border-t border-v2-rule py-2.5">
                    <b className="text-v2-ink">{strong}</b>
                    {rest}
                  </li>
                ))}
              </ul>
              {panel.extra}
            </div>
            {panel.mock}
          </div>
        ))}
        <p className="mt-[clamp(28px,4vw,48px)]">
          <a href="/lms" className={V2_TEXT_LINK}>
            Lihat LMS
          </a>
        </p>
      </div>
    </section>
  );
}
