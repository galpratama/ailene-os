"use client";

import type { LmsInsightsFilter } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsInsightKpiCardOS from "@/components/items/LmsInsightKpiCardOS";
import LmsInsightGuidedOS from "@/components/static-sections/LmsInsightGuidedOS";
import LmsInsightPreAssessmentOS from "@/components/static-sections/LmsInsightPreAssessmentOS";
import LmsInsightQuizzesOS from "@/components/static-sections/LmsInsightQuizzesOS";
import LmsInsightReviewsOS from "@/components/static-sections/LmsInsightReviewsOS";
import LmsInsightTestsOS from "@/components/static-sections/LmsInsightTestsOS";
import { useLmsInsight } from "@/hooks/useLmsInsight";
import { getLmsInsightsOverview } from "@/lib/actions";
import {
  formatScore,
  percentOf,
  type LmsInsightSection,
} from "@/lib/lms-insights";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  FlaskConical,
  Loader2,
  MessageSquareHeart,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
  Workflow,
} from "lucide-react";

export default function LmsInsightsOS({
  projectId,
  groupId,
  groupName,
  sessionToken,
  section,
  onSectionChange,
}: {
  projectId: string;
  groupId: number | null;
  groupName: string | null;
  sessionToken: string;
  section: LmsInsightSection;
  onSectionChange: (section: LmsInsightSection) => void;
}) {
  const client = useQueryClient();
  const filter: LmsInsightsFilter = { project_id: projectId, group_id: groupId };
  const overview = useLmsInsight("overview", filter, sessionToken, getLmsInsightsOverview);
  const data = overview.data;
  const pa = data?.pre_assessment ?? null;
  const guided = data?.guided_use_cases;
  const reviews = data?.session_reviews;
  const tests = data?.chapter_tests;
  const quizzes = data?.quizzes;
  const loading = overview.isPending ? "…" : "—";

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-card-bg px-5 py-4">
        <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-lime-bright/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-40 size-40 rounded-full bg-claude/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-claude text-white">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-gray-900 dark:text-zinc-100">
                Learning pulse
              </p>
              <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
                <Users size={13} />
                {data ? `${data.learner_count} learners` : "Loading learners"}
                {groupName ? ` in ${groupName}` : " across all groups"}
              </p>
            </div>
          </div>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={overview.isFetching}
            onClick={() => client.invalidateQueries({ queryKey: ["lms-insights"] })}
          >
            {overview.isFetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Refresh
          </AppButton>
        </div>
        {overview.isError && (
          <p className="relative mt-3 text-sm text-merah">{overview.error.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <LmsInsightKpiCardOS
          title="Pre-assessment"
          icon={ClipboardCheck}
          tone="ungu"
          value={pa ? `${percentOf(pa.submitted, pa.total)}%` : loading}
          caption={pa ? `completed · avg score ${formatScore(pa.average_score)}` : "completion"}
          progress={pa ? { value: pa.meets_target, total: pa.total, label: `${pa.meets_target} of ${pa.total} meet target` } : undefined}
          progressVariant="hijau"
          active={section === "pre_assessment"}
          onClick={() => onSectionChange("pre_assessment")}
        />
        <LmsInsightKpiCardOS
          title="Guided use cases"
          icon={Workflow}
          tone="toska"
          value={guided ? String(guided.total) : loading}
          caption={guided ? `${guided.awaiting_review} awaiting review` : "use cases"}
          progress={guided ? { value: guided.accepted, total: guided.total, label: `${guided.accepted} accepted` } : undefined}
          active={section === "guided"}
          onClick={() => onSectionChange("guided")}
        />
        <LmsInsightKpiCardOS
          title="Session reviews"
          icon={MessageSquareHeart}
          tone="oranye"
          value={reviews ? (reviews.overall_average === null ? "—" : `${reviews.overall_average.toFixed(1)} ★`) : loading}
          caption={reviews ? `${reviews.responses} responses` : "average rating"}
          progress={reviews?.overall_average != null ? { value: reviews.overall_average, total: 5, label: "out of 5" } : undefined}
          progressVariant="kuning"
          active={section === "reviews"}
          onClick={() => onSectionChange("reviews")}
        />
        <LmsInsightKpiCardOS
          title="Pre & post test"
          icon={FlaskConical}
          tone="biru"
          value={tests ? (tests.average_uplift === null ? "—" : `${tests.average_uplift >= 0 ? "+" : ""}${formatScore(tests.average_uplift)} pts`) : loading}
          caption={tests ? `${formatScore(tests.pre_average)} → ${formatScore(tests.post_average)} average` : "learning gain"}
          progress={tests ? { value: tests.improved_count, total: tests.paired_count, label: `${tests.improved_count} of ${tests.paired_count} improved` } : undefined}
          progressVariant="hijau"
          active={section === "tests"}
          onClick={() => onSectionChange("tests")}
        />
        <LmsInsightKpiCardOS
          title="Quizzes"
          icon={Trophy}
          tone="claude"
          value={quizzes ? formatScore(quizzes.average_best_score) : loading}
          caption={quizzes ? `avg best · ${quizzes.submissions} submissions` : "average best score"}
          progress={quizzes && data ? { value: quizzes.participants, total: data.learner_count, label: `${quizzes.participants} of ${data.learner_count} took a quiz` } : undefined}
          active={section === "quizzes"}
          onClick={() => onSectionChange("quizzes")}
        />
      </div>

      {/* Keyed by group so every section remounts with fresh local filters. */}
      <div key={groupId ?? "all"}>
        {section === "pre_assessment" && <LmsInsightPreAssessmentOS filter={filter} sessionToken={sessionToken} />}
        {section === "guided" && <LmsInsightGuidedOS filter={filter} sessionToken={sessionToken} />}
        {section === "reviews" && <LmsInsightReviewsOS filter={filter} sessionToken={sessionToken} />}
        {section === "tests" && <LmsInsightTestsOS filter={filter} sessionToken={sessionToken} />}
        {section === "quizzes" && <LmsInsightQuizzesOS filter={filter} sessionToken={sessionToken} />}
      </div>
    </div>
  );
}
