import { hutamaKaryaCase } from "@/lib/biz-case-studies";

const formatScore = (value: number, digits = 1) =>
  value.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Diverging encoding: gain, no change (neutral gray midpoint), drop. Counts are printed on and under the bar.
const toneClass = {
  up: "bg-biz-forest-light",
  flat: "bg-biz-dot",
  down: "bg-biz-coral",
} as const;

function ScoreShift() {
  const { pre, post, paired } = hutamaKaryaCase.scoreShift;
  const min = 60;
  const max = 100;
  const toPercent = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <figure className="rounded-2xl border border-biz-line bg-white p-5 sm:p-6">
      <figcaption>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-biz-muted uppercase">Sesi 1 · skor tes rata-rata</p>
        <p className="mt-1 text-sm text-biz-copy">Peserta yang sama, sebelum dan sesudah sesi (n = {paired}).</p>
      </figcaption>
      <div className="relative mt-11 mb-2 h-10" role="img" aria-label={`Rata-rata skor naik dari ${formatScore(pre, 2)} sebelum sesi menjadi ${formatScore(post, 2)} sesudah sesi.`}>
        <div className="absolute inset-x-0 top-1/2 h-px bg-biz-line" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-biz-forest-light"
          style={{ left: `${toPercent(pre)}%`, width: `${toPercent(post) - toPercent(pre)}%` }}
        />
        <span
          title={`Pre-test: ${formatScore(pre, 2)}`}
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-biz-forest-light bg-white"
          style={{ left: `${toPercent(pre)}%` }}
        />
        <span
          title={`Post-test: ${formatScore(post, 2)}`}
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-biz-forest-light ring-2 ring-white"
          style={{ left: `${toPercent(post)}%` }}
        />
        <span className="absolute -top-7 -translate-x-1/2 text-center text-xs text-biz-muted tabular-nums" style={{ left: `${toPercent(pre)}%` }}>
          Pre <strong className="font-semibold text-biz-ink">{formatScore(pre)}</strong>
        </span>
        <span className="absolute -top-7 -translate-x-1/2 text-center text-xs text-biz-muted tabular-nums" style={{ left: `${toPercent(post)}%` }}>
          Post <strong className="font-semibold text-biz-ink">{formatScore(post)}</strong>
        </span>
      </div>
      <div className="flex justify-between text-[11px] text-biz-muted tabular-nums" aria-hidden="true">
        {[60, 70, 80, 90, 100].map((tick) => <span key={tick}>{tick}</span>)}
      </div>
    </figure>
  );
}

function OutcomeSplit() {
  const split = hutamaKaryaCase.outcomeSplit;
  const total = split.reduce((sum, item) => sum + item.count, 0);

  return (
    <figure className="rounded-2xl border border-biz-line bg-white p-5 sm:p-6">
      <figcaption>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-biz-muted uppercase">Arah perubahan skor</p>
        <p className="mt-1 text-sm text-biz-copy">{total} peserta dengan pre- dan post-test sesi 1.</p>
      </figcaption>
      <div className="mt-5 flex h-9 gap-0.5" role="img" aria-label={split.map((item) => `${item.label} ${item.count}`).join(", ")}>
        {split.map((item) => (
          <span
            key={item.label}
            title={`${item.label}: ${item.count} peserta`}
            className={`flex items-center justify-center first:rounded-l-md last:rounded-r-md ${toneClass[item.tone]}`}
            style={{ width: `${(item.count / total) * 100}%` }}
          >
            {item.tone === "up" && <span className="text-sm font-semibold text-white tabular-nums">{item.count}</span>}
          </span>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-biz-copy">
        {split.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-sm ${toneClass[item.tone]}`} aria-hidden="true" />
            {item.label} <strong className="font-semibold text-biz-ink tabular-nums">{item.count}</strong>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function GroupChange() {
  const groups = hutamaKaryaCase.groups;
  const max = 16;

  return (
    <figure className="rounded-2xl border border-biz-line bg-white p-5 sm:p-6 lg:row-span-2">
      <figcaption>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-biz-muted uppercase">Kenaikan skor per bagian</p>
        <p className="mt-1 text-sm text-biz-copy">Selisih post-test dan pre-test sesi 1, dalam poin.</p>
      </figcaption>
      <ul className="mt-6 grid gap-5">
        {groups.map((group) => (
          <li key={group.name} title={`${group.name}: +${formatScore(group.change)} poin, ${group.paired} peserta`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-biz-ink">
                {group.name} <span className="font-normal text-biz-muted">· n = {group.paired}</span>
              </span>
              <span className="font-semibold text-biz-forest tabular-nums">+{formatScore(group.change)}</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-biz-panel-soft">
              <div className="h-full rounded-full bg-biz-forest-light" style={{ width: `${(group.change / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>Kenaikan skor rata-rata sesi 1 per bagian Human Capital</caption>
        <thead><tr><th>Bagian</th><th>Kenaikan (poin)</th><th>Peserta berpasangan</th></tr></thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.name}><td>{group.name}</td><td>{formatScore(group.change)}</td><td>{group.paired}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-7 border-t border-biz-line pt-4 text-xs leading-[1.6] text-biz-muted">
        Keempat bagian naik di sesi 1. Bagian dengan peserta lebih sedikit lebih sensitif terhadap satu-dua nilai, jadi bacalah
        sebagai arah, bukan peringkat.
      </p>
    </figure>
  );
}

export default function CaseStudyScoreChartBIZ() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <GroupChange />
      <ScoreShift />
      <OutcomeSplit />
    </div>
  );
}
