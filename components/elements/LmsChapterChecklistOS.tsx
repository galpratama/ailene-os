"use client";

import type { LmsChapterChecklist } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { useId, useState } from "react";

const checklistItems = [
  { key: "material", label: "Material" },
  { key: "video_recording", label: "Video recording" },
  { key: "video_short", label: "Short video" },
  { key: "pre_test", label: "Pre-test" },
  { key: "post_test", label: "Post-test" },
  { key: "task", label: "Task" },
] as const;

export default function LmsChapterChecklistOS({ checklist }: { checklist: LmsChapterChecklist }) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const items = checklistItems
    .map((item) => ({ ...item, done: checklist?.[item.key] ?? false }))
    .sort((a, b) => Number(a.done) - Number(b.done));
  const completed = items.filter((item) => item.done).length;

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
        <CheckCircle2 size={14} className={completed === checklistItems.length ? "text-claude dark:text-lime-bright" : undefined} />
        {completed} of {checklistItems.length} checklist complete
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </AppButton>
      {isOpen && (
        <ul id={listId} aria-label="Chapter content checklist" className="mt-1 grid gap-2 rounded-xl border border-line bg-card-bg p-3 text-xs sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
              {item.done ? <CheckCircle2 size={15} className="shrink-0 text-claude dark:text-lime-bright" /> : <Circle size={15} className="shrink-0 text-gray-400 dark:text-zinc-500" />}
              <span>{item.label}</span>
              <span className="ml-auto text-gray-400 dark:text-zinc-500">{item.done ? "Done" : "To do"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
