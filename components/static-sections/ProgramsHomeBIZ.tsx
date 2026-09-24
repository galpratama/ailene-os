import { ArrowRight, Check, Minus, X } from "lucide-react";
import { programs, type Program } from "@/lib/biz-content";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";
import PageMargin from "@/components/layouts/PageMargin";

type CellValue = string | "included" | "off" | "scope" | "optional";

const checklistRows: Array<{
  section?: string;
  label?: string;
  value?: (program: Program) => CellValue;
}> = [
  { section: "Program essentials" },
  {
    label: "Durasi & format",
    value: (program) => `${program.duration} · ${program.format}`,
  },
  { label: "Peserta", value: (program) => program.participants },
  { label: "Cocok untuk", value: (program) => program.fit },
  { section: "Capability utama" },
  {
    label: "AI Foundation",
    value: (program) => (program.id === "custom" ? "scope" : "included"),
  },
  {
    label: "Praktik sesuai peran / divisi",
    value: (program) => (program.id === "foundation" ? "off" : "included"),
  },
  {
    label: "LMS & tracking",
    value: (program) =>
      program.id === "sprint"
        ? "included"
        : program.id === "custom"
          ? "scope"
          : "off",
  },
  {
    label: "Demo Day",
    value: (program) =>
      program.id === "sprint"
        ? "included"
        : program.id === "foundation"
          ? "off"
          : "optional",
  },
  { section: "Hasil & pendampingan" },
  { label: "Output utama", value: (program) => program.output },
];

function Capability({ value }: { value: CellValue }) {
  if (value === "included")
    return (
      <span
        aria-label="Termasuk"
        className="inline-grid size-6 place-items-center rounded-full bg-biz-forest-light text-white"
      >
        <Check size={14} strokeWidth={2.5} />
      </span>
    );
  if (value === "off")
    return (
      <span
        aria-label="Tidak termasuk"
        className="inline-grid size-6 place-items-center rounded-full bg-biz-forest/7 text-biz-muted"
      >
        <X size={13} />
      </span>
    );
  if (value === "scope" || value === "optional")
    return (
      <span className="inline-flex items-center gap-2 text-biz-forest-light">
        <span className="inline-grid size-6 place-items-center rounded-full bg-biz-lime/35">
          <Minus size={13} />
        </span>
        {value === "scope" ? "Sesuai scope" : "Opsional"}
      </span>
    );
  return value;
}

function ProgramTable() {
  const rows = checklistRows;

  return (
    <div className="overflow-x-auto rounded-xl border border-biz-forest/12 bg-white">
      <table className="w-full min-w-280 table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-45 bg-biz-table-head px-4 py-4 text-left font-mono text-[9px] tracking-[0.1em] text-biz-muted uppercase">
              Program
            </th>
            {programs.map((program) => (
              <th
                key={program.id}
                className={`px-4 py-4 text-left align-top ${program.recommended ? "bg-biz-lime/35" : "bg-biz-table-head"}`}
              >
                <span className="block text-[16px] leading-tight font-medium tracking-[-0.035em] text-biz-ink">
                  {program.name}
                </span>
                <small className="mt-1.5 block font-mono text-[8px] leading-relaxed tracking-[0.07em] text-biz-forest-light uppercase">
                  {program.recommended ? "Recommended · " : ""}
                  {program.duration}
                </small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (row.section) {
              return (
                <tr key={row.section}>
                  <th
                    colSpan={5}
                    className="border-y border-biz-forest/10 px-4 pt-5.5 pb-2 text-left font-mono text-[9px] font-semibold tracking-[0.12em] text-biz-muted/75 uppercase"
                  >
                    {row.section}
                  </th>
                </tr>
              );
            }
            return (
              <tr key={`${row.label}-${index}`}>
                <th
                  scope="row"
                  className="border-b border-biz-forest/10 px-4 py-4 text-left align-top text-[13px] font-semibold tracking-[-0.02em] text-biz-ink"
                >
                  {row.label}
                </th>
                {programs.map((program) => {
                  const value = row.value?.(program) ?? "";
                  return (
                    <td
                      key={program.id}
                      className={`border-b border-biz-forest/10 px-4 py-4 align-top text-xs leading-[1.5] ${program.recommended ? "bg-biz-lime/12 font-medium text-biz-forest" : "text-biz-muted"}`}
                    >
                      <Capability value={value} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ProgramsHomeBIZ() {
  return (
    <section id="programs" className="bg-biz-paper py-18 sm:py-28">
      <PageMargin>
        <SectionHeaderHomeBIZ
          eyebrow="Pilih jalurnya"
          title="Pilih program sesuai kebutuhan tim."
          copy="Bandingkan format, benefit, pendampingan, dan hasil setiap jalur—termasuk opsi custom untuk kebutuhan yang lebih spesifik."
          className="mb-5"
        />
        <p className="mb-2.5 flex items-center gap-1.5 text-[12px] font-medium text-biz-muted lg:hidden">
          Geser tabel untuk melihat semua program
          <ArrowRight size={13} />
        </p>
        <ProgramTable />

      </PageMargin>
    </section>
  );
}
