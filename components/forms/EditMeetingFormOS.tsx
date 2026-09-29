"use client";

import type { MeetingStatus } from "@/apis/meetings";
import AppButton from "@/components/buttons/AppButton";
import AppCheckbox from "@/components/fields/AppCheckbox";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { useSession } from "@/contexts/SessionContext";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";
import { useUserList } from "@/hooks/useUserList";
import { deleteMeeting, getMeetingDetails, updateMeeting } from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { isGoogleMeetLink, reportMeetingSync } from "@/lib/meetings";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

export const meetingStatusOptions: AppSelectOption[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "held", label: "Held" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const syncLabel: Record<string, string> = {
  not_synced: "Not on Google Calendar",
  synced: "Synced to Google Calendar",
  sync_failed: "Google Calendar sync failed",
};

interface EditMeetingFormOSProps {
  sessionToken: string;
  meetingId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

function toDateTimeLocalValue(value: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditMeetingFormOS({
  sessionToken,
  meetingId,
  isOpen,
  onClose,
}: EditMeetingFormOSProps) {
  const queryClient = useQueryClient();

  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "OWN";

  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState<MeetingStatus>("scheduled");
  const [organizerId, setOrganizerId] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [notes, setNotes] = useState("");
  const [addGoogleMeet, setAddGoogleMeet] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
    queryKey: ["meetings", "details", meetingId],
    queryFn: async () => requireApiData(await getMeetingDetails(meetingId!)),
    enabled: !!sessionToken && isOpen && meetingId != null,
  });

  // Seed the form once per meeting, adjusting state during render (React's
  // documented pattern for this) rather than in an effect. Reset the seeded
  // marker on close so re-opening the same meeting always reverts to its
  // saved values instead of leaving stale in-progress edits behind.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [seededMeetingId, setSeededMeetingId] = useState<number | null>(null);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setSeededMeetingId(null);
  }

  if (isOpen && meeting && meeting.id !== seededMeetingId) {
    setSeededMeetingId(meeting.id);
    setScheduledAt(toDateTimeLocalValue(meeting.scheduled_at));
    setStatus(meeting.status);
    setOrganizerId(meeting.organizer_id);
    setLocationOrLink(meeting.location_or_link ?? "");
    setNotes(meeting.notes ?? "");
    setAddGoogleMeet(false);
  }

  const userList = useUserList(isOpen && !isOwnScoped);
  const organizerOptions: AppSelectOption[] =
    userList.map((u) => ({ value: u.id, label: u.full_name })) ?? [];

  const { data: connection } = useGoogleCalendarConnection(!!sessionToken && isOpen);
  const hasMeetLink = isGoogleMeetLink(locationOrLink);
  const organizerIsMe = organizerId === sessionUser?.id;
  const meetUnavailable = organizerIsMe && connection?.connected === false;
  const meetRequested = addGoogleMeet && !meetUnavailable && !hasMeetLink && status !== "cancelled";

  async function invalidateMeetings() {
    await queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }

  const updateMutation = useMutation({
    mutationFn: async (id: number) =>
      requireApiData(
        await updateMeeting({
          id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          status,
          organizer_id: isOwnScoped ? null : organizerId || null,
          location_or_link: meetRequested ? null : locationOrLink.trim() || null,
          notes: notes.trim() || null,
          add_google_meet: meetRequested,
        })
      ),
    onSuccess: async (saved) => {
      reportMeetingSync(saved, meetRequested);
      await invalidateMeetings();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => requireApiSuccess(await deleteMeeting(id)),
    onSuccess: (_data, id) => {
      setIsConfirmingDelete(false);
      onClose();
      // Drop the deleted meeting's details first: refetching them 404s and React Query retries with backoff for ~7s.
      queryClient.removeQueries({ queryKey: ["meetings", "details", id], exact: true });
      void invalidateMeetings();
    },
    onError: (error) => showErrorToast(error),
  });

  function handleConfirmDelete() {
    if (meetingId == null) return;
    deleteMutation.mutate(meetingId);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!scheduledAt) return showErrorToast("Scheduled date & time is required.");
    if (meetingId == null) return;

    updateMutation.mutate(meetingId);
  }

  const isReady = !isLoadingMeeting && !!meeting;

  return [
    <SheetOS
      key="edit-meeting"
      title="Edit Meeting"
      description="Update this meeting's schedule and outcome."
      isOpen={isOpen}
      onClose={onClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {meeting.company_name}
              </p>
              <p
                className={`text-xs ${
                  meeting.google_sync_status === "sync_failed"
                    ? "text-merah"
                    : "text-gray-400 dark:text-zinc-500"
                }`}
                title={meeting.google_sync_error ?? undefined}
              >
                {syncLabel[meeting.google_sync_status]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                inputId="edit-meeting-scheduled-at"
                label="Scheduled At"
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <AppSelect
                selectId="edit-meeting-status"
                label="Status"
                placeholder="Pick a status"
                value={status}
                onChange={(v) => setStatus(v as MeetingStatus)}
                options={meetingStatusOptions}
              />
            </div>

            {!isOwnScoped && (
              <AppSelect
                selectId="edit-meeting-organizer"
                label="Organizer"
                required
                placeholder="Pick an organizer"
                value={organizerId}
                onChange={(v) => setOrganizerId((v as string) ?? "")}
                options={organizerOptions}
              />
            )}

            {hasMeetLink ? (
              <a
                href={locationOrLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-claude hover:underline"
              >
                <ExternalLink size={14} />
                Join Google Meet
              </a>
            ) : (
              status !== "cancelled" && (
                <AppCheckbox
                  inputId="edit-meeting-google-meet"
                  label="Create a Google Meet link"
                  checked={meetRequested}
                  disabled={meetUnavailable}
                  onChange={setAddGoogleMeet}
                  hint={
                    meetUnavailable
                      ? "Connect your Google Calendar in Settings first."
                      : "Replaces the location below with a new Meet link."
                  }
                />
              )
            )}

            {!meetRequested && (
              <AppInput
                inputId="edit-meeting-location"
                label="Location / Link"
                value={locationOrLink}
                onChange={(e) => setLocationOrLink(e.target.value)}
                placeholder="e.g. office address or a meeting link"
              />
            )}

            <AppTextArea
              textAreaId="edit-meeting-notes"
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
              size="icon"
              title="Delete meeting"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
              disabled={deleteMutation.isPending}
              onClick={() => setIsConfirmingDelete(true)}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </AppButton>
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              onClick={onClose}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              className="flex-1 justify-center"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Save Changes
            </AppButton>
          </div>
        </form>
      )}
    </SheetOS>,
    <AlertConfirmationOS
      key="confirm-delete"
      isOpen={isConfirmingDelete}
      onClose={() => setIsConfirmingDelete(false)}
      onConfirm={handleConfirmDelete}
      title="Delete this meeting?"
      message={
        meeting
          ? `Delete the meeting scheduled for ${new Date(meeting.scheduled_at).toLocaleString()}? This can't be undone.`
          : ""
      }
      confirmLabel="Delete"
      destructive
      isPending={deleteMutation.isPending}
    />,
  ];
}
