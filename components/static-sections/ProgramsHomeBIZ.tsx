"use client";

import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";
import { Check, Minus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

const programs = [
  {
    id: "foundation",
    name: "Work Foundation",
    duration: "1 hari",
    format: "Full offline",
    participants: "Mulai 15 orang",
    fit: "Tim yang baru mulai memakai AI",
    output: "Prompt library starter · Workflow examples · Use-case shortlist",
    recommended: false,
  },
  {
    id: "intensive",
    name: "Productivity Intensive",
    duration: "2 hari",
    format: "Offline atau hybrid",
    participants: "Mulai 15 orang",
    fit: "Tim yang ingin menerapkan workflow sesuai fungsi",
    output: "Use-case map · Prompt library per role · Implementation action plan",
    recommended: false,
  },
  {
    id: "sprint",
    name: "Transformation Sprint",
    duration: "13 week",
    format: "Hybrid + Demo Day",
    participants: "Mulai 15 orang",
    fit: "Organisasi yang siap menjalankan use case prioritas",
    output: "Workflow map · SOP · Champion plan · 30-day roadmap · Demo Day",
    recommended: true,
  },
  {
    id: "custom",
    name: "Custom Track",
    duration: "Disesuaikan",
    format: "Custom",
    participants: "Mulai 15 orang",
    fit: "Kebutuhan lintas fungsi atau track developer",
    output: "Custom roadmap · Role-based curriculum · Adoption plan",
    recommended: false,
  },
] as const;

type Program = (typeof programs)[number];
type CellValue = string | "included" | "off" | "scope" | "optional";

const checklistRows: Array<{ section?: string; label?: string; value?: (program: Program) => CellValue }> = [
  { section: "Program essentials" },
  { label: "Durasi & format", value: (program) => `${program.duration} · ${program.format}` },
  { label: "Peserta", value: (program) => program.participants },
  { label: "Cocok untuk", value: (program) => program.fit },
  { section: "Capability utama" },
  { label: "AI Foundation", value: (program) => program.id === "custom" ? "scope" : "included" },
  { label: "Praktik sesuai peran / divisi", value: (program) => program.id === "foundation" ? "off" : "included" },
  { label: "LMS & tracking", value: (program) => program.id === "sprint" ? "included" : program.id === "custom" ? "scope" : "off" },
  { label: "Demo Day", value: (program) => program.id === "sprint" ? "included" : program.id === "foundation" ? "off" : "optional" },
  { section: "Hasil & pendampingan" },
  { label: "Output utama", value: (program) => program.output },
];

const textRows: Array<{ section?: string; label?: string; value?: (program: Program) => string }> = [
  { section: "Cara memilih" },
  { label: "Cocok untuk", value: (program) => program.fit },
  { label: "Durasi & format", value: (program) => `${program.duration} · ${program.format}` },
  { label: "Fokus praktik", value: (program) => ({ foundation: "Email, recap, report, research", intensive: "Workflow sesuai peran", sprint: "Workflow lintas departemen", custom: "Workflow sesuai scope" })[program.id] },
  { label: "Implementasi", value: (program) => ({ foundation: "Belum termasuk clinic", intensive: "1 use case", sprint: "Multi-departemen", custom: "Sesuai scope" })[program.id] },
  { label: "Follow-through", value: (program) => ({ foundation: "—", intensive: "Clinic 2 minggu", sprint: "Workshop mingguan", custom: "Sesuai scope" })[program.id] },
  { label: "Visibility", value: (program) => ({ foundation: "—", intensive: "—", sprint: "LMS & tracking", custom: "LMS sesuai scope" })[program.id] },
  { section: "Hasil yang dibawa pulang" },
  { label: "Output utama", value: (program) => program.output },
  { label: "Trainer", value: (program) => ({ foundation: "Lead trainer", intensive: "Lead + specialist", sprint: "Lead + strategy + specialists", custom: "Lead + specialist sesuai kebutuhan" })[program.id] },
];

function Capability({ value }: { value: CellValue }) {
  if (value === "included") return <span aria-label="Termasuk" className="inline-grid size-6 place-items-center rounded-full bg-biz-forest-light text-white"><Check size={14} strokeWidth={2.5} /></span>;
  if (value === "off") return <span aria-label="Tidak termasuk" className="inline-grid size-6 place-items-center rounded-full bg-biz-forest/7 text-biz-muted"><X size={13} /></span>;
  if (value === "scope" || value === "optional") return <span className="inline-flex items-center gap-2 text-biz-forest-light"><span className="inline-grid size-6 place-items-center rounded-full bg-biz-lime/35"><Minus size={13} /></span>{value === "scope" ? "Sesuai scope" : "Opsional"}</span>;
  return value;
}

function ProgramTable({ mode }: { mode: "checklist" | "text" }) {
  const rows = mode === "checklist" ? checklistRows : textRows;

  return (
    <div className="overflow-x-auto rounded-xl border border-biz-forest/12 bg-white">
      <table className="w-full min-w-280 table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-45 bg-biz-table-head px-4 py-4 text-left font-mono text-[9px] tracking-[0.1em] text-biz-muted uppercase">Program</th>
            {programs.map((program) => (
              <th key={program.id} className={`px-4 py-4 text-left align-top ${program.recommended ? "bg-biz-lime/35" : "bg-biz-table-head"}`}>
                <span className="block text-[16px] leading-tight font-medium tracking-[-0.035em] text-biz-ink">{program.name}</span>
                <small className="mt-1.5 block font-mono text-[8px] leading-relaxed tracking-[0.07em] text-biz-forest-light uppercase">{program.recommended ? "Recommended · " : ""}{program.duration}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (row.section) {
              return (
                <tr key={row.section}>
                  <th colSpan={5} className="border-y border-biz-forest/10 px-4 pt-5.5 pb-2 text-left font-mono text-[9px] font-semibold tracking-[0.12em] text-biz-muted/75 uppercase">{row.section}</th>
                </tr>
              );
            }
            return (
              <tr key={`${row.label}-${index}`}>
                <th scope="row" className="border-b border-biz-forest/10 px-4 py-4 text-left align-top text-[13px] font-semibold tracking-[-0.02em] text-biz-ink">{row.label}</th>
                {programs.map((program) => {
                  const value = row.value?.(program) ?? "";
                  return (
                    <td key={program.id} className={`border-b border-biz-forest/10 px-4 py-4 align-top text-xs leading-[1.5] ${program.recommended ? "bg-biz-lime/12 font-medium text-biz-forest" : "text-biz-muted"}`}>
                      {mode === "checklist" ? <Capability value={value} /> : value as ReactNode}
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
  const [mode, setMode] = useState<"checklist" | "text">("checklist");

  return (
    <section id="programs" className="bg-biz-paper py-18 sm:py-28">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <SectionHeaderHomeBIZ
          eyebrow="Pilih jalurnya"
          title="Pilih program sesuai kebutuhan tim."
          copy="Bandingkan format, benefit, pendampingan, dan hasil setiap jalur—termasuk opsi custom untuk kebutuhan yang lebih spesifik."
          className="mb-5"
        />
        <div role="tablist" aria-label="Pilihan format perbandingan program" className="mb-4 flex w-fit gap-1 rounded-lg border border-biz-forest/12 bg-white p-1">
          {([ ["checklist", "A · Checklist"], ["text", "B · Text"] ] as const).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`cursor-pointer rounded-md px-3 py-2 text-[10px] font-semibold tracking-[0.07em] uppercase ${mode === value ? "bg-biz-forest text-white" : "text-biz-muted hover:bg-biz-forest/5"}`}>{label}</button>
          ))}
        </div>
        <ProgramTable mode={mode} />

        <aside className="mt-5 flex flex-col gap-5 rounded-xl bg-biz-forest p-5.5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-[12px] font-medium tracking-[0.08em] text-biz-lime uppercase">Butuh bantuan memilih?</p>
            <h3 className="mt-1.5 max-w-162.5 text-[clamp(1.45rem,2.5vw,2.05rem)] leading-[1.02] font-medium tracking-[-0.055em]">Ceritakan tim dan targetnya. Kami bantu pilih format yang tepat.</h3>
            <p className="mt-2 max-w-150 text-[13px] leading-[1.55] text-white/68">Mulai dari jumlah peserta, target kerja, dan bentuk pendampingan yang Anda butuhkan.</p>
          </div>
          <LinkButtonBIZ href="https://wa.me/6285110545698" variant="lime" className="shrink-0">Bahas program untuk tim Anda</LinkButtonBIZ>
        </aside>
      </div>
    </section>
  );
}
