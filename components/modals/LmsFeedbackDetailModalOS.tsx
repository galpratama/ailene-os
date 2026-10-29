"use client";

import type { LmsSurveyResponse } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import { Star, X } from "lucide-react";
import { useEffect } from "react";

const answers: { key: keyof LmsSurveyResponse; label: string }[] = [
  { key: "favorite_material", label: "Favorite part" },
  { key: "missing_topics", label: "Missing topics" },
  { key: "disliked_material", label: "Least liked" },
  { key: "improvement_suggestion", label: "Suggestion" },
];

function submittedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function LmsFeedbackDetailModalOS({
  response,
  onClose,
}: {
  response: LmsSurveyResponse | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!response) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [response]);

  if (!response) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-card-bg shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
            Feedback detail
          </h2>
          <AppButton
            type="button"
            variant="secondary"
            size="iconSm"
            aria-label="Close feedback detail"
            onClick={onClose}
          >
            <X size={15} />
          </AppButton>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <TaskAssigneeAvatarOS
              name={response.full_name}
              avatar={response.avatar}
              size="lg"
              colorKey={response.access_id}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {response.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {submittedDate(response.submitted_at)} WIB
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
              <Star size={12} className="fill-rating text-rating" />
              {response.average.toFixed(1)}
            </span>
          </div>
          <dl className="mt-5 flex flex-col gap-4">
            {answers.map(({ key, label }) => (
              <div key={key} className="rounded-xl bg-gray-50 p-3 dark:bg-zinc-800/50">
                <dt className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                  {label}
                </dt>
                <dd className="mt-1 whitespace-pre-line text-sm text-gray-800 dark:text-zinc-200">
                  {response[key] || "No response."}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
