"use client";

import type { LmsSurveyResponse } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import AppSwitch from "@/components/fields/AppSwitch";
import LmsFeedbackDetailModalOS from "@/components/modals/LmsFeedbackDetailModalOS";
import { MessageSquareText, Star } from "lucide-react";
import { useState } from "react";

const writtenAnswerKeys: (keyof LmsSurveyResponse)[] = [
  "favorite_material",
  "missing_topics",
  "disliked_material",
  "improvement_suggestion",
];

function submittedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function LmsChapterFeedbackOS({
  responses,
  lockState,
  canUpdateLock,
  isUpdatingLock,
  onLockChange,
}: {
  responses: LmsSurveyResponse[];
  lockState: "open" | "locked" | "mixed";
  canUpdateLock: boolean;
  isUpdatingLock: boolean;
  onLockChange: (locked: boolean) => void;
}) {
  const [selected, setSelected] = useState<LmsSurveyResponse | null>(null);
  const written = responses.filter((response) =>
    writtenAnswerKeys.some((key) => response[key]),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-5">
        <h2 className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-zinc-100">
          Written feedback
          <InfoTooltipOS
            label="Written feedback"
            explanation={`${written.length} of ${responses.length} survey responses include comments, newest first. The lock applies to every session audience in this chapter.`}
          />
        </h2>
        <AppSwitch
          inputId="lms-chapter-feedback-lock"
          label={
            isUpdatingLock
              ? "Updating..."
              : lockState === "mixed"
                ? "Mixed feedback lock"
                : "Locked feedback"
          }
          checked={lockState === "locked"}
          disabled={!canUpdateLock || isUpdatingLock}
          compact
          onChange={onLockChange}
        />
      </div>
      {written.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-5">
          <MessageSquareText size={22} className="mx-auto text-gray-400" />
          <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
            No written feedback yet.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
          {written.map((response) => (
            <li
              key={response.access_id}
              className="flex flex-col rounded-xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-2.5">
                <TaskAssigneeAvatarOS
                  name={response.full_name}
                  avatar={response.avatar}
                  size="base"
                  colorKey={response.access_id}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-900 dark:text-zinc-100">
                    {response.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {submittedDate(response.submitted_at)} WIB
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-card-bg px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
                  <Star size={11} className="fill-rating text-rating" />
                  {response.average.toFixed(1)}
                </span>
              </div>
              <div className="mt-3 flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                  Favorite part
                </p>
                <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs text-gray-800 dark:text-zinc-200">
                  {response.favorite_material || "No favorite part response."}
                </p>
              </div>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 self-start"
                onClick={() => setSelected(response)}
              >
                View full feedback
              </AppButton>
            </li>
          ))}
        </ul>
      )}
      <LmsFeedbackDetailModalOS
        response={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
