"use client";

import type { SourceData } from "@/apis/domain-ranking";
import Label, { type LabelVariant } from "@/components/labels/Label";
import { listRankingSources } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { formatRankingDate, RANKING_DATA_SOURCES, type RankingDataSourceDoc } from "@/lib/domain-ranking";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Database, ExternalLink, Layers, Target } from "lucide-react";
import { useState } from "react";

const weightColors = ["bg-chart-1 text-white", "bg-chart-2 text-white", "bg-chart-3 text-white", "bg-chart-4 text-forest-deep"];

const runStyles: Record<NonNullable<SourceData["last_run"]>["status"], { variant: LabelVariant; label: string }> = {
  success: { variant: "hijau", label: "Last run succeeded" },
  failed: { variant: "merah", label: "Last run failed" },
  running: { variant: "kuning", label: "Updating" },
};

function countryName(code: string) {
  if (code === "GLOBAL") return "Worldwide";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function SourceLogo({ source }: { source: RankingDataSourceDoc }) {
  const [failed, setFailed] = useState(false);

  if (!source.logoDomain || failed) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-claude/10 text-lg font-bold text-claude dark:bg-lime-bright/10 dark:text-lime-bright">
        {source.name.charAt(0)}
      </span>
    );
  }
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-soft bg-white p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${source.logoDomain}&sz=64`}
        alt={`${source.name} logo`}
        loading="lazy"
        className="size-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

type LiveState = "loading" | "error" | "ready";

function LiveStatus({ source, live, state }: { source: RankingDataSourceDoc; live?: SourceData; state: LiveState }) {
  const note = (text: string) => <p className="text-xs text-gray-400 dark:text-zinc-500">{text}</p>;
  if (source.id === "serper") return note("Runs with the keyword checks; it has no separate ingest status.");
  if (state === "loading") return note("Checking live status...");
  if (state === "error") return note("Live status is unavailable right now.");
  if (!live) return note("This source is not reported by the API yet.");

  const run = live.last_run ? runStyles[live.last_run.status] : { variant: "gray" as const, label: "Not run yet" };
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-1.5">
        {live.lists.length === 0 ? (
          <span className="text-xs text-gray-400 dark:text-zinc-500">No data loaded yet</span>
        ) : (
          live.lists.map((list) => (
            <span key={list.country} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
              {countryName(list.country)} · <span className="font-semibold">{formatRankingDate(list.as_of_date)}</span>
            </span>
          ))
        )}
      </div>
      <Label variant={run.variant}>{run.label}</Label>
    </div>
  );
}

function SourceCard({ source, live, state }: { source: RankingDataSourceDoc; live?: SourceData; state: LiveState }) {
  const frequency = source.frequency ?? (live ? live.update_frequency.replace(/^./, (letter) => letter.toUpperCase()) : "—");

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-card-bg">
      <div className="flex items-start gap-3 p-5 pb-4">
        <SourceLogo source={source} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-zinc-100">{source.name}</h4>
            {source.compositeWeight === null ? (
              <Label variant="gray">Display only</Label>
            ) : (
              <Label variant="hijau">{source.compositeWeight}% of composite</Label>
            )}
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-claude dark:text-zinc-400 dark:hover:text-lime-bright"
          >
            {source.provider}
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <p className="px-5 text-sm text-gray-700 dark:text-zinc-300">{source.collects}</p>

      <dl className="mb-5 mt-4 grid gap-3 px-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <CalendarClock size={12} /> Frequency
          </dt>
          <dd className="mt-1 font-medium text-gray-900 dark:text-zinc-100">{frequency}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Database size={12} /> Stored in
          </dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {source.tables.map((table) => (
              <code key={table} className="rounded-md border border-line-soft bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
                {table}
              </code>
            ))}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Target size={12} /> Used for
          </dt>
          <dd className="mt-1">
            <ul className="space-y-1">
              {source.usedFor.map((use) => (
                <li key={use} className="flex gap-2 text-gray-700 dark:text-zinc-300">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-claude dark:bg-lime-bright" />
                  {use}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="mt-auto border-t border-line-soft px-5 py-3">
        <LiveStatus source={source} live={live} state={state} />
      </div>
    </article>
  );
}

export default function DomainRankingSourcesPanelOS({ sessionToken }: { sessionToken: string }) {
  const sources = useQuery({
    queryKey: ["domain-ranking", "sources"],
    queryFn: async () => requireApiData(await listRankingSources()),
    enabled: !!sessionToken,
  });
  const weighted = RANKING_DATA_SOURCES.filter((source) => source.compositeWeight !== null);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-line bg-card-bg p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-claude/10 text-claude dark:bg-lime-bright/10 dark:text-lime-bright">
            <Layers size={18} />
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">How the composite score is built</h3>
            <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-zinc-400">
              Four sources feed the 0–100 composite score. When a domain has no value from one of them, the remaining weights are normalized. Majestic and Serper are shown for reference only.
            </p>
          </div>
        </div>
        <div className="mt-5 flex h-9 overflow-hidden rounded-lg text-xs font-semibold">
          {weighted.map((source, index) => (
            <div
              key={source.id}
              className={`flex items-center justify-center truncate px-2 ${weightColors[index]}`}
              style={{ width: `${source.compositeWeight}%` }}
              title={`${source.name}: ${source.compositeWeight}%`}
            >
              {source.compositeWeight}%
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600 dark:text-zinc-300">
          {weighted.map((source, index) => (
            <span key={source.id} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${weightColors[index].split(" ")[0]}`} />
              {source.name} <span className="font-semibold tabular-nums">{source.compositeWeight}%</span>
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {RANKING_DATA_SOURCES.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            live={sources.data?.list.find((item) => item.id === source.id)}
            state={sources.isError ? "error" : sources.isSuccess ? "ready" : "loading"}
          />
        ))}
      </div>
    </div>
  );
}
