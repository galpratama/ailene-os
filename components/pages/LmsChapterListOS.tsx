"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import LmsChapterFormOS, {
  type LmsChapterEditing,
} from "@/components/forms/LmsChapterFormOS";
import LmsStatusLabel from "@/components/labels/LmsStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LmsChapterListOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LmsChapterEditing | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  const { data: levelData } = trpc.list.lms.levels.useQuery(
    { page: 1, page_size: 100 },
    { enabled: !!sessionToken }
  );
  const levelOptions: AppSelectOption[] = [
    { value: "", label: "All levels" },
    ...(levelData?.list.map((level) => ({
      value: level.id,
      label: `L${level.level_number} · ${level.name}`,
    })) ?? []),
  ];

  const { data, isLoading, isError } = trpc.list.lms.chapters.useQuery(
    { level_id: levelFilter ?? undefined, page: 1, page_size: 100 },
    { enabled: !!sessionToken }
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(chapter: LmsChapterEditing) {
    setEditing(chapter);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/lms/projects"
            className="text-xs font-semibold text-gray-500 hover:text-claude"
          >
            ← Corporate Training
          </Link>
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
            Chapters
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Session-by-session curriculum content, grouped under a level.
          </p>
        </div>
        <AppButton onClick={openCreate}>
          <Plus size={14} />
          New Chapter
        </AppButton>
      </div>

      <div className="max-w-70">
        <AppSelect
          selectId="lms-chapter-level-filter"
          placeholder="All levels"
          value={levelFilter}
          options={levelOptions}
          onChange={(value) => setLevelFilter(value as number | null)}
        />
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading chapters...
        </p>
      )}
      {isError && (
        <p className="py-8 text-center text-sm text-red-500">
          Failed to load chapters.
        </p>
      )}
      {data && !isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <table className="w-full min-w-190 text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-700">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Session Date</th>
                <th className="px-5 py-3">Content</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((chapter) => (
                <tr
                  key={chapter.id}
                  className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900 dark:text-zinc-100">
                      {chapter.name}
                    </p>
                    {chapter.description && (
                      <p className="mt-0.5 max-w-90 truncate text-xs text-gray-500">
                        {chapter.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    L{chapter.level_number} · {chapter.level_name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {new Date(chapter.session_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {chapter.quiz_count} quiz · {chapter.video_count} video ·{" "}
                    {chapter.material_count} material
                  </td>
                  <td className="px-5 py-3.5">
                    <LmsStatusLabel status={chapter.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <AppButton
                      size="iconSm"
                      variant="outline"
                      onClick={() =>
                        openEdit({
                          id: chapter.id,
                          level_id: chapter.level_id,
                          name: chapter.name,
                          description: chapter.description,
                          session_date: chapter.session_date,
                          status: chapter.status,
                        })
                      }
                    >
                      <Pencil size={13} />
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No chapters yet.
            </p>
          )}
        </div>
      )}

      <LmsChapterFormOS
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </div>
  );
}
