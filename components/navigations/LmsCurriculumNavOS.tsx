"use client";

import type { LmsChapter, LmsContentKind, LmsCurriculum } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import { lmsContentKinds } from "@/lib/lms-curriculum";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCheck,
  FileQuestion,
  Film,
  Search,
} from "lucide-react";

export type LmsCurriculumView = "overview" | LmsContentKind;
export const lmsContentIcons = {
  pre_test: FileQuestion,
  post_test: ClipboardCheck,
  quiz: FileQuestion,
  material: BookOpen,
  video: Film,
};

export default function LmsCurriculumNavOS({
  chapters,
  levels,
  selectedId,
  view,
  onSelect,
  keyword,
  onSearch,
}: {
  chapters: LmsChapter[];
  levels: LmsCurriculum["levels"];
  selectedId?: number;
  view: LmsCurriculumView;
  onSelect: (chapterId: number, view: LmsCurriculumView) => void;
  keyword: string;
  onSearch: (value: string) => void;
}) {
  const visible = chapters.filter((chapter) =>
    chapter.name.toLowerCase().includes(keyword.trim().toLowerCase()),
  );
  return (
    <nav
      aria-label="Session content"
      className="flex flex-col border-b border-line bg-gray-50/50 dark:bg-zinc-900/40 lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0"
    >
      <div className="border-b border-line-soft p-4">
        <AppInput
          inputId="lms-session-search"
          aria-label="Search sessions"
          icon={<Search size={14} />}
          placeholder="Search sessions..."
          value={keyword}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className="max-h-80 overflow-y-auto px-2 py-3 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-18rem)]">
        {levels.map((level) => {
          const entries = visible.filter(
            (chapter) => chapter.level_id === level.id,
          );
          if (!entries.length) return null;
          return (
            <div key={level.id} className="mb-4 last:mb-0">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {level.name}
              </p>
              {entries.map((chapter) => {
                const active = selectedId === chapter.id;
                return (
                  <div key={chapter.id} className="mb-1">
                    <AppButton
                      variant="bare"
                      size="row"
                      className={`gap-2 rounded-lg px-3 py-2.5 ${active ? "bg-claude/10 text-claude" : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                      aria-expanded={active}
                      onClick={() => onSelect(chapter.id, "overview")}
                    >
                      {active ? (
                        <ChevronDown size={14} className="shrink-0" />
                      ) : (
                        <ChevronRight size={14} className="shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {chapter.name}
                      </span>
                      <span className="text-xs tabular-nums opacity-60">
                        {chapter.contents.length}/5
                      </span>
                    </AppButton>
                    {active && (
                      <div className="ml-5 mt-1 border-l border-line-soft pl-2">
                        <AppButton
                          variant="bare"
                          size="row"
                          className={`gap-2 rounded-lg px-3 py-2 text-xs ${view === "overview" ? "bg-gray-100 font-semibold text-gray-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
                          aria-current={
                            view === "overview" ? "page" : undefined
                          }
                          onClick={() => onSelect(chapter.id, "overview")}
                        >
                          <CalendarDays size={14} />
                          Overview & schedule
                        </AppButton>
                        {lmsContentKinds.map(({ kind, label }) => {
                          const Icon = lmsContentIcons[kind];
                          const exists = chapter.contents.some(
                            (content) => content.kind === kind,
                          );
                          return (
                            <AppButton
                              key={kind}
                              variant="bare"
                              size="row"
                              className={`gap-2 rounded-lg px-3 py-2 text-xs ${view === kind ? "bg-gray-100 font-semibold text-gray-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
                              aria-current={view === kind ? "page" : undefined}
                              onClick={() => onSelect(chapter.id, kind)}
                            >
                              <Icon size={14} />
                              <span className="flex-1">{label}</span>
                              {exists ? (
                                <Check
                                  size={12}
                                  className="text-claude"
                                  aria-label="Created"
                                />
                              ) : (
                                <Circle
                                  size={8}
                                  className="text-gray-300 dark:text-zinc-600"
                                  aria-label="Not created"
                                />
                              )}
                            </AppButton>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {!visible.length && (
          <p className="px-3 py-6 text-center text-xs text-gray-500 dark:text-zinc-400">
            No sessions found.
          </p>
        )}
      </div>
    </nav>
  );
}
