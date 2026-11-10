import type { SpecialistDivision } from "@/lib/biz-specialists";
import { ArrowUpRight, FlaskConical, Gauge } from "lucide-react";
import Link from "next/link";

export default function SpecialistDivisionCardBIZ({
  division,
  index,
}: {
  division: SpecialistDivision;
  index: number;
}) {
  const Icon = division.icon;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      id={division.id}
      aria-labelledby={`${division.id}-title`}
      className="grid scroll-mt-36 overflow-hidden rounded-2xl border border-biz-line bg-white lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
    >
      <div className="flex flex-col border-b border-biz-line bg-biz-panel p-5 sm:p-7 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-biz-forest text-biz-lime">
            <Icon size={22} aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-biz-forest-light tabular-nums">{number} / 09</span>
        </div>
        <h3 id={`${division.id}-title`} className="mt-6 text-[26px] leading-[1.02] font-medium tracking-[-0.055em] text-biz-forest sm:text-[30px]">
          {division.name}
        </h3>
        <p className="mt-2 text-[13px] text-biz-muted">{division.audience}</p>
        <p className="mt-6 border-l-2 border-biz-lime pl-3.5 text-[15px] leading-[1.6] text-biz-copy">{division.challenge}</p>
        <div className="mt-auto pt-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-biz-muted uppercase">Lingkungan latihan</p>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Tools latihan ${division.short}`}>
            {division.tools.map((tool) => (
              <li key={tool} className="rounded-full bg-biz-sage px-2.5 py-1 text-xs font-medium text-biz-forest">{tool}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col p-5 sm:p-7">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-biz-muted uppercase">Yang dipraktikkan di kelas</p>
        <ol className="mt-3 divide-y divide-biz-line">
          {division.useCases.map((useCase, caseIndex) => (
            <li key={useCase} className="flex items-start gap-3.5 py-3.5 first:pt-1">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-biz-lime text-[11px] font-semibold text-biz-forest tabular-nums">
                {caseIndex + 1}
              </span>
              <span className="text-[15px] leading-normal text-biz-ink">{useCase}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto grid gap-2.5 pt-5 sm:grid-cols-2">
          <div className="rounded-xl bg-biz-lime/25 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-biz-forest-light uppercase">
              <FlaskConical size={14} aria-hidden="true" /> Hasil lab
            </p>
            <p className="mt-1.5 text-sm leading-snug font-medium text-biz-forest">{division.labOutput}</p>
          </div>
          <div className="rounded-xl bg-biz-panel-soft p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-biz-forest-light uppercase">
              <Gauge size={14} aria-hidden="true" /> Yang diukur
            </p>
            <p className="mt-1.5 text-sm leading-snug font-medium text-biz-forest">{division.measure}</p>
          </div>
        </div>
        {division.caseStudyHref && (
          <Link
            href={division.caseStudyHref}
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-medium text-biz-forest underline decoration-biz-lime decoration-2 underline-offset-4 hover:decoration-biz-forest"
          >
            Lihat studi kasus Hutama Karya <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}
