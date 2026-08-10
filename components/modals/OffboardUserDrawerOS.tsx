"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import UserStatusLabel from "@/components/labels/UserStatusLabel";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { Briefcase, ClipboardList, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

interface OffboardUserDrawerOSProps {
  sessionToken: string;
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Shows a departing user's active work and lets an admin/manager reassign it before deactivating.
export default function OffboardUserDrawerOS({
  sessionToken,
  userId,
  isOpen,
  onClose,
}: OffboardUserDrawerOSProps) {
  const utils = trpc.useUtils();

  const [newOwnerId, setNewOwnerId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = trpc.read.userdata.user.useQuery(
    { id: userId ?? "" },
    { enabled: !!sessionToken && isOpen && userId != null }
  );
  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen }
  );

  const user = data?.user;
  const ownership = data?.ownership;
  const hasActiveWork =
    !!ownership && ownership.pipelines_owned + ownership.actions_assigned > 0;

  const ownerOptions: AppSelectOption[] =
    userData?.list
      .filter((u) => u.id !== userId)
      .map((u) => ({ value: u.id, label: u.full_name, image: u.avatar ?? undefined })) ??
    [];

  function handleClose() {
    setNewOwnerId("");
    setReason("");
    setError(null);
    onClose();
  }

  const reassignOwnership = trpc.update.userdata.reassignOwnership.useMutation();
  const updateStatus = trpc.update.userdata.status.useMutation();

  async function handleReassign(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!newOwnerId) return setError("Pick a replacement owner.");
    if (!reason.trim()) return setError("A reason is required.");

    try {
      await reassignOwnership.mutateAsync({
        from_user_id: user.id,
        to_user_id: newOwnerId,
        reason: reason.trim(),
      });
      setNewOwnerId("");
      setReason("");
      utils.read.userdata.user.invalidate({ id: user.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reassign ownership.");
    }
  }

  async function handleDeactivate() {
    if (!user) return;
    setError(null);
    try {
      await updateStatus.mutateAsync({
        id: user.id,
        status: "DEACTIVATED",
        reason: reason.trim() || undefined,
      });
      utils.list.users.invalidate();
      utils.read.userdata.user.invalidate({ id: user.id });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate user.");
    }
  }

  const isReady = !isLoading && !!user && !!ownership;

  return (
    <SheetOS
      title="Offboard user"
      description={user ? `${user.full_name} · ${user.email}` : undefined}
      isOpen={isOpen}
      onClose={handleClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex items-center gap-2">
              <UserStatusLabel status={user.status} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Active work owned
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 rounded-xl border border-gray-200 p-3 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                    <ClipboardList size={13} />
                    <span className="text-xs">Pipelines owned</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    {ownership.pipelines_owned}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-gray-200 p-3 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                    <Briefcase size={13} />
                    <span className="text-xs">Actions assigned</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    {ownership.actions_assigned}
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleReassign}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Reassign ownership
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Moves every pipeline/action above to a replacement owner and
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
                disabled={reassignOwnership.isPending || !hasActiveWork}
              >
                {reassignOwnership.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Reassign ownership
              </AppButton>
              {!hasActiveWork && (
                <p className="text-xs text-gray-400">No active work to reassign.</p>
              )}
            </form>

            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              After deactivation, the user account remains but they lose
              access to the system. History and past attribution are kept.
            </p>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
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
              disabled={updateStatus.isPending || user.status === "DEACTIVATED"}
              onClick={handleDeactivate}
            >
              {updateStatus.isPending && (
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
