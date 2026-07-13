"use client";

import CreateB2BClassFormOS from "@/components/forms/CreateB2BClassFormOS";
import { useHeaderAction } from "@/contexts/HeaderActionContext";
import { setSessionToken, trpc } from "@/trpc/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function B2BClassListOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useHeaderAction({
    label: "New Class",
    icon: Plus,
    onClick: () => setIsCreateOpen(true),
  });

  const { data, isLoading, isError } = trpc.list.b2bClass.classes.useQuery(
    { page: 1, page_size: 50 },
    { enabled: !!sessionToken }
  );

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          B2B Classes
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
          Open classes, schedule sessions, and manage trainer applications.
        </p>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading classes...
        </p>
      )}
      {isError && (
        <p className="py-8 text-center text-sm text-red-500">
          Failed to load classes.
        </p>
      )}
      {data && !isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.list.map((entry) => (
            <Link
              key={entry.id}
              href={`/classes/${entry.id}`}
              className="rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                {entry.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {entry.pipeline_name ?? "No linked B2B project"}
              </p>
              {entry.description && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-zinc-300">
                  {entry.description}
                </p>
              )}
              <p className="mt-4 text-xs font-semibold text-gray-500">
                {entry.session_count} session
                {entry.session_count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
          {data.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400 sm:col-span-2 xl:col-span-3">
              No classes yet. Create one to start scheduling sessions.
            </p>
          )}
        </div>
      )}

      <CreateB2BClassFormOS
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
