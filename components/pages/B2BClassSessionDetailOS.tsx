"use client";

import AppButton from "@/components/buttons/AppButton";
import SelectTrainerApplicationFormOS from "@/components/forms/SelectTrainerApplicationFormOS";
import SessionDifficultyLabel from "@/components/labels/SessionDifficultyLabel";
import TrainerApplicationStatusLabel from "@/components/labels/TrainerApplicationStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function B2BClassSessionDetailOS({
  sessionToken,
  classId,
  sessionId,
}: {
  sessionToken: string;
  classId: number;
  sessionId: number;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const [selectingApplicationId, setSelectingApplicationId] = useState<
    number | null
  >(null);

  const { data: sessionData } = trpc.read.b2bClass.session.useQuery(
    { id: sessionId },
    { enabled: !!sessionToken }
  );
  const { data: applicationsData, isLoading } =
    trpc.list.b2bClass.applications.useQuery(
      { session_id: sessionId, page: 1, page_size: 100 },
      { enabled: !!sessionToken }
    );

  const updateStatus = trpc.update.b2bClass.applicationStatus.useMutation({
    onSuccess: () =>
      utils.list.b2bClass.applications.invalidate({ session_id: sessionId }),
  });

  const session = sessionData?.session;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <Link
          href={`/classes/${classId}`}
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          ← {session?.class_name ?? "Class"}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
            {session?.name ?? "Session"}
          </h2>
          {session && (
            <SessionDifficultyLabel difficulty={session.difficulty} />
          )}
        </div>
        {session && (
          <p className="mt-1 text-sm text-gray-500">
            {session.applied_count}/{session.min_quorum} applied
            {session.quorum_met ? " · quorum met" : ""} · status{" "}
            {session.status}
          </p>
        )}
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading applications...
        </p>
      )}

      {applicationsData && (
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <table className="w-full min-w-190 text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-700">
                <th className="px-5 py-3">Trainer</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">AI Exp.</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicationsData.list.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900 dark:text-zinc-100">
                      {application.trainer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {application.trainer_email}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {application.trainer_level.toLowerCase()}
                    {application.trainer_level_override
                      ? ` (${application.trainer_level_override.toLowerCase()} override)`
                      : ""}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {application.trainer_ai_experience_years} yrs
                  </td>
                  <td className="px-5 py-3.5">
                    <TrainerApplicationStatusLabel status={application.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-2">
                      {(application.status === "APPLIED" ||
                        application.status === "SHORTLISTED") && (
                        <>
                          {application.status === "APPLIED" && (
                            <AppButton
                              size="sm"
                              variant="outline"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                updateStatus.mutate({
                                  id: application.id,
                                  status: "SHORTLISTED",
                                })
                              }
                            >
                              Shortlist
                            </AppButton>
                          )}
                          <AppButton
                            size="sm"
                            variant="outline"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({
                                id: application.id,
                                status: "REJECTED",
                              })
                            }
                          >
                            Reject
                          </AppButton>
                          <AppButton
                            size="sm"
                            onClick={() =>
                              setSelectingApplicationId(application.id)
                            }
                          >
                            Select & Assign
                          </AppButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {applicationsData.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No applications yet.
            </p>
          )}
        </div>
      )}

      <SelectTrainerApplicationFormOS
        applicationId={selectingApplicationId}
        sessionId={sessionId}
        isOpen={selectingApplicationId !== null}
        onClose={() => setSelectingApplicationId(null)}
      />
    </div>
  );
}
