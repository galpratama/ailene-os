import type { ReactNode } from "react";

const columns = [
  {
    no: "PROGRAM 01",
    name: "Foundation",
    desc: "Untuk membangun fondasi bersama",
    recommended: false,
  },
  {
    no: "PROGRAM 02",
    name: "Intensive",
    desc: "Untuk mempercepat produktivitas lintas fungsi",
    recommended: true,
  },
  {
    no: "PROGRAM 03",
    name: "Sprint",
    desc: "Untuk implementasi dan roadmap adopsi",
    recommended: false,
  },
];

function Yes() {
  return <span className="text-[22px] font-bold text-[#218b5b]">✓</span>;
}
function Muted() {
  return <span className="text-xl text-[#9aa0a2]">—</span>;
}
function Note({ children }: { children: ReactNode }) {
  return <span className="text-xs text-[#686b6b]">{children}</span>;
}

const rows: { label: string; cells: ReactNode[] }[] = [
  {
    label: "Paling cocok untuk",
    cells: [
      "Tim yang baru mulai memakai AI secara terstruktur",
      "Tim yang ingin menerapkan workflow sesuai fungsi kerja",
      "Organisasi yang siap menjalankan use case prioritas",
    ],
  },
  {
    label: "Durasi",
    cells: [
      <>
        1 hari
        <br />
        <Note>4–6 jam</Note>
      </>,
      <>
        2 hari
        <br />
        <Note>12–14 jam</Note>
      </>,
      "2–3 minggu",
    ],
  },
  {
    label: "Format",
    cells: ["Full offline", "Offline atau hybrid", "Hybrid + Demo Day"],
  },
  {
    label: "Peserta",
    cells: ["10–25 orang", "15–30 orang", "Mulai 15 orang"],
  },
  {
    label: "AI literacy & safe usage",
    cells: [<Yes key="a" />, <Yes key="b" />, <Yes key="c" />],
  },
  {
    label: "Prompting & daily workflows",
    cells: [<Yes key="a" />, <Yes key="b" />, <Yes key="c" />],
  },
  {
    label: "Role-based lab",
    cells: [
      "Pengantar",
      <>
        <Yes /> Termasuk
      </>,
      "Lintas departemen",
    ],
  },
  {
    label: "Implementation clinic",
    cells: [<Muted key="a" />, "1 use case prioritas", "Multi-workflow"],
  },
  {
    label: "Output utama",
    cells: [
      "Starter prompt library + use-case shortlist",
      "Workflow checklist + implementation action plan",
      "Workflow map + SOP + prototype + roadmap",
    ],
  },
  {
    label: "Demo Day",
    cells: [
      <Muted key="a" />,
      "Opsional",
      <>
        <Yes /> Termasuk
      </>,
    ],
  },
  {
    label: "Trainer model",
    cells: ["Lead trainer", "Lead + specialist", "Lead + strategy + specialists"],
  },
];

function TableCTA() {
  return (
    <a
      href="#contact"
      className="mt-3.5 flex min-h-11 items-center justify-center bg-ink px-2 text-[11px] font-bold tracking-[0.05em] text-white uppercase transition-[filter,transform] hover:brightness-125 active:scale-[0.98]"
    >
      Talk to a Consultant
    </a>
  );
}

export default function CompareProgramsHomeBIZ() {
  return (
    <section id="compare" className="bg-azure-t py-19 sm:py-26">
      <div className="mx-auto w-[min(1180px,calc(100%-48px))]">
        <div className="mb-9 grid grid-cols-1 items-end gap-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="font-script mb-2.5 text-[34px] leading-none text-coral">
              Compare programs
            </div>
            <h2 className="text-[42px] leading-[1.02] font-light tracking-[-0.025em] sm:text-[clamp(38px,5vw,68px)]">
              Pilih berdasarkan <strong className="font-bold">kebutuhan tim.</strong>
            </h2>
          </div>
          <p className="max-w-145 text-lg font-light">
            Setiap organisasi punya starting point yang berbeda. Bandingkan
            kedalaman, format, dan output program—lalu konsultasikan opsi yang
            paling relevan dengan objective tim kamu.
          </p>
        </div>

        <div
          role="region"
          aria-label="Perbandingan program corporate AI training"
          tabIndex={0}
          className="overflow-x-auto border-2 border-ink bg-white shadow-[8px_8px_0_0_var(--color-ink)] outline-none [scrollbar-width:thin] -mx-3.5 sm:mx-0"
        >
          <table className="w-full min-w-245 table-fixed border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[22%] bg-azure-t p-5.5 text-left align-bottom text-xs tracking-[0.08em] uppercase"
                >
                  Komponen
                </th>
                {columns.map((col) => (
                  <th
                    key={col.no}
                    scope="col"
                    className={`p-5.5 align-top text-center text-ink ${
                      col.recommended ? "bg-coral-t" : "bg-white"
                    }`}
                  >
                    {col.recommended && (
                      <span className="-mt-2.5 mb-1.75 inline-block bg-coral px-2 py-1 text-[10px] font-bold tracking-[0.07em] text-ink uppercase">
                        Recommended
                      </span>
                    )}
                    <span className="block text-[11px] font-bold tracking-[0.09em] text-[#646767]">
                      {col.no}
                    </span>
                    <strong className="my-1 block text-[22px] font-bold">
                      {col.name}
                    </strong>
                    <small className="block min-h-10.5 font-normal text-[#5f6262]">
                      {col.desc}
                    </small>
                    <TableCTA />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const rowBg = rowIndex % 2 === 1 ? "bg-[#f8fafb]" : "bg-white";
                return (
                  <tr key={row.label}>
                    <th
                      scope="row"
                      className={`sticky left-0 z-1 border-r border-b border-gray-200 p-4.5 text-left text-[13px] font-bold ${rowBg} ${
                        rowIndex === rows.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      {row.label}
                    </th>
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`border-b border-gray-200 p-4.5 text-center align-middle text-sm leading-relaxed ${rowBg} ${
                          cellIndex !== row.cells.length - 1
                            ? "border-r"
                            : ""
                        } border-gray-200 ${
                          rowIndex === rows.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-7.5 max-w-190 text-center text-lg">
          Belum yakin pilih yang mana? Ceritakan target, profil peserta, dan
          timeline kamu. Tim kami akan membantu merekomendasikan program yang
          paling pas.
        </p>
      </div>
    </section>
  );
}
