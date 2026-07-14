"use client";

import { setSessionToken, trpc } from "@/trpc/client";
import Link from "next/link";
import { useEffect } from "react";

export default function LmsProjectDetailOS({
  sessionToken,
  projectId,
}: {
  sessionToken: string;
  projectId: number;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } = trpc.read.lms.project.useQuery(
    { id: projectId },
    { enabled: !!sessionToken }
  );

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">
        Loading project...
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Project not found or you do not have access.
      </p>
    );
  }
  const project = data.project;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <Link
          href="/lms/projects"
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          ← LMS Projects
        </Link>
        <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          {project.name}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {project.company_name ?? "No linked company"}
        </p>
      </div>

      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">Groups</h3>
        <div className="mt-4 divide-y divide-gray-200 dark:divide-zinc-800">
          {project.groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-zinc-100">
                  {group.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Champion: {group.champion_name}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {group.member_count} member{group.member_count === 1 ? "" : "s"}
              </span>
            </div>
          ))}
          {project.groups.length === 0 && (
            <p className="py-5 text-sm text-gray-400">No groups yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
