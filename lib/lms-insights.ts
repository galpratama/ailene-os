import type { LabelVariant } from "@/components/labels/Label";
import type {
  LmsGuidedReviewStatus,
  LmsGuidedStatus,
  LmsSurveyRatings,
} from "@/apis/lms";

export type LmsInsightSection =
  | "pre_assessment"
  | "guided"
  | "reviews"
  | "tests"
  | "quizzes";

export function isLmsInsightSection(value: string | undefined): value is LmsInsightSection {
  return ["pre_assessment", "guided", "reviews", "tests", "quizzes"].includes(value ?? "");
}

// One scale for every 0–100 score, so a quiz and a post-test read the same at a glance.
export function scoreVariant(score: number | null): LabelVariant {
  if (score === null) return "gray";
  if (score >= 85) return "hijau";
  if (score >= 70) return "toska";
  if (score >= 50) return "kuning";
  return "merah";
}

export function scoreColor(score: number | null) {
  const variant = scoreVariant(score);
  return variant === "gray" ? "var(--sb-text)" : `var(--${variant})`;
}

export function ratingVariant(rating: number | null): LabelVariant {
  if (rating === null) return "gray";
  if (rating >= 4.5) return "hijau";
  if (rating >= 4) return "toska";
  if (rating >= 3) return "kuning";
  return "merah";
}

export function formatScore(value: number | null, suffix = "") {
  return value === null ? "—" : `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

export function percentOf(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function formatInsightDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export const guidedStatusLabels: Record<LmsGuidedStatus, string> = {
  intake: "Intake",
  steps_ready: "Steps ready",
  in_progress: "Working",
  ready_to_submit: "Ready to submit",
  submitted: "Submitted",
};

export const guidedReviewStyles: Record<
  LmsGuidedReviewStatus,
  { label: string; variant: LabelVariant }
> = {
  in_progress: { label: "In progress", variant: "biru" },
  awaiting_review: { label: "Awaiting review", variant: "kuning" },
  needs_revision: { label: "Needs revision", variant: "oranye" },
  accepted: { label: "Accepted", variant: "hijau" },
};

export const surveyRatingLabels: { key: keyof LmsSurveyRatings; label: string; group: "trainer" | "material" | "value" }[] = [
  { key: "trainer_clarity", label: "Clarity", group: "trainer" },
  { key: "trainer_mastery", label: "Mastery", group: "trainer" },
  { key: "trainer_responsiveness", label: "Responsiveness", group: "trainer" },
  { key: "trainer_engagement", label: "Engagement", group: "trainer" },
  { key: "material_relevance", label: "Relevance", group: "material" },
  { key: "material_flow", label: "Flow", group: "material" },
  { key: "material_depth", label: "Depth", group: "material" },
  { key: "learning_value", label: "Learning value", group: "value" },
];

export function matchesLearner(
  learner: { full_name: string; email?: string },
  query: string,
) {
  const q = query.trim().toLowerCase();
  return (
    !q ||
    learner.full_name.toLowerCase().includes(q) ||
    (learner.email ?? "").toLowerCase().includes(q)
  );
}
