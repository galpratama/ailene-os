"use client";

import AppButton from "@/components/buttons/AppButton";
import CreateLmsProjectFormOS from "@/components/forms/CreateLmsProjectFormOS";
import { useHeaderAction } from "@/contexts/HeaderActionContext";
import { setSessionToken, trpc } from "@/trpc/client";
import { BookOpen, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LmsProjectListOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useHeaderAction({
    label: "New Project",
    icon: Plus,
    onClick: () => setIsCreateOpen(true),
  });

  const { data, isLoading, isError } = trpc.list.lms.projects.useQuery(
    { page: 1, page_size: 50 },
    { enabled: !!sessionToken }
  );

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
            LMS Projects
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Client training programs, each scoping its own groups and members.
          </p>
        </div>
        <div className="flex gap-2">
          <AppButton variant="outline" onClick={() => router.push("/lms/levels")}>
            <Layers size={14} />
            Manage Levels
          </AppButton>
          <AppButton
            variant="outline"
            onClick={() => router.push("/lms/chapters")}
          >
            <BookOpen size={14} />
            Manage Chapters
          </AppButton>
        </div>
      </div>

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
