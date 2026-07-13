"use client";

import AppButton from "@/components/buttons/AppButton";
import CreateB2BClassSessionFormOS from "@/components/forms/CreateB2BClassSessionFormOS";
import SessionDifficultyLabel from "@/components/labels/SessionDifficultyLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function B2BClassDetailOS({
  sessionToken,
  classId,
}: {
  sessionToken: string;
  classId: number;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const { data, isLoading, isError } = trpc.read.b2bClass.class.useQuery(
    { id: classId },
    { enabled: !!sessionToken }
  );

  const openSession = trpc.update.b2bClass.sessionOpen.useMutation({
    onSuccess: () => utils.read.b2bClass.class.invalidate({ id: classId }),
  });
  const closeSession = trpc.update.b2bClass.sessionClose.useMutation({
    onSuccess: () => utils.read.b2bClass.class.invalidate({ id: classId }),
  });

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">
        Loading class...
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Class not found or you do not have access.
      </p>
    );
  }
  const theClass = data.class;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/classes"
            className="text-xs font-semibold text-gray-500 hover:text-claude"
          >
            ← B2B Classes
          </Link>
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
            {theClass.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {theClass.pipeline_name ?? "No linked B2B project"}
          </p>
        </div>
        <AppButton onClick={() => setSessionFormOpen(true)}>
          <Plus size={14} />
          Add Session
        </AppButton>
      </div>

      {theClass.description && (
        <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
          {theClass.description}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {theClass.sessions.map((session) => (
          <div
            key={session.id}
            className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/classes/${classId}/sessions/${session.id}`}
                  className="font-semibold text-gray-900 hover:text-claude dark:text-zinc-100"
                >
                  {session.name}
                </Link>
                <SessionDifficultyLabel difficulty={session.difficulty} />
                <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:border-zinc-700">
                  {session.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {session.status === "DRAFT" && (
                  <AppButton
                    size="sm"
                    variant="outline"
                    disabled={openSession.isPending}
                    onClick={() => openSession.mutate({ id: session.id })}
                  >
                    Open
                  </AppButton>
                )}
                {session.status === "OPEN" && (
                  <AppButton
                    size="sm"
                    variant="outline"
                    disabled={closeSession.isPending}
                    onClick={() => closeSession.mutate({ id: session.id })}
                  >
                    Close
                  </AppButton>
                )}
                <Link
                  href={`/classes/${classId}/sessions/${session.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-claude"
                >
                  Applications <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {session.applied_count}/{session.min_quorum} applied
              {session.quorum_met ? " · quorum met" : ""}
              {session.session_date
                ? ` · ${new Date(session.session_date).toLocaleDateString("en-GB")}`
                : ""}
            </p>
          </div>
        ))}
        {theClass.sessions.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-zinc-700">
            No sessions yet. Add one to start collecting applications.
          </p>
        )}
      </div>

      <CreateB2BClassSessionFormOS
        classId={classId}
        isOpen={sessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
      />
    </div>
  );
}
