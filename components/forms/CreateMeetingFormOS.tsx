"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

interface CreateMeetingFormOSProps {
  sessionToken: string;
  // When omitted, the form shows its own Pipeline picker (Company - Pipeline)
  // instead of assuming an ambient pipeline — same convention as CreateActionFormOS.
  pipelineId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMeetingFormOS({
  sessionToken,
  pipelineId,
  isOpen,
  onClose,
}: CreateMeetingFormOSProps) {
  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const isOwnScoped = sessionData?.user.data_scope === "OWN";

  const [scheduledAt, setScheduledAt] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen && !isOwnScoped }
  );
  const organizerOptions: AppSelectOption[] = [
    { value: "", label: "Me" },
    ...(userData?.list.map((u) => ({ value: u.id, label: u.full_name })) ?? []),
  ];

  const needsPipelinePicker = pipelineId === undefined;
  const { data: pipelineData } = trpc.list.b2b.pipelines.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen && needsPipelinePicker }
  );
  const pipelineOptions: AppSelectOption[] =
    pipelineData?.list.map((p) => ({
      value: p.id,
      label: `${p.company_name} - ${p.name}`,
    })) ?? [];

  function resetForm() {
    setScheduledAt("");
    setOrganizerId("");
    setLocationOrLink("");
    setNotes("");
    setSelectedPipelineId(null);
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const createMeeting = trpc.create.b2b.meeting.useMutation({
    onSuccess: () => {
      utils.list.b2b.calendar.invalidate();
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!scheduledAt) return setError("Scheduled date & time is required.");
    const targetPipelineId = pipelineId ?? selectedPipelineId;
    if (!targetPipelineId) return setError("Pipeline is required.");

    createMeeting.mutate({
      pipeline_id: targetPipelineId,
      organizer_id: organizerId || undefined,
      scheduled_at: new Date(scheduledAt).toISOString(),
      location_or_link: locationOrLink.trim() || null,
      notes: notes.trim() || null,
    });
  }

  return (
    <SheetOS
      title="Schedule Meeting"
      description={
        needsPipelinePicker
          ? "Schedule a meeting against a lead's pipeline."
          : "Schedule a meeting for this lead."
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

          {needsPipelinePicker && (
            <AppSelect
              selectId="meeting-pipeline"
              label="Pipeline"
              required
              placeholder="Pick a pipeline"
              value={selectedPipelineId}
              onChange={(v) => setSelectedPipelineId(v as number | null)}
              options={pipelineOptions}
            />
          )}

          <AppInput
            inputId="meeting-scheduled-at"
            label="Scheduled At"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          {!isOwnScoped && (
            <AppSelect
              selectId="meeting-organizer"
              label="Organizer"
              placeholder="Assign an organizer"
              value={organizerId}
              onChange={(v) => setOrganizerId((v as string) ?? "")}
              options={organizerOptions}
            />
          )}

          <AppInput
            inputId="meeting-location"
            label="Location / Link"
            value={locationOrLink}
            onChange={(e) => setLocationOrLink(e.target.value)}
            placeholder="e.g. Google Meet link or office address"
          />

          <AppTextArea
            textAreaId="meeting-notes"
            label="Notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional agenda or context for this meeting..."
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
            disabled={createMeeting.isPending}
          >
            {createMeeting.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Schedule Meeting
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
