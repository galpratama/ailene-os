"use client";

import CreateLmsProjectFormOS from "@/components/forms/CreateLmsProjectFormOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { setSessionToken, trpc } from "@/trpc/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LmsProjectListOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError } = trpc.list.lms.projects.useQuery(
    { page: 1, page_size: 50 },
    { enabled: !!sessionToken }
  );

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="LMS Projects"
        description="Client training programs, each scoping its own groups and members."
        action={{
          label: "New Project",
          icon: Plus,
          onClick: () => setIsCreateOpen(true),
        }}
      />

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading projects...
        </p>
      )}
      {isError && (
        <p className="py-8 text-center text-sm text-red-500">
          Failed to load projects.
        </p>
      )}
      {data && !isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.list.map((entry) => (
            <Link
              key={entry.id}
              href={`/lms/projects/${entry.id}`}
              className="rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                {entry.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {entry.company_name ?? "No linked company"}
              </p>
              <p className="mt-4 text-xs font-semibold text-gray-500">
                {entry.group_count} group{entry.group_count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
          {data.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400 sm:col-span-2 xl:col-span-3">
              No projects yet. Create one to start organizing groups and
              members.
            </p>
          )}
        </div>
      )}

      <CreateLmsProjectFormOS
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
