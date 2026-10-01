"use client";

import AppButton from "@/components/buttons/AppButton";
import AppCheckbox from "@/components/fields/AppCheckbox";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { useSession } from "@/contexts/SessionContext";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";
import { useSalesPipelineList } from "@/hooks/useSalesPipelineList";
import { useUserList } from "@/hooks/useUserList";
import { createMeeting } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { reportMeetingSync } from "@/lib/meetings";
import { showErrorToast } from "@/lib/toast";
import { userSelectOption } from "@/lib/user-select-option";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

interface CreateMeetingFormOSProps {
  sessionToken: string;
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
  const queryClient = useQueryClient();

  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "OWN";

  const [scheduledAt, setScheduledAt] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [notes, setNotes] = useState("");
  const [addGoogleMeet, setAddGoogleMeet] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    null
  );

  const userList = useUserList(isOpen);
  const organizerOptions: AppSelectOption[] = [
    {
      value: "",
      label: "Me",
      avatar: sessionUser?.avatar ?? null,
      avatarName: sessionUser?.full_name,
    },
    ...userList.map(userSelectOption),
  ];

  // The Meet link is created on the organizer's calendar; only our own connection is visible here.
  const { data: connection } = useGoogleCalendarConnection(!!sessionToken && isOpen);
  const organizerIsMe = !organizerId || organizerId === sessionUser?.id;
  const meetUnavailable = organizerIsMe && connection?.connected === false;

  const needsPipelinePicker = pipelineId === undefined;
  const { data: pipelineData } = useSalesPipelineList(
    !!sessionToken && isOpen && needsPipelinePicker
  );
  const pipelineOptions: AppSelectOption[] =
    pipelineData?.map((p) => ({
      value: p.id,
      label: p.company_name,
    })) ?? [];

  function resetForm() {
    setScheduledAt("");
    setOrganizerId("");
    setLocationOrLink("");
    setNotes("");
    setAddGoogleMeet(false);
    setSelectedPipelineId(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const meetRequested = addGoogleMeet && !meetUnavailable;

  const mutation = useMutation({
    mutationFn: async (targetPipelineId: number) =>
      requireApiData(
        await createMeeting({
          pipeline_id: targetPipelineId,
          organizer_id: organizerId || null,
          scheduled_at: new Date(scheduledAt).toISOString(),
          location_or_link: meetRequested ? null : locationOrLink.trim() || null,
          notes: notes.trim() || null,
          add_google_meet: meetRequested,
        })
      ),
    onSuccess: async (meeting) => {
      reportMeetingSync(meeting, meetRequested);
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      handleClose();
    },
    onError: (error) => showErrorToast(error),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!scheduledAt) return showErrorToast("Scheduled date & time is required.");
    const targetPipelineId = pipelineId ?? selectedPipelineId;
    if (!targetPipelineId) return showErrorToast("Pipeline is required.");

    mutation.mutate(targetPipelineId);
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

          <AppCheckbox
            inputId="meeting-google-meet"
            label="Create a Google Meet link"
            checked={meetRequested}
            disabled={meetUnavailable}
            onChange={setAddGoogleMeet}
            hint={
              meetUnavailable ? (
                <>
                  Connect your Google Calendar in{" "}
                  <Link href="/settings" className="text-claude hover:underline">
                    Settings
                  </Link>{" "}
                  first.
                </>
              ) : (
                "Added to the organizer's Google Calendar event and saved as the meeting link."
              )
            }
          />

          {!meetRequested && (
            <AppInput
              inputId="meeting-location"
              label="Location / Link"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="e.g. office address or a meeting link"
            />
          )}

          <AppTextArea
            textAreaId="meeting-notes"
            label="Notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional agenda or context for this meeting..."
          />
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
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
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Schedule Meeting
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
