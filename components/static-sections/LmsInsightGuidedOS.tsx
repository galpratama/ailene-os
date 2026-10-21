"use client";

import type {
  LmsGuidedReviewStatus,
  LmsGuidedSession,
  LmsInsightsFilter,
} from "@/apis/lms";
import AppInput from "@/components/fields/AppInput";
import LmsInsightEmptyOS from "@/components/elements/LmsInsightEmptyOS";
import LmsInsightErrorOS from "@/components/elements/LmsInsightErrorOS";
import LmsInsightSkeletonOS from "@/components/elements/LmsInsightSkeletonOS";
import LmsInsightPanelOS from "@/components/items/LmsInsightPanelOS";
import LmsInsightStatOS from "@/components/items/LmsInsightStatOS";
import LmsLearnerCellOS from "@/components/items/LmsLearnerCellOS";
import Label from "@/components/labels/Label";
import LmsGuidedReviewLabel from "@/components/labels/LmsGuidedReviewLabel";
import LmsRatingLabel from "@/components/labels/LmsRatingLabel";
import ProgressBar from "@/components/labels/ProgressBar";
import SheetOS from "@/components/modals/SheetOS";
import LmsInsightFilterChipsOS from "@/components/navigations/LmsInsightFilterChipsOS";
import { useLmsInsight } from "@/hooks/useLmsInsight";
import { getLmsGuidedInsights } from "@/lib/actions";
import {
  formatInsightDate,
  formatScore,
  guidedReviewStyles,
  guidedStatusLabels,
  matchesLearner,
} from "@/lib/lms-insights";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Quote,
  Search,
  Workflow,
} from "lucide-react";
import { useState } from "react";

type ReviewFilter = "all" | LmsGuidedReviewStatus;

const funnelTones = [
  "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300",
  "bg-biru/15 text-biru",
  "bg-ungu/15 text-ungu",
  "bg-oranye/10 text-oranye",
  "bg-claude/10 text-claude",
];

export default function LmsInsightGuidedOS({
  filter,
  sessionToken,
}: {
  filter: LmsInsightsFilter;
  sessionToken: string;
}) {
  const query = useLmsInsight(
    "guided",
    filter,
    sessionToken,
    getLmsGuidedInsights,
  );
  const [keyword, setKeyword] = useState("");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [selected, setSelected] = useState<LmsGuidedSession | null>(null);

  if (query.isPending) return <LmsInsightSkeletonOS />;
  if (query.isError)
    return (
      <LmsInsightErrorOS
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );

  const { summary, funnel, sessions } = query.data;
  const visible = sessions.filter(
    (s) =>
      (reviewFilter === "all" || s.review_status === reviewFilter) &&
      (matchesLearner(s.learner, keyword) ||
        (s.daily_task ?? "").toLowerCase().includes(keyword.trim().toLowerCase())),
  );

  if (sessions.length === 0) {
    return (
      <LmsInsightEmptyOS
        icon={Workflow}
        title="No guided use cases yet"
        message="When learners start the six-step guided flow, their progress and submissions appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <LmsInsightStatOS
          label="Use cases"
          value={summary.total}
          hint={`${summary.in_progress} still in progress`}
        />
        <LmsInsightStatOS
          label="Awaiting review"
          value={
            <span className={summary.awaiting_review > 0 ? "text-oranye" : undefined}>
              {summary.awaiting_review}
            </span>
          }
          hint={`${summary.needs_revision} sent back for revision`}
        />
        <LmsInsightStatOS
          label="Accepted"
          value={summary.accepted}
          hint="Approved by a champion"
        />
        <LmsInsightStatOS
          label="Time saved / run"
          value={summary.minutes_saved_per_run === null ? "—" : `${formatScore(summary.minutes_saved_per_run)}m`}
          hint={`${formatScore(summary.hours_saved)} hours reported in total`}
        />
        <LmsInsightStatOS
          label="Helpfulness"
          value={<LmsRatingLabel rating={summary.average_helpfulness} />}
          hint="Learners' own rating"
        />
      </div>

      <LmsInsightPanelOS
        title="Adoption journey"
        description="Where each use case currently sits in the guided flow."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {funnel.map((stage, index) => (
            <div key={stage.status} className="flex flex-1 items-center gap-2">
              <div className={`flex flex-1 flex-col rounded-xl px-4 py-3 ${funnelTones[index % funnelTones.length]}`}>
                <span className="font-heading text-2xl font-bold tabular-nums">{stage.count}</span>
                <span className="text-xs font-semibold">{guidedStatusLabels[stage.status]}</span>
              </div>
              {index < funnel.length - 1 && (
                <ChevronRight size={16} className="hidden shrink-0 text-gray-300 sm:block dark:text-zinc-600" />
              )}
            </div>
          ))}
        </div>
      </LmsInsightPanelOS>

      <LmsInsightPanelOS
        title="Use cases"
        description="Click a row to read the learner's task, workflow and testimonial."
        action={
          <AppInput
            inputId="lms-insight-guided-search"
            icon={<Search size={14} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search learner or task..."
            className="w-full sm:w-64"
          />
        }
      >
        <LmsInsightFilterChipsOS
          value={reviewFilter}
          onChange={setReviewFilter}
          options={[
            { value: "all", label: "All", count: sessions.length },
            ...(Object.keys(guidedReviewStyles) as LmsGuidedReviewStatus[]).map((status) => ({
              value: status,
              label: guidedReviewStyles[status].label,
              count: sessions.filter((s) => s.review_status === status).length,
            })),
          ]}
        />
        <div className="-mx-5 mt-4 overflow-x-auto border-t border-line-soft">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Learner</th>
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Steps</th>
                <th className="px-5 py-3">Time per run</th>
                <th className="px-5 py-3">Review</th>
                <th className="px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => setSelected(session)}
                  className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3">
                    <LmsLearnerCellOS
                      name={session.learner.full_name}
                      avatar={session.learner.avatar}
                      caption={session.learner.group_name}
                    />
                  </td>
                  <td className="max-w-64 px-5 py-3">
                    <p className="truncate font-medium text-gray-800 dark:text-zinc-200">
                      {session.use_case_name ?? session.daily_task ?? "Untitled task"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {guidedStatusLabels[session.status]} · step {session.current_step}/6
                    </p>
                  </td>
                  <td className="w-36 px-5 py-3">
                    <ProgressBar
                      value={session.steps_done}
                      total={session.step_count}
                      variant={session.step_count > 0 && session.steps_done === session.step_count ? "hijau" : "claude"}
                    />
                    <p className="mt-1 text-xs tabular-nums text-gray-500 dark:text-zinc-400">
                      {session.step_count === 0 ? "Not generated" : `${session.steps_done}/${session.step_count} done`}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <TimeDelta session={session} />
                  </td>
                  <td className="px-5 py-3">
                    <LmsGuidedReviewLabel status={session.review_status} />
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">
                    {formatInsightDate(session.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No use cases match this filter.
            </p>
          )}
        </div>
      </LmsInsightPanelOS>

      <SheetOS
        title={selected?.use_case_name ?? selected?.daily_task ?? "Guided use case"}
        description={selected ? `${selected.learner.full_name} · ${selected.learner.group_name ?? ""}` : undefined}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      >
        {selected && <SessionDetail session={selected} />}
      </SheetOS>
    </div>
  );
}

function TimeDelta({ session }: { session: LmsGuidedSession }) {
  if (session.minutes_without_ai === null)
    return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-gray-600 dark:text-zinc-300">
      <Clock size={12} className="text-gray-400" />
      {formatScore(session.minutes_without_ai)}m
      {session.estimated_minutes_with_ai !== null && (
        <>
          <ArrowRight size={12} className="text-gray-400" />
          <span className="font-semibold text-claude">{session.estimated_minutes_with_ai}m</span>
        </>
      )}
    </span>
  );
}

function DetailBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <p className="whitespace-pre-line text-sm text-gray-700 dark:text-zinc-200">{text}</p>
    </div>
  );
}

function SessionDetail({ session }: { session: LmsGuidedSession }) {
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <LmsGuidedReviewLabel status={session.review_status} />
        <Label variant="gray">{guidedStatusLabels[session.status]}</Label>
        {session.frequency && <Label variant="biru">{session.frequency}</Label>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line-soft p-3 text-center">
          <p className="font-heading text-lg font-bold tabular-nums text-gray-900 dark:text-zinc-100">
            {session.minutes_without_ai === null ? "—" : `${formatScore(session.minutes_without_ai)}m`}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Without AI</p>
        </div>
        <div className="rounded-xl border border-line-soft p-3 text-center">
          <p className="font-heading text-lg font-bold tabular-nums text-claude">
            {session.estimated_minutes_with_ai === null ? "—" : `${session.estimated_minutes_with_ai}m`}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">With AI</p>
        </div>
        <div className="rounded-xl border border-line-soft p-3 text-center">
          <p className="font-heading text-lg font-bold tabular-nums text-gray-900 dark:text-zinc-100">
            {session.steps_done}/{session.step_count}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Steps done</p>
        </div>
      </div>

      <DetailBlock title="Daily task" text={session.daily_task} />
      <DetailBlock title="Pain point" text={session.pain_point} />
      <DetailBlock title="AI workflow summary" text={session.summary} />

      {(session.testimonial || session.helpfulness_rating !== null) && (
        <div className="rounded-xl bg-claude/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <Quote size={16} className="text-claude" />
            {session.helpfulness_rating !== null && (
              <LmsRatingLabel rating={session.helpfulness_rating} />
            )}
          </div>
          {session.testimonial && (
            <p className="mt-2 text-sm italic text-gray-700 dark:text-zinc-200">
              “{session.testimonial}”
            </p>
          )}
          {session.hours_saved !== null && (
            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
              Reports saving {formatScore(session.hours_saved)} hours
            </p>
          )}
        </div>
      )}

      <DetailBlock title="Champion's comment" text={session.review_comment} />

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line-soft pt-4 text-xs text-gray-500 dark:text-zinc-400">
        <span>Started {formatInsightDate(session.created_at)}</span>
        <span>Submitted {formatInsightDate(session.submitted_at)}</span>
        <span>Reviewed {formatInsightDate(session.reviewed_at)}</span>
        <span>Updated {formatInsightDate(session.updated_at)}</span>
      </div>
    </div>
  );
}
