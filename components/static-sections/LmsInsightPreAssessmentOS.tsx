"use client";

import type { LmsInsightsFilter, LmsPaMember } from "@/apis/lms";
import AppInput from "@/components/fields/AppInput";
import LmsBarChartOS from "@/components/charts/LmsBarChartOS";
import LmsRadarChartOS from "@/components/charts/LmsRadarChartOS";
import LmsInsightEmptyOS from "@/components/elements/LmsInsightEmptyOS";
import LmsInsightErrorOS from "@/components/elements/LmsInsightErrorOS";
import LmsInsightSkeletonOS from "@/components/elements/LmsInsightSkeletonOS";
import LmsInsightPanelOS from "@/components/items/LmsInsightPanelOS";
import LmsInsightStatOS from "@/components/items/LmsInsightStatOS";
import LmsLearnerCellOS from "@/components/items/LmsLearnerCellOS";
import Label from "@/components/labels/Label";
import LmsPaStatusLabel from "@/components/labels/LmsPaStatusLabel";
import LmsScoreLabel from "@/components/labels/LmsScoreLabel";
import ProgressBar from "@/components/labels/ProgressBar";
import SheetOS from "@/components/modals/SheetOS";
import LmsInsightFilterChipsOS from "@/components/navigations/LmsInsightFilterChipsOS";
import { useLmsInsight } from "@/hooks/useLmsInsight";
import { getLmsPreAssessmentInsights } from "@/lib/actions";
import {
  formatInsightDate,
  formatScore,
  matchesLearner,
  percentOf,
  scoreColor,
} from "@/lib/lms-insights";
import { ClipboardCheck, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";

type MemberFilter = "all" | "not_started" | "submitted" | "below" | "meets";

export default function LmsInsightPreAssessmentOS({
  filter,
  sessionToken,
}: {
  filter: LmsInsightsFilter;
  sessionToken: string;
}) {
  const query = useLmsInsight(
    "pre-assessment",
    filter,
    sessionToken,
    getLmsPreAssessmentInsights,
  );
  const [keyword, setKeyword] = useState("");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
  const [selected, setSelected] = useState<LmsPaMember | null>(null);

  if (query.isPending) return <LmsInsightSkeletonOS />;
  if (query.isError)
    return (
      <LmsInsightErrorOS
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );

  const { summary, bands, clusters, groups, members, target_band } = query.data;
  const below = members.filter((m) => m.status === "scored" && !m.meets_target);
  const filtered = members.filter((m) => {
    if (!matchesLearner(m, keyword)) return false;
    if (memberFilter === "not_started") return m.status === "not_started";
    if (memberFilter === "submitted") return m.status === "submitted";
    if (memberFilter === "below") return m.status === "scored" && !m.meets_target;
    if (memberFilter === "meets") return m.meets_target;
    return true;
  });
  const flagged =
    summary.flagged_security + summary.flagged_overclaim + summary.flagged_shadow_ai;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <LmsInsightStatOS
          label="Completion"
          value={`${percentOf(summary.submitted, summary.total)}%`}
          hint={`${summary.submitted} of ${summary.total} submitted`}
        />
        <LmsInsightStatOS
          label="Scored"
          value={summary.scored}
          hint={`${summary.submitted - summary.scored} still being graded`}
        />
        <LmsInsightStatOS
          label="Meets target"
          value={summary.meets_target}
          hint={`Band ${target_band.band}${target_band.name ? ` · ${target_band.name}` : ""} or above`}
        />
        <LmsInsightStatOS
          label="Average score"
          value={formatScore(summary.average_score)}
          hint="Mean of cluster scores"
        />
        <LmsInsightStatOS
          label="Risk flags"
          value={
            <span className={flagged > 0 ? "text-oranye" : undefined}>{flagged}</span>
          }
          hint={`${summary.flagged_overclaim} overclaim · ${summary.flagged_shadow_ai} shadow AI · ${summary.flagged_security} security`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <LmsInsightPanelOS
          className="lg:col-span-3"
          title="Band distribution"
          description={`Darker bars are at or above the target band (${target_band.band}).`}
        >
          {summary.scored === 0 ? (
            <LmsInsightEmptyOS
              icon={ClipboardCheck}
              title="No scored attempts yet"
              message="Bands appear here once members submit and their attempt is graded."
            />
          ) : (
            <LmsBarChartOS
              data={bands.map((band) => ({
                key: String(band.band),
                label: band.name ? `${band.band} · ${band.name}` : `Band ${band.band}`,
                value: band.count,
                color: band.band >= target_band.band ? "var(--claude)" : "var(--ungu)",
                highlight: band.band >= target_band.band,
              }))}
              unit={(value) => `${value} member${value === 1 ? "" : "s"}`}
            />
          )}
        </LmsInsightPanelOS>
        <LmsInsightPanelOS
          className="lg:col-span-2"
          title="Competency clusters"
          description="Average score per cluster across scored members."
        >
          {clusters.every((c) => c.score === null) ? (
            <LmsInsightEmptyOS
              icon={ClipboardCheck}
              title="Nothing to plot yet"
              message="Cluster averages show up after the first attempt is scored."
            />
          ) : clusters.length >= 3 ? (
            <LmsRadarChartOS
              data={clusters.map((c) => ({ label: c.name, value: c.score }))}
              max={100}
              color="var(--ungu)"
              valueLabel="Average"
            />
          ) : (
            <ClusterBars clusters={clusters} />
          )}
        </LmsInsightPanelOS>
      </div>

      {groups.length > 1 && (
        <LmsInsightPanelOS
          title="By group"
          description="Which teams have finished, and how they score."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.group_id}
                className="rounded-xl border border-line-soft p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                    {group.group_name ?? "Unnamed group"}
                  </p>
                  <LmsScoreLabel score={group.average_score} />
                </div>
                <ProgressBar
                  className="mt-3"
                  value={group.scored}
                  total={group.total}
                  variant="hijau"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-400">
                  {group.scored}/{group.total} scored · {group.meets_target} meet target
                </p>
              </div>
            ))}
          </div>
        </LmsInsightPanelOS>
      )}

      <LmsInsightPanelOS
        title="Members"
        description="Click a member to see their cluster breakdown and flags."
        action={
          <AppInput
            inputId="lms-insight-pa-search"
            icon={<Search size={14} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search member..."
            className="w-full sm:w-60"
          />
        }
      >
        <LmsInsightFilterChipsOS
          value={memberFilter}
          onChange={setMemberFilter}
          options={[
            { value: "all", label: "All", count: members.length },
            {
              value: "not_started",
              label: "Not started",
              count: summary.total - summary.submitted,
            },
            {
              value: "submitted",
              label: "Being graded",
              count: summary.submitted - summary.scored,
            },
            { value: "below", label: "Below target", count: below.length },
            { value: "meets", label: "Meets target", count: summary.meets_target },
          ]}
        />
        <div className="-mx-5 mt-4 overflow-x-auto border-t border-line-soft">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Clusters</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr
                  key={member.access_id}
                  onClick={() => setSelected(member)}
                  className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3">
                    <LmsLearnerCellOS
                      name={member.full_name}
                      avatar={member.avatar}
                      caption={member.group_name}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <LmsPaStatusLabel
                        status={member.status}
                        band={member.band}
                        meetsTarget={member.meets_target}
                      />
                      {hasRisk(member) && (
                        <ShieldAlert size={14} className="text-oranye" aria-label="Has risk flags" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <LmsScoreLabel score={member.average_score} />
                  </td>
                  <td className="px-5 py-3">
                    <ClusterSparkline member={member} />
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">
                    {formatInsightDate(member.submitted_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No members match this filter.
            </p>
          )}
        </div>
      </LmsInsightPanelOS>

      <SheetOS
        title={selected?.full_name ?? ""}
        description={selected?.group_name ?? undefined}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      >
        {selected && <MemberDetail member={selected} />}
      </SheetOS>
    </div>
  );
}

function hasRisk(member: LmsPaMember) {
  const f = member.flags;
  return (
    !!f &&
    (f.security_gate_passed === false || f.is_overclaim === true || f.is_shadow_ai === true)
  );
}

function ClusterSparkline({ member }: { member: LmsPaMember }) {
  if (member.status !== "scored") return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex h-6 items-end gap-1" title="Cluster scores">
      {member.clusters.map((cluster) => (
        <span
          key={cluster.code}
          title={`${cluster.name}: ${formatScore(cluster.score)}`}
          className="w-2.5 rounded-sm"
          style={{
            height: `${Math.max(8, cluster.score ?? 0)}%`,
            backgroundColor: scoreColor(cluster.score),
          }}
        />
      ))}
    </div>
  );
}

function ClusterBars({ clusters }: { clusters: LmsPaMember["clusters"] }) {
  return (
    <ul className="flex flex-col gap-3">
      {clusters.map((cluster) => (
        <li key={cluster.code}>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-gray-600 dark:text-zinc-300">{cluster.name}</span>
            <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
              {formatScore(cluster.score)}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${cluster.score ?? 0}%`,
                backgroundColor: scoreColor(cluster.score),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MemberDetail({ member }: { member: LmsPaMember }) {
  const f = member.flags;
  const flags = f
    ? [
        { label: "Security gate", bad: f.security_gate_passed === false, text: f.security_gate_passed === false ? "Failed" : "Passed" },
        { label: "Behaviour gate", bad: f.behaviour_gate_passed === false, text: f.behaviour_gate_passed === false ? "Failed" : "Passed" },
        { label: "Overclaim", bad: f.is_overclaim === true, text: f.is_overclaim ? "Detected" : "None" },
        { label: "Shadow AI", bad: f.is_shadow_ai === true, text: f.is_shadow_ai ? "Detected" : "None" },
      ]
    : [];
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <LmsPaStatusLabel
          status={member.status}
          band={member.band}
          meetsTarget={member.meets_target}
        />
        <LmsScoreLabel score={member.average_score} />
        {member.status === "scored" && (
          <Label variant={member.meets_target ? "hijau" : "oranye"}>
            {member.meets_target ? "Meets target" : "Below target"}
          </Label>
        )}
      </div>

      {member.status !== "scored" ? (
        <LmsInsightEmptyOS
          icon={ClipboardCheck}
          title={member.status === "not_started" ? "Not started yet" : "Waiting for grading"}
          message={
            member.status === "not_started"
              ? "This member hasn't taken the pre-assessment."
              : "The attempt is in; scores appear once grading finishes."
          }
        />
      ) : (
        <>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Clusters
            </p>
            <ClusterBars clusters={member.clusters} />
          </div>
          {f && (
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Knowledge", f.knowledge_score],
                ["Skills", f.skills_score],
                ["Behaviours", f.behaviours_score],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl border border-line-soft p-3 text-center">
                  <p className="font-heading text-lg font-bold tabular-nums text-gray-900 dark:text-zinc-100">
                    {formatScore(value as number | null)}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">{label as string}</p>
                </div>
              ))}
            </div>
          )}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Checks
            </p>
            <ul className="divide-y divide-line-soft rounded-xl border border-line">
              {flags.map((flag) => (
                <li key={flag.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">{flag.label}</span>
                  <Label variant={flag.bad ? "merah" : "hijau"}>{flag.text}</Label>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      <p className="text-xs text-gray-400">
        Submitted {formatInsightDate(member.submitted_at)}
      </p>
    </div>
  );
}
