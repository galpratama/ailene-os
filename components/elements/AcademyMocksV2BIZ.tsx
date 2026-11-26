import { V2_SAMPLE } from "@/lib/biz-home-v2";
import {
  IconArrowRight,
  IconCheck,
  IconCircleCheckFilled,
  IconFileSpreadsheet,
  IconFileText,
  IconStarFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import type { ReactNode } from "react";
import LmsHeroClickDemoBIZ from "./LmsHeroClickDemoBIZ";

// Sample LMS screens, shown on the home's LMS tabs and on /lms.
export function BrowserMock({
  url,
  label,
  children,
}: {
  url: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-label={label}
      className="overflow-hidden rounded-2xl bg-white text-[0.86rem] text-v2-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]"
    >
      <div className="flex items-center gap-2.5 border-b border-v2-rule bg-v2-paper-2 px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <i className="size-2.25 rounded-full bg-v2-rule" />
          <i className="size-2.25 rounded-full bg-v2-rule" />
          <i className="size-2.25 rounded-full bg-v2-rule" />
        </div>
        <div className="mx-auto max-w-80 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-center text-[0.76rem] text-v2-ink-3">
          {url}
        </div>
        <span className={V2_SAMPLE}>Contoh</span>
      </div>
      {children}
    </div>
  );
}

export function Row({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2.5 border-t border-v2-paper-2 py-2 ${className}`}
    >
      {children}
    </div>
  );
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
      <small className="block text-[0.76rem] font-semibold text-v2-ink-3">
        {label}
      </small>
      <b className="mt-0.5 block font-jakarta text-[1.15rem] tracking-[-0.03em] sm:text-[1.35rem]">
        {value}
      </b>
    </div>
  );
}

const sideItems = [
  "Hari ini",
  "Pre-assessment",
  "Jalur belajar",
  "Latihan skill",
  "Progres saya",
];

function HeroValueSwap({
  before,
  after,
  afterClassName = "",
}: {
  before: string;
  after: string;
  afterClassName?: string;
}) {
  return (
    <span className="inline-grid overflow-hidden leading-[1.15]">
      <span className="lms-hero-val-before col-start-1 row-start-1">
        {before}
      </span>
      <span
        aria-hidden="true"
        className={`lms-hero-val-after col-start-1 row-start-1 ${afterClassName}`}
      >
        {after}
      </span>
    </span>
  );
}

export function AcademyProgressMockV2BIZ({ hero = false }: { hero?: boolean }) {
  return (
    <BrowserMock
      url="belajar.perusahaananda.co.id"
      label="Contoh tampilan progres karyawan di LMS perusahaan"
    >
      <div className="grid min-h-80 sm:grid-cols-[150px_1fr]">
        <div className="bg-v2-forest px-2.5 py-3.5 text-[0.78rem] text-v2-on-forest/75 max-sm:hidden">
          <div className="mb-3.5 rounded-md border border-dashed border-v2-on-forest/50 px-1 py-2.25 text-center text-[0.76rem] font-bold">
            LOGO ANDA
          </div>
          {sideItems.map((item, index) => (
            <div
              key={item}
              className={`rounded-md px-2 py-1.75 ${index === 4 ? "bg-v2-on-forest/10 text-v2-on-forest" : ""}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="p-4.5">
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <p className="font-jakarta text-base leading-tight font-extrabold">
                Progres belajar AI
              </p>
              <p className="text-[0.75rem] text-v2-ink-3">
                Sherly · Finance · Kohort 2 · Minggu 6 dari 10
              </p>
            </div>
            <span className="relative inline-flex shrink-0">
              <span
                className={`inline-flex items-center gap-1.25 rounded-full border border-v2-rule px-2.75 py-1 text-[0.8rem] font-bold whitespace-nowrap ${hero ? "lms-hero-xp" : ""}`}
              >
                <IconStarFilled
                  size={15}
                  aria-hidden="true"
                  className="text-v2-gold"
                />
                <b className="inline-flex items-center tabular-nums">
                  {hero ? (
                    <HeroValueSwap
                      before="1.240"
                      after="1.360"
                      afterClassName="text-v2-green"
                    />
                  ) : (
                    "1.240"
                  )}
                </b>{" "}
                XP
              </span>
              {hero && (
                <span
                  aria-hidden="true"
                  className="lms-hero-xp-gain pointer-events-none absolute top-full right-0.5 z-10 mt-0.5 rounded-full bg-v2-lime px-1.5 py-px text-[0.64rem] font-extrabold text-v2-forest tabular-nums shadow-[0_6px_14px_-6px_rgb(10_32_22/0.35)]"
                >
                  +120 XP
                </span>
              )}
            </span>
          </div>
          <div className="mt-4 flex items-center rounded-[10px] border border-v2-rule p-3.5">
            {[
              { name: "Level 1", count: "8/8", nextCount: null, state: "done" },
              {
                name: "Level 2",
                count: "5/8",
                nextCount: "6/8",
                state: "current",
              },
              { name: "Level 3", count: "0/8", nextCount: null, state: "next" },
            ].map((level, index) => (
              <div key={level.name} className="contents">
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${index === 1 ? `bg-v2-green ${hero ? "lms-hero-progress-line" : ""}` : "bg-v2-rule"}`}
                  />
                )}
                <div className="flex-1 text-center text-[0.76rem] font-bold text-v2-ink-3">
                  <div
                    className={`relative mx-auto mb-1.5 size-6.5 ${hero && level.state === "current" ? "z-20" : ""}`}
                  >
                    <div
                      className={`grid size-full place-items-center rounded-full border-2 text-[0.76rem] ${
                        level.state === "done"
                          ? "border-v2-green bg-v2-green text-white"
                          : level.state === "current"
                            ? `border-v2-lime bg-v2-lime text-v2-forest shadow-[0_0_0_4px_color-mix(in_srgb,var(--v2-lime)_35%,transparent)] ${hero ? "lms-hero-current-level" : ""}`
                            : "border-v2-rule bg-white"
                      }`}
                    >
                      {level.state === "done" ? (
                        <IconCheck size={14} stroke={3} aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {hero && level.state === "current" && (
                      <LmsHeroClickDemoBIZ />
                    )}
                  </div>
                  {level.name}
                  <small
                    className={`mx-auto mt-1 block w-max rounded-full px-2 py-px text-[0.7rem] tabular-nums ${
                      level.state === "current"
                        ? "bg-v2-forest text-v2-on-forest"
                        : "bg-v2-paper-2 text-v2-ink-2"
                    }`}
                  >
                    {hero && level.nextCount ? (
                      <HeroValueSwap
                        before={level.count}
                        after={level.nextCount}
                        afterClassName="text-v2-lime"
                      />
                    ) : (
                      level.count
                    )}
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
                <small className="text-[0.66rem] font-bold text-v2-ink-3">
                  Level sekarang
                </small>
                <b className="text-[0.9rem]">Level 2 · Practitioner</b>
              </div>
            </div>
            <div className="rounded-[10px] border border-v2-rule p-2.5">
              <div className="flex items-baseline justify-between text-[0.86rem]">
                <b>Leaderboard</b>
                <span className="text-[0.72rem] text-v2-ink-3">
                  <b className="text-[1.1rem] text-v2-ink tabular-nums">#2</b>{" "}
                  dari 24
                </span>
              </div>
              <ol className="mt-2 grid gap-1">
                {[
                  ["AW", "Andi Wijaya", "1.480", false],
                  ["SH", "Sherly", "1.240", true],
                  ["RK", "Rina Kusuma", "1.105", false],
                ].map(([initials, name, xp, me]) => (
                  <li
                    key={String(initials)}
                    className={`flex items-center gap-2 rounded-lg px-1.5 py-1.25 text-[0.78rem] font-semibold ${me ? "bg-v2-lime-wash" : ""}`}
                  >
                    <i
                      className={`grid size-5.5 place-items-center rounded-full text-[0.6rem] font-extrabold not-italic ${
                        me ? "bg-v2-forest text-v2-on-forest" : "bg-v2-paper-3"
                      }`}
                    >
                      {initials}
                    </i>
                    {name}
                    {me && (
                      <em className="rounded bg-v2-forest px-1.5 py-px text-[0.6rem] font-extrabold text-v2-on-forest not-italic">
                        Anda
                      </em>
                    )}
                    <b className="ml-auto inline-flex items-center text-[0.74rem] text-v2-ink-3 tabular-nums">
                      {hero && me ? (
                        <HeroValueSwap
                          before={String(xp)}
                          after="1.360"
                          afterClassName="text-v2-green"
                        />
                      ) : (
                        xp
                      )}
                    </b>
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

const RADAR_CX = 170;
const RADAR_CY = 132;
const RADAR_R = 66;
const RADAR_MAX = 5;

const assessmentPillars: {
  name: string;
  lines: string[];
  score: number;
  display: string;
  anchor: "start" | "middle" | "end";
  labelX: number;
  labelY: number;
  scoreY: number;
}[] = [
  {
    name: "AI Foundation",
    lines: ["AI Foundation"],
    score: 1.5,
    display: "1,5",
    anchor: "middle",
    labelX: 170,
    labelY: 36,
    scoreY: 51,
  },
  {
    name: "Tool Fluency",
    lines: ["Tool Fluency"],
    score: 2.4,
    display: "2,4",
    anchor: "start",
    labelX: 237,
    labelY: 94,
    scoreY: 109,
  },
  {
    name: "AI Habit",
    lines: ["AI Habit"],
    score: 3.0,
    display: "3,0",
    anchor: "start",
    labelX: 237,
    labelY: 162,
    scoreY: 177,
  },
  {
    name: "Prompting Quality",
    lines: ["Prompting Quality"],
    score: 1.1,
    display: "1,1",
    anchor: "middle",
    labelX: 170,
    labelY: 234,
    scoreY: 218,
  },
  {
    name: "Use Case Diversity",
    lines: ["Use Case", "Diversity"],
    score: 0.7,
    display: "0,7",
    anchor: "end",
    labelX: 103,
    labelY: 154,
    scoreY: 181,
  },
  {
    name: "Agentic Capabilities",
    lines: ["Agentic", "Capabilities"],
    score: 0.2,
    display: "0,2",
    anchor: "end",
    labelX: 103,
    labelY: 86,
    scoreY: 113,
  },
];

function radarPoint(index: number, value: number) {
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  const radius = (value / RADAR_MAX) * RADAR_R;
  return {
    x: Number((RADAR_CX + radius * Math.cos(angle)).toFixed(1)),
    y: Number((RADAR_CY + radius * Math.sin(angle)).toFixed(1)),
  };
}

function radarPolygon(values: number[]) {
  return values
    .map((value, index) => {
      const { x, y } = radarPoint(index, value);
      return `${x},${y}`;
    })
    .join(" ");
}

function AssessmentSpiderChartV2BIZ() {
  const scorePoints = assessmentPillars.map((pillar, index) =>
    radarPoint(index, pillar.score)
  );
  const dataPolygon = scorePoints.map(({ x, y }) => `${x},${y}`).join(" ");
  const targetPolygon = radarPolygon([2.5, 2.5, 2.5, 2.5, 2.5, 2.5]);

  return (
    <div className="rounded-xl border border-v2-rule bg-v2-paper-2/65 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.75rem] font-bold text-v2-ink-3">
          Enam pilar kompetensi, 0 sampai 5
        </p>
        <div
          className="flex items-center gap-3 text-[0.66rem] font-bold text-v2-ink-3"
          aria-hidden="true"
        >
          <span className="inline-flex items-center gap-1">
            <i className="size-2 rounded-full bg-v2-green" />
            Skor
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="w-2.5 border-t-[1.5px] border-dashed border-v2-gold" />
            Target Band 2
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 340 256"
        className="mx-auto mt-1 block h-auto w-full max-w-88"
        role="img"
        aria-label="Radar enam pilar kompetensi AI Akmal, skala 0 sampai 5"
      >
        {/* Concentric hexagonal grid rings (1..5) */}
        {[5, 4, 3, 2, 1].map((level) => (
          <polygon
            key={level}
            points={radarPolygon([level, level, level, level, level, level])}
            fill={level === 5 ? "var(--v2-paper)" : "none"}
            stroke="var(--v2-rule)"
            strokeWidth={level === 5 ? 1.2 : 0.9}
            strokeDasharray={level === 5 ? undefined : "2 2"}
          />
        ))}

        {/* Radial spokes from center to each pillar vertex */}
        {assessmentPillars.map((pillar, index) => {
          const outer = radarPoint(index, RADAR_MAX);
          return (
            <line
              key={pillar.name}
              x1={RADAR_CX}
              y1={RADAR_CY}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--v2-rule)"
              strokeWidth="0.9"
            />
          );
        })}

        {/* Subtle scale markers along the top axis */}
        {[1, 3, 5].map((tick) => {
          const pos = radarPoint(0, tick);
          return (
            <text
              key={tick}
              x={pos.x + 5}
              y={pos.y + 3}
              fontSize="8"
              fontWeight="700"
              fill="var(--v2-faded)"
            >
              {tick}
            </text>
          );
        })}

        {/* Target Band 2 reference ring */}
        <polygon
          points={targetPolygon}
          fill="none"
          stroke="var(--v2-gold)"
          strokeWidth="1.25"
          strokeDasharray="3.5 3"
          strokeOpacity="0.85"
        />

        {/* Player-style filled attribute polygon */}
        <polygon
          points={dataPolygon}
          fill="var(--v2-lime)"
          fillOpacity="0.34"
          stroke="var(--v2-green)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Vertex stat markers */}
        {scorePoints.map((point, index) => (
          <circle
            key={assessmentPillars[index].name}
            cx={point.x}
            cy={point.y}
            r="3.4"
            fill="var(--v2-forest)"
            stroke="var(--v2-lime)"
            strokeWidth="1.6"
          />
        ))}

        {/* FIFA-style attribute labels + bold scores around the hexagon */}
        {assessmentPillars.map((pillar) => (
          <g key={pillar.name}>
            <text
              x={pillar.labelX}
              y={pillar.labelY}
              textAnchor={pillar.anchor}
              fontSize="9.8"
              fontWeight="600"
              fill="var(--v2-ink-2)"
            >
              {pillar.lines.map((line, lineIndex) => (
                <tspan
                  key={line}
                  x={pillar.labelX}
                  dy={lineIndex === 0 ? 0 : 11.5}
                >
                  {line}
                </tspan>
              ))}
            </text>
            <text
              x={pillar.labelX}
              y={pillar.scoreY}
              textAnchor={pillar.anchor}
              fontSize="12"
              fontWeight="800"
              fill="var(--v2-forest)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {pillar.display}
            </text>
          </g>
        ))}
      </svg>

      <ul className="sr-only">
        {assessmentPillars.map((pillar) => (
          <li key={pillar.name}>
            {pillar.name}: {pillar.display} dari 5
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AcademyAssessmentMockV2BIZ() {
  return (
    <BrowserMock
      url="Hasil pre-assessment · Akmal, Finance"
      label="Contoh hasil pre-assessment"
    >
      <div className="p-4.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.75rem] text-v2-ink-3">Band saat ini</p>
            <p className="font-jakarta text-[1.4rem] leading-tight font-extrabold">
              Awareness{" "}
              <span className="text-[0.75rem] font-normal text-v2-ink-3">
                Band 1 dari 5
              </span>
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
        <div className="mt-3.5 grid items-center gap-4.5 sm:grid-cols-[5fr_7fr]">
          <div>
            <p className="text-[0.75rem] font-bold text-v2-ink-3">
              Tiga dimensi, 0 sampai 100
            </p>
            {(
              [
                ["Pengetahuan", 58],
                ["Keterampilan", 46],
                ["Kebiasaan", 40],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="mt-1">
                <Row>
                  <span>{label}</span>
                  <b className="tabular-nums">{value}</b>
                </Row>
                <Meter value={value} />
              </div>
            ))}
          </div>
          <AssessmentSpiderChartV2BIZ />
        </div>
      </div>
    </BrowserMock>
  );
}

export function AcademyUseCaseMockV2BIZ() {
  return (
    <BrowserMock url="Use case dikirim" label="Contoh use case terverifikasi">
      <div className="p-4.5">
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <p className="text-[0.75rem] text-v2-ink-3">
              Finance · dikirim minggu 7
            </p>
            <p className="mt-0.5 font-jakarta text-[1.28rem] leading-tight font-extrabold">
              Rekonsiliasi vendor dalam 20 menit
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-v2-lime px-2.5 py-1 text-[0.74rem] font-extrabold text-v2-forest">
            <IconCircleCheckFilled size={14} aria-hidden="true" />
            Terverifikasi
          </span>
        </div>

        {/* Before -> After visual duration comparison */}
        <div className="mt-3.5 rounded-xl border border-v2-rule bg-v2-paper-2/75 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[0.72rem] font-bold text-v2-ink-3">
              Perbandingan waktu kerja
            </span>
            <span className="rounded-full bg-v2-green-soft px-2 py-0.5 text-[0.7rem] font-extrabold text-v2-green tabular-nums">
              Hemat 89% · ~11 jam / bln
            </span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-lg border border-v2-rule bg-white px-3 py-2.25">
              <small className="block text-[0.72rem] font-semibold text-v2-ink-3">
                Sebelum
              </small>
              <b className="mt-0.5 block font-jakarta text-[1.15rem] leading-tight tracking-[-0.03em] tabular-nums">
                3 jam / minggu
              </b>
              <div
                aria-hidden="true"
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-v2-paper-3"
              >
                <i className="block h-full w-full rounded-full bg-v2-faded" />
              </div>
            </div>
            <span
              aria-hidden="true"
              className="mx-auto grid size-6.5 place-items-center rounded-full bg-v2-paper-3 text-v2-ink-2 max-sm:rotate-90"
            >
              <IconArrowRight size={14} stroke={2.4} />
            </span>
            <div className="rounded-lg border border-v2-green/25 bg-v2-green-soft px-3 py-2.25">
              <small className="block text-[0.72rem] font-semibold text-v2-green">
                Sesudah
              </small>
              <b className="mt-0.5 block font-jakarta text-[1.15rem] leading-tight tracking-[-0.03em] text-v2-forest tabular-nums">
                20 menit
              </b>
              <div
                aria-hidden="true"
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/85"
              >
                <i className="block h-full w-[12%] rounded-full bg-v2-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Compact 2-column detail grid replacing wide key-value rows */}
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-[10px] border border-v2-rule p-3">
            <small className="block text-[0.7rem] font-bold text-v2-ink-3">
              Alat &amp; bukti kerja
            </small>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-v2-paper-2 px-2.5 py-1.75">
              <Image
                src="/biz/v2/icons/copilot.png"
                width={20}
                height={20}
                alt=""
                className="size-5 shrink-0 object-contain"
              />
              <b className="text-[0.8rem] text-v2-ink">Microsoft Copilot</b>
            </div>
            <div className="mt-2.5">
              <span className="block text-[0.7rem] font-semibold text-v2-ink-3">
                2 file dilampirkan
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-v2-rule bg-white px-2 py-1 text-[0.7rem] font-semibold text-v2-ink-2">
                  <IconFileSpreadsheet
                    size={13}
                    aria-hidden="true"
                    className="text-v2-green"
                  />
                  rekap-vendor.xlsx
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-v2-rule bg-white px-2 py-1 text-[0.7rem] font-semibold text-v2-ink-2">
                  <IconFileText
                    size={13}
                    aria-hidden="true"
                    className="text-v2-ink-3"
                  />
                  prompt-audit.pdf
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[10px] border border-v2-rule p-3">
            <div>
              <small className="block text-[0.7rem] font-bold text-v2-ink-3">
                Diperiksa oleh
              </small>
              <div className="mt-2 flex items-center gap-2.5">
                <i className="grid size-8 shrink-0 place-items-center rounded-full bg-v2-forest text-[0.68rem] font-extrabold text-v2-on-forest not-italic">
                  AN
                </i>
                <div className="min-w-0">
                  <b className="block truncate text-[0.84rem] leading-tight text-v2-ink">
                    Andi
                  </b>
                  <span className="block truncate text-[0.72rem] text-v2-ink-3">
                    Champion Finance
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-v2-paper-2 pt-2.5">
              <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-v2-green">
                <IconCheck size={13} stroke={2.8} aria-hidden="true" />
                Masuk hitungan jam
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-v2-lime-wash px-2 py-0.5 text-[0.74rem] font-extrabold text-v2-forest tabular-nums">
                <IconStarFilled
                  size={12}
                  aria-hidden="true"
                  className="text-v2-gold"
                />
                +120 XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </BrowserMock>
  );
}
