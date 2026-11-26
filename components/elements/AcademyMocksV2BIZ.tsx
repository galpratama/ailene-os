import { V2_SAMPLE } from "@/lib/biz-home-v2";
import { IconCheck, IconStarFilled } from "@tabler/icons-react";
import type { ReactNode } from "react";

// Sample LMS screens, shown on the home's LMS tabs and on /lms.
export function BrowserMock({ url, label, children }: { url: string; label: string; children: ReactNode }) {
  return (
    <div aria-label={label} className="overflow-hidden rounded-2xl bg-white text-[0.86rem] text-v2-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]">
      <div className="flex items-center gap-2.5 border-b border-v2-rule bg-v2-paper-2 px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <i className="size-2.25 rounded-full bg-v2-rule" />
          <i className="size-2.25 rounded-full bg-v2-rule" />
          <i className="size-2.25 rounded-full bg-v2-rule" />
        </div>
        <div className="mx-auto max-w-80 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-center text-[0.76rem] text-v2-ink-3">{url}</div>
        <span className={V2_SAMPLE}>Contoh</span>
      </div>
      {children}
    </div>
  );
}

export function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between gap-2.5 border-t border-v2-paper-2 py-2 ${className}`}>{children}</div>;
}

export function Meter({ value }: { value: number }) {
  return (
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-v2-paper-3">
      <i className="block h-full bg-v2-green" style={{ width: `${value}%` }} />
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-v2-rule px-1.5 py-2.5 text-center">
      <small className="block text-[0.76rem] font-semibold text-v2-ink-3">{label}</small>
      <b className="mt-0.5 block font-jakarta text-[1.15rem] tracking-[-0.03em] sm:text-[1.35rem]">{value}</b>
    </div>
  );
}

const sideItems = ["Hari ini", "Pre-assessment", "Jalur belajar", "Latihan skill", "Progres saya"];

export function AcademyProgressMockV2BIZ({ hero = false }: { hero?: boolean }) {
  return (
    <BrowserMock url="belajar.perusahaananda.co.id" label="Contoh tampilan progres karyawan di LMS perusahaan">
      <div className="grid min-h-80 sm:grid-cols-[150px_1fr]">
        <div className="bg-v2-forest px-2.5 py-3.5 text-[0.78rem] text-v2-on-forest/75 max-sm:hidden">
          <div className="mb-3.5 rounded-md border border-dashed border-v2-on-forest/50 px-1 py-2.25 text-center text-[0.76rem] font-bold">LOGO ANDA</div>
          {sideItems.map((item, index) => (
            <div key={item} className={`rounded-md px-2 py-1.75 ${index === 4 ? "bg-v2-on-forest/10 text-v2-on-forest" : ""}`}>
              {item}
            </div>
          ))}
        </div>
        <div className="p-4.5">
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <p className="font-jakarta text-base leading-tight font-extrabold">Progres belajar AI</p>
              <p className="text-[0.75rem] text-v2-ink-3">Sherly · Finance · Kohort 2 · Minggu 6 dari 10</p>
            </div>
            <span className={`inline-flex items-center gap-1.25 rounded-full border border-v2-rule px-2.75 py-1 text-[0.8rem] font-bold whitespace-nowrap ${hero ? "lms-hero-xp" : ""}`}>
              <IconStarFilled size={15} aria-hidden="true" className="text-v2-gold" />
              <b className="tabular-nums">1.240</b> XP
            </span>
          </div>
          <div className="mt-4 flex items-center rounded-[10px] border border-v2-rule p-3.5">
            {[
              { name: "Level 1", count: "8/8", state: "done" },
              { name: "Level 2", count: "5/8", state: "current" },
              { name: "Level 3", count: "0/8", state: "next" },
            ].map((level, index) => (
              <div key={level.name} className="contents">
                {index > 0 && <div className={`h-0.5 flex-1 ${index === 1 ? `bg-v2-green ${hero ? "lms-hero-progress-line" : ""}` : "bg-v2-rule"}`} />}
                <div className="flex-1 text-center text-[0.76rem] font-bold text-v2-ink-3">
                  <div
                    className={`mx-auto mb-1.5 grid size-6.5 place-items-center rounded-full border-2 text-[0.76rem] ${
                      level.state === "done"
                        ? "border-v2-green bg-v2-green text-white"
                        : level.state === "current"
                          ? `border-v2-lime bg-v2-lime text-v2-forest shadow-[0_0_0_4px_color-mix(in_srgb,var(--v2-lime)_35%,transparent)] ${hero ? "lms-hero-current-level" : ""}`
                          : "border-v2-rule bg-white"
                    }`}
                  >
                    {level.state === "done" ? <IconCheck size={14} stroke={3} aria-hidden="true" /> : index + 1}
                  </div>
                  {level.name}
                  <small
                    className={`mx-auto mt-1 block w-max rounded-full px-2 py-px text-[0.7rem] ${
                      level.state === "current" ? "bg-v2-forest text-v2-on-forest" : "bg-v2-paper-2 text-v2-ink-2"
                    }`}
                  >
                    {level.count}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid items-start gap-2.5 min-[620px]:grid-cols-[1.1fr_1fr]">
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Use case" value="3" />
              <StatCard label="Prompt" value="18" />
              <StatCard label="Jam hemat / bln" value="11" />
              <div className="col-span-3 flex flex-col rounded-[10px] bg-linear-to-r from-v2-lime-wash to-v2-paper-2 px-2.5 py-2">
                <small className="text-[0.66rem] font-bold text-v2-ink-3">Level sekarang</small>
                <b className="text-[0.9rem]">Level 2 · Practitioner</b>
              </div>
            </div>
            <div className="rounded-[10px] border border-v2-rule p-2.5">
              <div className="flex items-baseline justify-between text-[0.86rem]">
                <b>Leaderboard</b>
                <span className="text-[0.72rem] text-v2-ink-3">
                  <b className="text-[1.1rem] text-v2-ink tabular-nums">#2</b> dari 24
                </span>
              </div>
              <ol className="mt-2 grid gap-1">
                {[
                  ["AW", "Andi Wijaya", "1.480", false],
                  ["SH", "Sherly", "1.240", true],
                  ["RK", "Rina Kusuma", "1.105", false],
                ].map(([initials, name, xp, me]) => (
                  <li key={String(initials)} className={`flex items-center gap-2 rounded-lg px-1.5 py-1.25 text-[0.78rem] font-semibold ${me ? "bg-v2-lime-wash" : ""}`}>
                    <i
                      className={`grid size-5.5 place-items-center rounded-full text-[0.6rem] font-extrabold not-italic ${
                        me ? "bg-v2-forest text-v2-on-forest" : "bg-v2-paper-3"
                      }`}
                    >
                      {initials}
                    </i>
                    {name}
                    {me && <em className="rounded bg-v2-forest px-1.5 py-px text-[0.6rem] font-extrabold text-v2-on-forest not-italic">Anda</em>}
                    <b className="ml-auto text-[0.74rem] text-v2-ink-3 tabular-nums">{xp}</b>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </BrowserMock>
  );
}

export function AcademyAssessmentMockV2BIZ() {
  return (
    <BrowserMock url="Hasil pre-assessment · Akmal, Finance" label="Contoh hasil pre-assessment">
      <div className="p-4.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.75rem] text-v2-ink-3">Band saat ini</p>
            <p className="font-jakarta text-[1.4rem] leading-tight font-extrabold">
              Awareness <span className="text-[0.75rem] font-normal text-v2-ink-3">Band 1 dari 5</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-[0.45em] rounded-full bg-v2-amber-soft py-[0.22em] pr-[0.62em] pl-[0.5em] text-[0.78rem] font-bold text-v2-amber before:size-[0.5em] before:rounded-full before:bg-current">
            Target: Band 2 · 1 band lagi
          </span>
        </div>
        <div aria-hidden="true" className="mt-3 mb-1 grid grid-cols-5 gap-1.5">
          <i className="h-1.5 rounded-full bg-v2-green" />
          <i className="h-1.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--v2-gold)]" />
          <i className="h-1.5 rounded-full bg-v2-paper-3" />
          <i className="h-1.5 rounded-full bg-v2-paper-3" />
          <i className="h-1.5 rounded-full bg-v2-paper-3" />
        </div>
        <div className="mt-3.5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[0.75rem] font-bold text-v2-ink-3">Tiga dimensi, 0 sampai 100</p>
            {(
              [
                ["Pengetahuan", 58],
                ["Keterampilan", 46],
                ["Kebiasaan", 40],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <Row>
                  <span>{label}</span>
                  <b className="tabular-nums">{value}</b>
                </Row>
                <Meter value={value} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-[0.75rem] font-bold text-v2-ink-3">Enam pilar kompetensi, 0 sampai 5</p>
            {[
              ["AI Foundation", "1,5"],
              ["Tool Fluency", "2,4"],
              ["AI Habit", "3,0"],
              ["Prompting Quality", "1,1"],
              ["Use Case Diversity", "0,7"],
              ["Agentic Capabilities", "0,2"],
            ].map(([label, value]) => (
              <Row key={label}>
                <span>{label}</span>
                <b className="tabular-nums">{value}</b>
              </Row>
            ))}
          </div>
        </div>
      </div>
    </BrowserMock>
  );
}
