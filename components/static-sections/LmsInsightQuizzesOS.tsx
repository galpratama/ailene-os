"use client";

import type { LmsInsightsFilter, LmsQuizSubmission } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import LmsBarChartOS from "@/components/charts/LmsBarChartOS";
import LmsInsightEmptyOS from "@/components/elements/LmsInsightEmptyOS";
import LmsInsightErrorOS from "@/components/elements/LmsInsightErrorOS";
import LmsInsightSkeletonOS from "@/components/elements/LmsInsightSkeletonOS";
import LmsInsightPanelOS from "@/components/items/LmsInsightPanelOS";
import LmsInsightStatOS from "@/components/items/LmsInsightStatOS";
import LmsLearnerCellOS from "@/components/items/LmsLearnerCellOS";
import Label from "@/components/labels/Label";
import LmsScoreLabel from "@/components/labels/LmsScoreLabel";
import { useLmsInsight } from "@/hooks/useLmsInsight";
import { getLmsQuizInsights } from "@/lib/actions";
import {
  formatInsightDate,
  formatScore,
  matchesLearner,
  scoreColor,
} from "@/lib/lms-insights";
import { Search, Trophy } from "lucide-react";
import { useState } from "react";

function duration(submission: LmsQuizSubmission) {
  const minutes = Math.round(
    (new Date(submission.submitted_at).getTime() - new Date(submission.started_at).getTime()) / 60000,
  );
  return minutes < 1 ? "<1 min" : `${minutes} min`;
}

export default function LmsInsightQuizzesOS({
  filter,
  sessionToken,
}: {
  filter: LmsInsightsFilter;
  sessionToken: string;
}) {
  const query = useLmsInsight("quizzes", filter, sessionToken, getLmsQuizInsights);
  const [keyword, setKeyword] = useState("");
  const [quizId, setQuizId] = useState<string | null>(null);

  if (query.isPending) return <LmsInsightSkeletonOS />;
  if (query.isError)
    return (
      <LmsInsightErrorOS
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );

  const { summary, distribution, quizzes, submissions } = query.data;
  if (quizzes.length === 0) {
    return (
      <LmsInsightEmptyOS
        icon={Trophy}
        title="No quizzes yet"
        message="Add a quiz to a session in the Content tab; every completed attempt shows up here."
      />
    );
  }

  const visible = submissions.filter(
    (s) => (quizId === null || s.quiz_id === quizId) && matchesLearner(s.learner, keyword),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <LmsInsightStatOS label="Submissions" value={summary.submissions} hint="Completed attempts" />
        <LmsInsightStatOS label="Participants" value={summary.participants} hint="Learners with at least one attempt" />
        <LmsInsightStatOS label="Average score" value={formatScore(summary.average_score)} hint="Every attempt" />
        <LmsInsightStatOS label="Average best" value={formatScore(summary.average_best_score)} hint="Best attempt per learner" />
        <LmsInsightStatOS
          label="Perfect scores"
          value={<span className="inline-flex items-center gap-1.5">{summary.perfect_scores}<Trophy size={16} className="text-kuning" /></span>}
          hint="Hit 100 on a quiz"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <LmsInsightPanelOS
          className="lg:col-span-2"
          title="Score distribution"
          description="Each learner's best attempt per quiz."
        >
          {summary.submissions === 0 ? (
            <LmsInsightEmptyOS icon={Trophy} title="No attempts yet" message="The distribution fills in as learners finish quizzes." />
          ) : (
            <LmsBarChartOS
              data={distribution.map((bucket) => ({
                key: bucket.label,
                label: bucket.label,
                value: bucket.count,
                color: scoreColor(bucket.min),
              }))}
              unit={(value) => `${value} learner${value === 1 ? "" : "s"}`}
            />
          )}
        </LmsInsightPanelOS>
        <LmsInsightPanelOS className="lg:col-span-3" title="Quizzes" description="Click a quiz to filter the submissions.">
          <ul className="flex flex-col gap-2">
            {quizzes.map((quiz) => {
              const active = quizId === quiz.id;
              return (
                <li key={quiz.id}>
                  <AppButton
                    type="button"
                    variant="bare"
                    size="bare"
                    aria-pressed={active}
                    onClick={() => setQuizId(active ? null : quiz.id)}
                    className={`w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      active ? "border-claude bg-claude/5" : "border-line-soft hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{quiz.name}</span>
                      <span className="block truncate text-xs text-gray-400">
                        {quiz.chapter.name} · {quiz.question_count} questions · {quiz.participants} learners · {quiz.attempts} attempts
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                        <span
                          className="block h-full rounded-full transition-all"
                          style={{ width: `${quiz.average_best_score ?? 0}%`, backgroundColor: scoreColor(quiz.average_best_score) }}
                        />
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <LmsScoreLabel score={quiz.average_best_score} />
                      <span className="text-[11px] text-gray-400">top {formatScore(quiz.highest_score)}</span>
                    </span>
                  </AppButton>
                </li>
              );
            })}
          </ul>
        </LmsInsightPanelOS>
      </div>

      <LmsInsightPanelOS
        title="Submissions"
        description="Newest first. Unfinished attempts are hidden."
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="w-full sm:w-52">
              <AppSelect
                selectId="lms-insight-quiz-filter"
                placeholder="All quizzes"
                value={quizId ?? ""}
                options={[{ value: "", label: "All quizzes" }, ...quizzes.map((q) => ({ value: q.id, label: q.name }))]}
                onChange={(value) => setQuizId(value ? String(value) : null)}
              />
            </div>
            <AppInput
              inputId="lms-insight-quiz-search"
              icon={<Search size={14} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search learner..."
              className="w-full sm:w-52"
            />
          </div>
        }
      >
        <div className="-mx-5 overflow-x-auto border-t border-line-soft">
          <table className="w-full min-w-170 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Learner</th>
                <th className="px-5 py-3">Quiz</th>
                <th className="px-5 py-3">Attempt</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Time taken</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((submission) => (
                <tr key={submission.id} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-3">
                    <LmsLearnerCellOS name={submission.learner.full_name} avatar={submission.learner.avatar} caption={submission.learner.group_name} />
                  </td>
                  <td className="max-w-56 px-5 py-3">
                    <p className="truncate text-gray-800 dark:text-zinc-200">{submission.quiz_name}</p>
                    <p className="truncate text-xs text-gray-400">{submission.chapter.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Label variant="gray">#{submission.attempt_number}</Label>
                  </td>
                  <td className="px-5 py-3"><LmsScoreLabel score={submission.score} /></td>
                  <td className="px-5 py-3 tabular-nums text-gray-500 dark:text-zinc-400">{duration(submission)}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{formatInsightDate(submission.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No submissions match this filter.</p>
          )}
        </div>
      </LmsInsightPanelOS>
    </div>
  );
}
