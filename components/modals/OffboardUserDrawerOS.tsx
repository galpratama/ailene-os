"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import UserStatusLabel from "@/components/labels/UserStatusLabel";
import SheetOS from "@/components/modals/SheetOS";
import {
  getUserDetails,
  reassignOwnership,
  updateUserStatus,
} from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { useUserList } from "@/hooks/useUserList";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userSelectOption } from "@/lib/user-select-option";
import { Briefcase, ClipboardList, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { showErrorToast } from "@/lib/toast";

interface OffboardUserDrawerOSProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Shows a departing user's active work and lets an admin/manager reassign it before deactivating.
export default function OffboardUserDrawerOS({
  userId,
  isOpen,
  onClose,
}: OffboardUserDrawerOSProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newOwnerId, setNewOwnerId] = useState("");
  const [reason, setReason] = useState("");
  const details = useQuery({
    queryKey: ["users", "details", userId],
    queryFn: async () => requireApiData(await getUserDetails(userId!)),
    enabled: isOpen && !!userId,
  });
  const user = details.data;
  const ownership = user?.ownership;
  const candidates = useUserList(isOpen && !!userId);

  const hasActiveWork =
    !!ownership && ownership.pipelines_owned + ownership.actions_assigned > 0;

  const ownerOptions: AppSelectOption[] = candidates
    .filter((u) => u.id !== userId)
    .map(userSelectOption);

  function handleClose() {
    setNewOwnerId("");
    setReason("");
    onClose();
  }

  const reassignMutation = useMutation({
    mutationFn: async (id: string) => requireApiData(await reassignOwnership({
      from_user_id: id,
      to_user_id: newOwnerId,
      reason: reason.trim(),
    })),
    onSuccess: async () => {
      setNewOwnerId("");
      setReason("");
      await Promise.all(["users", "tasks", "sales"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      ));
      router.refresh();
    },
    onError: (error) => showErrorToast(error, "Failed to reassign ownership."),
  });
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => requireApiSuccess(await updateUserStatus({
      id,
      status: "deactivated",
      reason: reason.trim() || undefined,
    })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      handleClose();
    },
    onError: (error) => showErrorToast(error, "Failed to deactivate user."),
  });
  const isReassigning = reassignMutation.isPending;
  const isDeactivating = deactivateMutation.isPending;

  function handleReassign(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!newOwnerId) return showErrorToast("Pick a replacement owner.");
    if (!reason.trim()) return showErrorToast("A reason is required.");

    reassignMutation.mutate(user.id);
  }

  function handleDeactivate() {
    if (!user) return;
    deactivateMutation.mutate(user.id);
  }

  const isReady = !!user && !!ownership;

  return (
    <SheetOS
      title="Offboard user"
      description={user ? `${user.full_name} · ${user.email}` : undefined}
      isOpen={isOpen}
      onClose={handleClose}
    >
      {details.isError ? (
        <p className="px-6 py-5 text-sm text-merah">{details.error.message}</p>
      ) : !isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

            <div className="flex items-center gap-2">
              <UserStatusLabel status={user.status} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Active work owned
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 rounded-xl border border-line-soft p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                    <ClipboardList size={13} />
                    <span className="text-xs">Pipelines owned</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    {ownership.pipelines_owned}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-line-soft p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                    <Briefcase size={13} />
                    <span className="text-xs">Tasks assigned</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    {ownership.actions_assigned}
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleReassign}
              className="flex flex-col gap-3 rounded-xl border border-line-soft bg-gray-50 p-4 dark:bg-zinc-800/50"
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Reassign ownership
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Moves every pipeline/task above to a replacement owner and
                records the change (see the audit log).
              </p>
              <AppSelect
                selectId="offboard-new-owner"
                label="Reassign to"
                placeholder="Select user or team"
                value={newOwnerId}
                onChange={(v) => setNewOwnerId((v as string) ?? "")}
                options={ownerOptions}
              />
              <AppInput
                inputId="offboard-reason"
                label="Reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Offboarding — moving to replacement"
              />
              <AppButton
                type="submit"
                variant="primary"
                className="justify-center"
                disabled={isReassigning || !hasActiveWork}
              >
                {isReassigning && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Reassign ownership
              </AppButton>
              {!hasActiveWork && (
                <p className="text-xs text-gray-400">No active work to reassign.</p>
              )}
            </form>

            <p className="rounded-lg border border-line-soft bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              After deactivation, the user account remains but they lose
              access to the system. History and past attribution are kept.
            </p>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              onClick={handleClose}
            >
              Close
            </AppButton>
            <AppButton
              type="button"
              variant="primary"
              className="flex-1 justify-center"
              disabled={isDeactivating || user.status === "deactivated"}
              onClick={handleDeactivate}
            >
              {isDeactivating && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Deactivate user
            </AppButton>
          </div>
        </div>
      )}
    </SheetOS>
  );
}
