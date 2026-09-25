"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import SheetOS from "@/components/modals/SheetOS";
import { createLmsGroup, updateLmsGroup } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/status_code";
import type { LmsGroupEntry } from "@/apis/lms";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface LmsGroupFormOSProps {
  projectId: string;
  // `null` creates a new group; an entry renames it.
  group: LmsGroupEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LmsGroupFormOS({
  projectId,
  group,
  isOpen,
  onClose,
}: LmsGroupFormOSProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed the name whenever a different group (or "new") is opened, without an effect.
  const [seenGroup, setSeenGroup] = useState<LmsGroupEntry | null>(group);
  const [name, setName] = useState(group?.name ?? "");
  if (group !== seenGroup) {
    setSeenGroup(group);
    setName(group?.name ?? "");
    setError(null);
  }

  function handleClose() {
    setName(group?.name ?? "");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Group name is required.");

    setIsSubmitting(true);
    const result = group
      ? await updateLmsGroup({
          project_id: projectId,
          group_id: group.id,
          name: name.trim(),
        })
      : await createLmsGroup({ project_id: projectId, name: name.trim() });
    setIsSubmitting(false);

    if (!isSuccessStatus(result.status)) {
      return setError(result.message ?? "Failed to save group.");
    }

    router.refresh();
    setName("");
    onClose();
  }

  return (
    <SheetOS
      title={group ? "Rename group" : "New group"}
      description={
        group
          ? "Change how this group is named across the project."
          : "Create a group to organize members in this project."
      }
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <AppInput
            inputId="lms-group-name"
            label="Group name"
            required
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Finance"
          />
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={handleClose}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            className="flex-1 justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {group ? "Save changes" : "Create group"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
