"use client";

import type { LmsInsightsFilter, LmsReviewResponse, LmsSurveyRatings } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppSelect from "@/components/fields/AppSelect";
import LmsRadarChartOS from "@/components/charts/LmsRadarChartOS";
import LmsInsightEmptyOS from "@/components/elements/LmsInsightEmptyOS";
import LmsInsightErrorOS from "@/components/elements/LmsInsightErrorOS";
import LmsInsightSkeletonOS from "@/components/elements/LmsInsightSkeletonOS";
import LmsInsightPanelOS from "@/components/items/LmsInsightPanelOS";
import LmsInsightStatOS from "@/components/items/LmsInsightStatOS";
import LmsLearnerCellOS from "@/components/items/LmsLearnerCellOS";
import LmsRatingLabel from "@/components/labels/LmsRatingLabel";
import LmsInsightFilterChipsOS from "@/components/navigations/LmsInsightFilterChipsOS";
import { useLmsInsight } from "@/hooks/useLmsInsight";
import { getLmsReviewInsights } from "@/lib/actions";
import { formatInsightDate, surveyRatingLabels } from "@/lib/lms-insights";
import {
  CircleHelp,
  Heart,
  Lightbulb,
  MessageSquareHeart,
  ThumbsDown,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type FeedFilter = "all" | "with_comments" | "low";

const openAnswers: {
  key: keyof Pick<
    LmsReviewResponse,
    "favorite_material" | "disliked_material" | "missing_topics" | "improvement_suggestion"
  >;
  label: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  { key: "favorite_material", label: "Liked most", icon: Heart, tone: "text-pink" },
  { key: "disliked_material", label: "Liked least", icon: ThumbsDown, tone: "text-oranye" },
  { key: "missing_topics", label: "Missing topics", icon: CircleHelp, tone: "text-biru" },
  { key: "improvement_suggestion", label: "Suggestion", icon: Lightbulb, tone: "text-kuning" },
];

function hasComment(response: LmsReviewResponse) {
  return openAnswers.some((answer) => !!response[answer.key]?.trim());
}

function averageRatings(responses: LmsReviewResponse[]) {
  return surveyRatingLabels.map(({ key, label }) => {
    const values = responses
      .map((r) => r.ratings[key as keyof LmsSurveyRatings])
      .filter((v): v is number => v !== null);
    return {
      label,
      value: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,
    };
  });
}

export default function LmsInsightReviewsOS({
  filter,
  sessionToken,
}: {
  filter: LmsInsightsFilter;
  sessionToken: string;
}) {
  const query = useLmsInsight(
    "reviews",
    filter,
    sessionToken,
    getLmsReviewInsights,
  );
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("with_comments");

  if (query.isPending) return <LmsInsightSkeletonOS />;
  if (query.isError)
    return (
      <LmsInsightErrorOS
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );

  const { summary, chapters, responses } = query.data;
  if (responses.length === 0) {
    return (
      <LmsInsightEmptyOS
        icon={MessageSquareHeart}
        title="No session reviews yet"
        message="Learners rate the trainer and material at the end of every session. Their ratings and comments will land here."
      />
    );
  }

  const scoped = chapterId === null ? responses : responses.filter((r) => r.chapter.id === chapterId);
  const feed = scoped.filter((r) =>
    feedFilter === "with_comments"
      ? hasComment(r)
      : feedFilter === "low"
        ? (r.overall_average ?? 5) < 3.5
        : true,
  );
  const ranked = chapters.filter((c) => c.responses > 0);
  const scopedChapter = chapters.find((c) => c.chapter.id === chapterId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <LmsInsightStatOS
          label="Responses"
          value={summary.responses}
          hint={`From ${summary.learner_count} learners`}
        />
        <LmsInsightStatOS label="Overall" value={<LmsRatingLabel rating={summary.overall_average} />} hint="All eight ratings" />
        <LmsInsightStatOS label="Trainer" value={<LmsRatingLabel rating={summary.trainer_average} />} hint="Clarity, mastery, response, engagement" />
        <LmsInsightStatOS label="Material" value={<LmsRatingLabel rating={summary.material_average} />} hint="Relevance, flow, depth" />
        <LmsInsightStatOS label="Learning value" value={<LmsRatingLabel rating={summary.learning_value_average} />} hint="Was it worth the time?" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <LmsInsightPanelOS
          className="lg:col-span-2"
          title="Rating profile"
          description={scopedChapter ? scopedChapter.chapter.name : "All sessions, 1–5 scale."}
        >
          <LmsRadarChartOS
            data={averageRatings(scoped)}
            max={5}
            color="var(--oranye)"
            valueLabel="Average"
          />
        </LmsInsightPanelOS>
        <LmsInsightPanelOS
          className="lg:col-span-3"
          title="Sessions ranked"
          description="Click a session to focus the profile and the feedback below."
        >
          <ul className="flex flex-col gap-1">
            {[...ranked]
              .sort((a, b) => (b.overall_average ?? 0) - (a.overall_average ?? 0))
              .map((row, index) => {
                const active = chapterId === row.chapter.id;
                return (
                  <li key={row.chapter.id}>
                    <AppButton
                      type="button"
                      variant="bare"
                      size="bare"
                      aria-pressed={active}
                      onClick={() => setChapterId(active ? null : row.chapter.id)}
                      className={`w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-oranye/10" : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold tabular-nums text-gray-500 dark:bg-zinc-800 dark:text-zinc-300">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                          {row.chapter.name}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {row.responses} response{row.responses === 1 ? "" : "s"} · trainer{" "}
                          {row.trainer_average?.toFixed(1) ?? "—"} · material{" "}
                          {row.material_average?.toFixed(1) ?? "—"}
                        </span>
                      </span>
                      <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 sm:block dark:bg-zinc-800">
                        <span
                          className="block h-full rounded-full bg-oranye"
                          style={{ width: `${((row.overall_average ?? 0) / 5) * 100}%` }}
                        />
                      </span>
                      <LmsRatingLabel rating={row.overall_average} />
                    </AppButton>
                  </li>
                );
              })}
          </ul>
          {chapters.length > ranked.length && (
            <p className="mt-3 text-xs text-gray-400">
              {chapters.length - ranked.length} session(s) have no reviews yet.
            </p>
          )}
        </LmsInsightPanelOS>
      </div>

      <LmsInsightPanelOS
        title="What learners said"
        description="Open answers from the end-of-session survey."
        action={
          <div className="w-full sm:w-64">
            <AppSelect
              selectId="lms-insight-review-chapter"
              placeholder="All sessions"
              value={chapterId ?? ""}
              options={[
                { value: "", label: "All sessions" },
                ...ranked.map((row) => ({ value: row.chapter.id, label: row.chapter.name })),
              ]}
              onChange={(value) => setChapterId(value ? Number(value) : null)}
            />
          </div>
        }
      >
        <LmsInsightFilterChipsOS
          value={feedFilter}
          onChange={setFeedFilter}
          options={[
            { value: "with_comments", label: "With comments", count: scoped.filter(hasComment).length },
            { value: "low", label: "Low ratings", count: scoped.filter((r) => (r.overall_average ?? 5) < 3.5).length },
            { value: "all", label: "All", count: scoped.length },
          ]}
        />
        {feed.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Nothing here for this filter.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {feed.map((response) => (
              <article key={response.id} className="flex flex-col gap-3 rounded-xl border border-line-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <LmsLearnerCellOS
                    name={response.learner.full_name}
                    avatar={response.learner.avatar}
                    caption={`${response.chapter.name} · ${formatInsightDate(response.submitted_at)}`}
                  />
                  <LmsRatingLabel rating={response.overall_average} />
                </div>
                {openAnswers
                  .filter((answer) => !!response[answer.key]?.trim())
                  .map(({ key, label, icon: Icon, tone }) => (
                    <div key={key} className="flex gap-2.5">
                      <Icon size={14} className={`mt-0.5 shrink-0 ${tone}`} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                        <p className="whitespace-pre-line text-sm text-gray-700 dark:text-zinc-200">{response[key]}</p>
                      </div>
                    </div>
                  ))}
                {!hasComment(response) && (
                  <p className="text-xs text-gray-400">Ratings only, no written feedback.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </LmsInsightPanelOS>
    </div>
  );
}
