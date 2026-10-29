import type { LmsChapterAnalytics, LmsSurveyRatingKey } from "@/apis/lms";
import type { ReactNode } from "react";
import { ArrowRight, Star } from "lucide-react";

const trainerKeys: LmsSurveyRatingKey[] = [
  "trainer_clarity",
  "trainer_mastery",
  "trainer_responsiveness",
  "trainer_engagement",
];
const materialKeys: LmsSurveyRatingKey[] = [
  "material_relevance",
  "material_flow",
  "material_depth",
];

function percent(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function average(values: (number | null)[]) {
  const known = values.filter((value): value is number => value !== null);
  return known.length
    ? known.reduce((sum, value) => sum + value, 0) / known.length
    : null;
}

function Card({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-line bg-card-bg p-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
        {caption}
      </p>
      {children}
    </section>
  );
}

// A labelled thin bar with its value at the end, the "training impact" row style.
function Meter({
  label,
  value,
  max,
  display,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div title={`${label}: ${display}`}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-gray-700 dark:text-zinc-300">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
          {display}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-claude dark:bg-lime-bright"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function LmsChapterStatsOS({
  analytics,
}: {
  analytics: LmsChapterAnalytics;
}) {
  const {
    member_count: members,
    pre_test: pre,
    post_test: post,
    survey,
  } = analytics;
  const uplift =
    pre.average_score !== null && post.average_score !== null
      ? post.average_score - pre.average_score
      : null;
  const steps = [
    { label: "Pre-test", done: pre.submitted, show: pre.test_id !== null },
    {
      label: "Video",
      done: analytics.video.completed,
      show: analytics.video.exists,
    },
    {
      label: "Material",
      done: analytics.material.completed,
      show: analytics.material.exists,
    },
    { label: "Post-test", done: post.submitted, show: post.test_id !== null },
  ].filter((step) => step.show);
  const trainer = average(trainerKeys.map((key) => survey.ratings[key]));
  const material = average(materialKeys.map((key) => survey.ratings[key]));

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card
        title="Score improvement"
        caption="Average test score before and after the session."
      >
        <div className="mt-6 flex items-end gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Pre-test</p>
            <p className="font-heading text-4xl tabular-nums text-gray-400 dark:text-zinc-500">
              {pre.average_score?.toFixed(1) ?? "—"}
            </p>
          </div>
          <ArrowRight
            size={20}
            className="mb-2.5 shrink-0 text-gray-300 dark:text-zinc-600"
          />
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Post-test
            </p>
            <p className="font-heading text-4xl tabular-nums text-gray-900 dark:text-zinc-100">
              {post.average_score?.toFixed(1) ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-auto pt-6">
          {uplift === null ? (
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              The improvement shows once both tests have scored submissions.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                  uplift >= 0
                    ? "bg-lime-bright text-forest-deep"
                    : "bg-merah-t text-merah"
                }`}
              >
                {uplift >= 0 ? "+" : ""}
                {uplift.toFixed(1)} pts
              </span>
              from {pre.submitted} pre-tests and {post.submitted} post-tests
            </p>
          )}
        </div>
      </Card>

      <Card
        title="Completion"
        caption={`Share of the ${members} scheduled participants who finished each step.`}
      >
        {steps.length ? (
          <div className="mt-5 flex flex-col gap-4">
            {steps.map((step) => (
              <Meter
                key={step.label}
                label={step.label}
                value={step.done}
                max={members}
                display={`${percent(step.done, members)}%`}
              />
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-gray-500 dark:text-zinc-400">
            Add content to start tracking completion.
          </p>
        )}
      </Card>

      <Card
        title="Feedback"
        caption={`${survey.count} responses · ${percent(survey.count, members)}% response rate`}
      >
        <p className="mt-5 flex items-center gap-2">
          <Star size={26} className="fill-oranye text-oranye" />
          <span className="font-heading text-4xl tabular-nums text-gray-900 dark:text-zinc-100">
            {survey.average?.toFixed(1) ?? "—"}
          </span>
          <span className="text-sm text-gray-400 dark:text-zinc-500">/ 5</span>
        </p>
        {survey.count > 0 ? (
          <div className="mt-5 flex flex-col gap-4">
            <Meter
              label="Trainer"
              value={trainer ?? 0}
              max={5}
              display={trainer?.toFixed(1) ?? "—"}
            />
            <Meter
              label="Material"
              value={material ?? 0}
              max={5}
              display={material?.toFixed(1) ?? "—"}
            />
            <Meter
              label="Learning value"
              value={survey.ratings.learning_value ?? 0}
              max={5}
              display={survey.ratings.learning_value?.toFixed(1) ?? "—"}
            />
          </div>
        ) : (
          <p className="mt-5 text-sm text-gray-500 dark:text-zinc-400">
            No survey responses yet.
          </p>
        )}
      </Card>
    </div>
  );
}
