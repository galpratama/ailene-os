"use client";

import CreateLmsProjectFormOS from "@/components/forms/CreateLmsProjectFormOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { setSessionToken, trpc } from "@/trpc/client";
import { Building2, Calendar, Plus, Users } from "lucide-react";
import Image from "next/image";
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
        title="Corporate Training"
        description="Client training programs delivered by the Ailene trainer pool."
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
              className="flex gap-4 rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
            >
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                {entry.company_image_url ? (
                  <Image
                    src={entry.company_image_url}
                    alt={entry.company_name ?? entry.name}
                    width={48}
                    height={48}
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 size={20} className="text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-gray-900 dark:text-zinc-100">
                  {entry.name}
                </h3>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {entry.company_name ?? "No linked company"}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Calendar size={13} />
                  {entry.session_count}{" "}
                  {entry.session_count === 1 ? "session" : "sessions"}
                </p>
                {entry.attendee_pax != null && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <Users size={13} />
                    {entry.attendee_pax} attendees
                  </p>
                )}
              </div>
            </Link>
          ))}
          {data.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400 sm:col-span-2 xl:col-span-3">
              No projects yet. Create one to get started.
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
