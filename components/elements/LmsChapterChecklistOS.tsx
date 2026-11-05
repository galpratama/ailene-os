"use client";

import type { LmsChapterChecklist } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import { labelVariantStyle } from "@/components/labels/Label";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Hourglass,
  ListChecks,
} from "lucide-react";
import { useId, useState } from "react";

const checklistItems = [
  { key: "material", label: "Upload Materi" },
  { key: "video_recording", label: "Upload Video Recording" },
  { key: "video_short", label: "Upload Video Short" },
  { key: "pre_test", label: "Buat Pre Test" },
  { key: "post_test", label: "Buat Post Test" },
  { key: "task", label: "Buat Task" },
] as const;

export default function LmsChapterChecklistOS({
  checklist,
}: {
  checklist: LmsChapterChecklist;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const items = checklistItems
    .map((item) => ({ ...item, done: checklist?.[item.key] ?? false }))
    .sort((a, b) => Number(a.done) - Number(b.done));
  const completed = items.filter((item) => item.done).length;
  const isComplete = completed === checklistItems.length;
  const hasProgress = completed > 0;
  const progressLabelVariant = isComplete
    ? "hijau"
    : hasProgress
      ? "kuning"
      : "gray";
  const labelStyle = labelVariantStyle(progressLabelVariant);

  return (
    <div className="pointer-events-auto relative mt-2">
      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        className="-ml-3"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          className="box-border flex h-4.5 w-4.5 min-h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full border"
          style={{
            backgroundColor: labelStyle.color,
            borderColor: labelStyle.color,
            color: labelStyle.backgroundColor,
          }}
          aria-hidden="true"
        >
          {isComplete ? (
            <Check size={10} strokeWidth={2} />
          ) : hasProgress ? (
            <Hourglass size={10} strokeWidth={2} />
          ) : (
            <ListChecks size={10} />
          )}
        </span>
        {completed} of {checklistItems.length} checklist complete
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </AppButton>
      {isOpen && (
        <ul
          id={listId}
          aria-label="Chapter content checklist"
          className="mt-1 grid gap-2 rounded-xl border border-line bg-card-bg p-3 text-xs sm:grid-cols-2"
        >
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-2 text-gray-600 dark:text-zinc-300"
            >
              {item.done ? (
                <CheckCircle2
                  size={15}
                  className="shrink-0 fill-claude text-white"
                />
              ) : (
                <Circle
                  size={15}
                  className="shrink-0 text-gray-400 dark:text-zinc-500"
                />
              )}
              <span className={item.done ? "line-through" : undefined}>
                {item.label}
              </span>
              <span className="ml-auto text-gray-400 dark:text-zinc-500">
                {item.done ? "Done" : "To do"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
