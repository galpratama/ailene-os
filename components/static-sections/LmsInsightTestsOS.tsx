"use client";

import type { LmsInsightsFilter } from "@/apis/lms";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import LmsPrePostChartOS from "@/components/charts/LmsPrePostChartOS";
import LmsInsightEmptyOS from "@/components/elements/LmsInsightEmptyOS";
import LmsInsightErrorOS from "@/components/elements/LmsInsightErrorOS";
import LmsInsightSkeletonOS from "@/components/elements/LmsInsightSkeletonOS";
import LmsInsightPanelOS from "@/components/items/LmsInsightPanelOS";
import LmsInsightStatOS from "@/components/items/LmsInsightStatOS";
import LmsLearnerCellOS from "@/components/items/LmsLearnerCellOS";
import LmsScoreLabel from "@/components/labels/LmsScoreLabel";
import LmsUpliftLabel from "@/components/labels/LmsUpliftLabel";
import LmsInsightFilterChipsOS from "@/components/navigations/LmsInsightFilterChipsOS";
import { useLmsInsight } from "@/hooks/useLmsInsight";
import { getLmsTestInsights } from "@/lib/actions";
import { formatScore, matchesLearner, percentOf } from "@/lib/lms-insights";
import { ArrowRight, FlaskConical, Search } from "lucide-react";
import { useState } from "react";

type ResultFilter = "all" | "improved" | "declined" | "missing_post";

export default function LmsInsightTestsOS({
  filter,
  sessionToken,
}: {
  filter: LmsInsightsFilter;
  sessionToken: string;
}) {
  const query = useLmsInsight("tests", filter, sessionToken, getLmsTestInsights);
  const [keyword, setKeyword] = useState("");
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");

  if (query.isPending) return <LmsInsightSkeletonOS />;
  if (query.isError)
    return (
      <LmsInsightErrorOS
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );

  const { summary, chapters, results } = query.data;
  if (chapters.length === 0) {
    return (
      <LmsInsightEmptyOS
        icon={FlaskConical}
        title="No pre-tests or post-tests yet"
        message="Add a pre-test and post-test to a session in the Content tab to measure what learners gained."
      />
    );
  }

  const scoped = results.filter(
    (r) => (chapterId === null || r.chapter.id === chapterId) && matchesLearner(r.learner, keyword),
  );
  const visible = scoped.filter((r) =>
    resultFilter === "improved"
      ? (r.uplift ?? 0) > 0
      : resultFilter === "declined"
        ? (r.uplift ?? 0) < 0
        : resultFilter === "missing_post"
          ? r.pre_submitted && !r.post_submitted
          : true,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <LmsInsightStatOS label="Pre-test avg" value={formatScore(summary.pre_average)} hint={`${summary.pre_submissions} submissions`} />
        <LmsInsightStatOS label="Post-test avg" value={formatScore(summary.post_average)} hint={`${summary.post_submissions} submissions`} />
        <LmsInsightStatOS
          label="Average uplift"
          value={<LmsUpliftLabel uplift={summary.average_uplift} />}
          hint="Post minus pre, same learner"
        />
        <LmsInsightStatOS
          label="Improved"
          value={`${percentOf(summary.improved_count, summary.paired_count)}%`}
          hint={`${summary.improved_count} of ${summary.paired_count} who took both`}
        />
        <LmsInsightStatOS
          label="Post-test pending"
          value={Math.max(0, summary.pre_submissions - summary.post_submissions)}
          hint="Took the pre-test, not the post yet"
        />
      </div>

      <LmsInsightPanelOS
        title="Before vs after, per session"
        description="Average score out of 100. The gap between the bars is the learning gain."
      >
        {results.length === 0 ? (
          <LmsInsightEmptyOS icon={FlaskConical} title="No submissions yet" message="Scores appear as soon as learners submit a test." />
        ) : (
          <LmsPrePostChartOS
            data={chapters.map((c) => ({ label: c.chapter.name, pre: c.pre_average, post: c.post_average }))}
          />
        )}
      </LmsInsightPanelOS>

      <LmsInsightPanelOS title="Sessions" description="Participation and gain for each session with a test.">
        <div className="-mx-5 overflow-x-auto border-t border-line-soft">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Submissions</th>
                <th className="px-5 py-3">Pre</th>
                <th className="px-5 py-3">Post</th>
                <th className="px-5 py-3">Uplift</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((row) => (
                <tr key={row.chapter.id} className="border-b border-line-soft last:border-0">
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100">{row.chapter.name}</td>
                  <td className="px-5 py-3 tabular-nums text-gray-600 dark:text-zinc-300">
                    {row.has_pre_test ? row.pre_submissions : "—"} pre · {row.has_post_test ? row.post_submissions : "—"} post
                  </td>
                  <td className="px-5 py-3"><LmsScoreLabel score={row.pre_average} /></td>
                  <td className="px-5 py-3"><LmsScoreLabel score={row.post_average} /></td>
                  <td className="px-5 py-3"><LmsUpliftLabel uplift={row.average_uplift} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LmsInsightPanelOS>

      <LmsInsightPanelOS
        title="Learner results"
        description="Essay-only tests have no automatic score."
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="w-full sm:w-52">
              <AppSelect
                selectId="lms-insight-tests-chapter"
                placeholder="All sessions"
                value={chapterId ?? ""}
                options={[
                  { value: "", label: "All sessions" },
                  ...chapters.map((c) => ({ value: c.chapter.id, label: c.chapter.name })),
                ]}
                onChange={(value) => setChapterId(value ? Number(value) : null)}
              />
            </div>
            <AppInput
              inputId="lms-insight-tests-search"
              icon={<Search size={14} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search learner..."
              className="w-full sm:w-52"
            />
          </div>
        }
      >
        <LmsInsightFilterChipsOS
          value={resultFilter}
          onChange={setResultFilter}
          options={[
            { value: "all", label: "All", count: scoped.length },
            { value: "improved", label: "Improved", count: scoped.filter((r) => (r.uplift ?? 0) > 0).length },
            { value: "declined", label: "Declined", count: scoped.filter((r) => (r.uplift ?? 0) < 0).length },
            { value: "missing_post", label: "Post-test pending", count: scoped.filter((r) => r.pre_submitted && !r.post_submitted).length },
          ]}
        />
        <div className="-mx-5 mt-4 overflow-x-auto border-t border-line-soft">
          <table className="w-full min-w-170 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Learner</th>
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Pre → Post</th>
                <th className="px-5 py-3">Uplift</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={`${row.learner.access_id}-${row.chapter.id}`} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-3">
                    <LmsLearnerCellOS name={row.learner.full_name} avatar={row.learner.avatar} caption={row.learner.group_name} />
                  </td>
                  <td className="max-w-56 truncate px-5 py-3 text-gray-600 dark:text-zinc-300">{row.chapter.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <LmsScoreLabel score={row.pre_score} emptyLabel={row.pre_submitted ? "Essay" : "Not taken"} />
                      <ArrowRight size={13} className="text-gray-300 dark:text-zinc-600" />
                      <LmsScoreLabel score={row.post_score} emptyLabel={row.post_submitted ? "Essay" : "Not taken"} />
                    </div>
                  </td>
                  <td className="px-5 py-3"><LmsUpliftLabel uplift={row.uplift} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No results match this filter.</p>
          )}
        </div>
      </LmsInsightPanelOS>
    </div>
  );
}
