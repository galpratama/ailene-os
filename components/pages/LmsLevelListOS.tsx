"use client";

import AppButton from "@/components/buttons/AppButton";
import LmsLevelFormOS, {
  type LmsLevelEditing,
} from "@/components/forms/LmsLevelFormOS";
import LmsStatusLabel from "@/components/labels/LmsStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LmsLevelListOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LmsLevelEditing | null>(null);

  const { data, isLoading, isError } = trpc.list.lms.levels.useQuery(
    { page: 1, page_size: 100 },
    { enabled: !!sessionToken }
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(level: LmsLevelEditing) {
    setEditing(level);
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
            Levels
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            The curriculum's overall progression, from Foundation onward.
          </p>
        </div>
        <AppButton onClick={openCreate}>
          <Plus size={14} />
          New Level
        </AppButton>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading levels...
        </p>
      )}
      {isError && (
        <p className="py-8 text-center text-sm text-red-500">
          Failed to load levels.
        </p>
      )}
      {data && !isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-700">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Min XP</th>
                <th className="px-5 py-3">Chapters</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((level) => (
                <tr
                  key={level.id}
                  className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                    {level.level_number}
                  </td>
                  <td className="px-5 py-3.5 text-gray-900 dark:text-zinc-100">
                    {level.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {level.min_xp}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {level.chapter_count}
                  </td>
                  <td className="px-5 py-3.5">
                    <LmsStatusLabel status={level.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <AppButton
                      size="iconSm"
                      variant="outline"
                      onClick={() =>
                        openEdit({
                          id: level.id,
                          level_number: level.level_number,
                          name: level.name,
                          icon: level.icon,
                          min_xp: level.min_xp,
                          status: level.status,
                          project_id: level.project_id,
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
              No levels yet.
            </p>
          )}
        </div>
      )}

      <LmsLevelFormOS
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </div>
  );
}
