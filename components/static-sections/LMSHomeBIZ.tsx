"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

type RoleId = "leadership" | "manager" | "employee";

const roles: Array<{
  id: RoleId;
  label: string;
  navCopy: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  metrics: Array<[string, string]>;
}> = [
  {
    id: "leadership",
    label: "Leadership",
    navCopy: "Lihat dampak & ambil keputusan",
    eyebrow: "Use case untuk leadership",
    title: "Visibilitas yang jelas untuk keputusan yang lebih cepat.",
    body: "Semua insight penting dalam satu tempat, dari progres tim hingga dampak bisnis.",
    points: [
      "Lihat progres adopsi AI lintas tim dan departemen",
      "Identifikasi use case prioritas dan dampaknya",
      "Dapatkan laporan siap untuk stakeholder",
      "Pantau ROI dan arah investasi",
    ],
    metrics: [["68%", "Total adoption"], ["12 / 18", "Active teams"], ["28", "Use cases"]],
  },
  {
    id: "manager",
    label: "Manager",
    navCopy: "Gerakkan tim dengan mudah",
    eyebrow: "Use case untuk manager",
    title: "Gerakkan tim dengan konteks yang lebih jelas.",
    body: "Manager dapat melihat workflow yang bergerak, hambatan yang muncul, dan dukungan yang perlu diberikan.",
    points: [
      "Lihat workflow yang membutuhkan coaching",
      "Prioritaskan dukungan untuk anggota tim",
      "Pantau progres per fungsi dan peran",
      "Jaga ritme follow-up setelah training",
    ],
    metrics: [["8", "Workflow aktif"], ["3", "Butuh coaching"], ["74%", "Rata-rata tim"]],
  },
  {
    id: "employee",
    label: "Employee",
    navCopy: "Belajar, praktik, berkembang",
    eyebrow: "Use case untuk karyawan",
    title: "Tahu apa yang harus dicoba berikutnya.",
    body: "Karyawan mendapat latihan yang relevan, aset yang bisa dipakai, dan langkah berikutnya yang jelas dalam rutinitas kerja.",
    points: [
      "Lihat modul dan latihan sesuai peran",
      "Praktik pada workflow kerja sendiri",
      "Simpan prompt dan aset kerja yang siap dipakai",
      "Ikuti progres sampai menjadi kebiasaan",
    ],
    metrics: [["3 / 5", "Gate level selesai"], ["12", "Minggu streak"], ["4,2j", "Estimasi dihemat"]],
  },
];

const chartBars: Record<Exclude<RoleId, "employee">, Array<[string, number]>> = {
  leadership: [["Product", 78], ["Marketing", 72], ["Operations", 68], ["HR", 61], ["Finance", 54]],
  manager: [["Email", 82], ["Report", 68], ["Riset", 61], ["Meeting", 47], ["Review", 39]],
};

function DashboardShell({ role }: { role: (typeof roles)[number] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-biz-line bg-white">
      <div className="flex items-center gap-2 border-b border-biz-line bg-biz-panel-soft px-4 py-3">
        <span className="size-2 rounded-full bg-biz-dot" />
        <span className="size-2 rounded-full bg-biz-dot" />
        <span className="size-2 rounded-full bg-biz-dot" />
        <span className="ml-1 font-mono text-[10px] text-biz-muted">Ailene LMS · {role.label}</span>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <strong className="text-base font-medium tracking-[-0.035em] text-biz-forest">{role.id === "employee" ? "Progress saya" : "Overview"}</strong>
          <span className="font-mono text-[8px] tracking-[0.08em] text-biz-muted uppercase">Contoh snapshot · minggu ke-4</span>
        </div>
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          {role.metrics.map(([value, label]) => (
            <div key={label} className="rounded-xl border border-biz-line bg-biz-panel p-3">
              <strong className="block text-2xl leading-none font-medium tracking-[-0.05em] text-biz-forest">{value}</strong>
              <span className="mt-1.5 block font-mono text-[8px] leading-snug tracking-[0.05em] text-biz-muted uppercase">{label}</span>
            </div>
          ))}
        </div>
        {role.id === "employee" ? <EmployeeRadar /> : <DepartmentBars role={role.id} />}
        <p className="mt-3 font-mono text-[9px] leading-relaxed text-biz-muted/80">Data ilustratif untuk menunjukkan bentuk outcome dan bukan benchmark statistik.</p>
      </div>
    </div>
  );
}

function DepartmentBars({ role }: { role: Exclude<RoleId, "employee"> }) {
  const bars = chartBars[role];
  return (
    <div className="mt-3.5 rounded-xl border border-biz-line p-4">
      <div className="flex justify-between gap-3">
        <strong className="text-[15px] font-medium tracking-[-0.035em] text-biz-forest">{role === "leadership" ? "Adopsi per departemen" : "Status workflow tim"}</strong>
        <span className="font-mono text-[8px] text-biz-muted uppercase">Illustrative data</span>
      </div>
      <div className="mt-5 flex h-43 items-end justify-between gap-2" role="img" aria-label="Grafik progres ilustratif">
        {bars.map(([label, value]) => (
          <div key={label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <strong className="text-[9px] text-biz-forest-light">{value}%</strong>
            <i className="w-full max-w-9 rounded-t-md bg-biz-forest-light/70" style={{ height: `${value}%` }} />
            <span className="max-w-full truncate text-[8px] text-biz-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeRadar() {
  const legend = [
    ["AI Foundation", "3,5 / 5"], ["Prompting Quality", "3,0 / 5"],
    ["Tool Fluency", "2,0 / 5 ↓"], ["Use Case Diversity", "2,5 / 5"],
    ["AI Habit", "3,5 / 5 ↑"], ["Agentic Capabilities", "0,5 / 5"],
  ];
  return (
    <div className="mt-3.5 rounded-xl border border-biz-line p-4">
      <div className="flex justify-between gap-3"><strong className="text-[15px] font-medium text-biz-forest">Peta kompetensi AI</strong><span className="font-mono text-[8px] text-biz-muted uppercase">6 dimensi · skala 0–5</span></div>
      <div className="mt-3 grid items-center gap-3 sm:grid-cols-[1.05fr_0.95fr]">
        <svg viewBox="0 0 260 238" className="h-auto w-full" role="img" aria-label="Spider chart kompetensi AI karyawan">
          {["130,22 207,67 207,157 130,202 53,157 53,67", "130,58 176,85 176,139 130,166 84,139 84,85", "130,94 145,103 145,121 130,130 115,121 115,103"].map((points) => <polygon key={points} points={points} fill="none" className="stroke-biz-forest/12" />)}
          <path d="M130 22V202M53 67L207 157M207 67L53 157" className="stroke-biz-forest/12" />
          <polygon points="130,49 176,85 161,130 130,157 76,143 122,108" className="fill-biz-lime/35 stroke-biz-forest-light" strokeWidth="2" />
          {[ [130,49], [176,85], [161,130], [130,157], [76,143], [122,108] ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" className="fill-biz-forest-light" />)}
        </svg>
        <div className="grid gap-1.5">
          {legend.map(([label, value]) => (
            <div key={label} className={`flex justify-between gap-3 rounded-md px-2 py-1.5 text-[9px] ${label === "Tool Fluency" ? "bg-biz-lime/25" : "bg-biz-paper"}`}>
              <span className="text-biz-muted">{label}</span><strong className="font-semibold text-biz-forest">{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LMSHomeBIZ() {
  const [activeRole, setActiveRole] = useState<RoleId>("employee");
  const role = roles.find((item) => item.id === activeRole) ?? roles[2];

  return (
    <section id="lms" className="pt-9 pb-18 sm:pb-28">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <SectionHeaderHomeBIZ
          dark
          eyebrow="AI-native LMS"
          title="Satu platform."
          copy="Satu platform terpusat untuk memantau progres penggunaan AI, melihat area yang perlu diperkuat, dan mengarahkan langkah berikutnya."
        />
        <div className="grid items-stretch gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
          <div role="tablist" aria-label="Tampilan LMS berdasarkan peran" className="grid content-start gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
            {roles.map((item) => {
              const active = item.id === activeRole;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveRole(item.id)}
                  className={`group relative grid min-h-19 cursor-pointer gap-1 rounded-xl border px-4 py-3.5 pr-9 text-left transition-all after:absolute after:top-1/2 after:right-4 after:size-2 after:-translate-y-1/2 after:rotate-45 after:border-t after:border-r after:border-current after:content-[''] ${active ? "border-biz-lime bg-biz-lime text-biz-forest shadow-lg" : "border-white/15 bg-white/5 text-white/82 hover:-translate-y-px hover:border-white/30 hover:bg-white/10"}`}
                >
                  <strong className="text-base font-medium tracking-[-0.035em]">{item.label}</strong>
                  <span className={`text-[11px] leading-snug ${active ? "text-biz-forest/68" : "text-white/58"}`}>{item.navCopy}</span>
                </button>
              );
            })}
          </div>
          <div role="tabpanel" className="min-w-0 rounded-2xl border border-white/15 bg-white p-4 text-biz-ink shadow-2xl sm:p-7">
            <div className="grid items-start gap-7 xl:grid-cols-[minmax(250px,0.78fr)_minmax(0,1.22fr)]">
              <div className="py-2">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-biz-forest-light uppercase">{role.eyebrow}</span>
                <h3 className="mt-3.5 max-w-125 text-[clamp(2rem,3.3vw,3.55rem)] leading-[0.98] font-medium tracking-[-0.06em] text-biz-forest">{role.title}</h3>
                <p className="mt-4.5 max-w-130 text-sm leading-[1.65] text-biz-muted">{role.body}</p>
                <ul className="mt-6 grid gap-3">
                  {role.points.map((point) => (
                    <li key={point} className="grid grid-cols-[19px_1fr] gap-2.5 text-[13px] leading-[1.5] text-biz-copy"><span className="grid size-4.75 place-items-center rounded-full bg-biz-check text-biz-forest"><Check size={12} strokeWidth={2.5} /></span>{point}</li>
                  ))}
                </ul>
              </div>
              <DashboardShell role={role} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
