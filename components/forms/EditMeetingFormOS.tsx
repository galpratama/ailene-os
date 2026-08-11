"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { B2BMeetingStatusEnum } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

export const meetingStatusOptions: AppSelectOption[] = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "HELD", label: "Held" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

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
  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const isOwnScoped = sessionData?.user.data_scope === "OWN";

  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState<B2BMeetingStatusEnum>("SCHEDULED");
  const [organizerId, setOrganizerId] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { data, isLoading: isLoadingMeeting } = trpc.read.b2b.meeting.useQuery(
    { id: meetingId ?? 0 },
    { enabled: !!sessionToken && isOpen && meetingId != null }
  );

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

  const meeting = data?.meeting;
  if (isOpen && meeting && meeting.id !== seededMeetingId) {
    setSeededMeetingId(meeting.id);
    setScheduledAt(toDateTimeLocalValue(meeting.scheduled_at));
    setStatus(meeting.status);
    setOrganizerId(meeting.organizer_id);
    setLocationOrLink(meeting.location_or_link ?? "");
    setNotes(meeting.notes ?? "");
  }

  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen && !isOwnScoped }
  );
  const organizerOptions: AppSelectOption[] =
    userData?.list.map((u) => ({ value: u.id, label: u.full_name })) ?? [];

  function handleClose() {
    setError(null);
    onClose();
  }

  const updateMeeting = trpc.update.b2b.meeting.useMutation({
    onSuccess: () => {
      utils.list.b2b.calendar.invalidate();
      utils.read.b2b.meeting.invalidate({ id: meetingId ?? 0 });
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  const deleteMeeting = trpc.delete.b2b.meeting.useMutation({
    onSuccess: () => {
      utils.list.b2b.calendar.invalidate();
      setIsConfirmingDelete(false);
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  function handleConfirmDelete() {
    if (meetingId == null) return;
    deleteMeeting.mutate({ id: meetingId });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!scheduledAt) return setError("Scheduled date & time is required.");
    if (meetingId == null) return;

    updateMeeting.mutate({
      id: meetingId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      status,
      organizer_id: isOwnScoped ? undefined : organizerId || undefined,
      location_or_link: locationOrLink.trim() || null,
      notes: notes.trim() || null,
    });
  }

  const isReady = !isLoadingMeeting && !!meeting;

  return [
    <SheetOS
      key="edit-meeting"
      title="Edit Meeting"
      description="Update this meeting's schedule and outcome."
      isOpen={isOpen}
      onClose={handleClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {meeting.company_name} · {meeting.pipeline_name}
            </p>

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
                onChange={(v) => setStatus(v as B2BMeetingStatusEnum)}
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

            <AppInput
              inputId="edit-meeting-location"
              label="Location / Link"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="e.g. Google Meet link or office address"
            />

            <AppTextArea
              textAreaId="edit-meeting-notes"
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
              size="icon"
              title="Delete meeting"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
              disabled={deleteMeeting.isPending}
              onClick={() => setIsConfirmingDelete(true)}
            >
              {deleteMeeting.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </AppButton>
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
              disabled={updateMeeting.isPending}
            >
              {updateMeeting.isPending && (
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
      isPending={deleteMeeting.isPending}
    />,
  ];
}
