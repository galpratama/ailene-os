import type { MeetingData } from "@/apis/meetings";
import { toast } from "sonner";

export const GOOGLE_MEET_PREFIX = "https://meet.google.com/";

export function isGoogleMeetLink(value: string | null | undefined) {
  return !!value && value.startsWith(GOOGLE_MEET_PREFIX);
}

// The meeting is saved either way; this only says whether Google got it and the Meet link came back.
export function reportMeetingSync(meeting: MeetingData, requestedMeet: boolean) {
  if (meeting.google_sync_status === "sync_failed") {
    toast.warning("Meeting saved, but Google Calendar was not updated.", {
      description: meeting.google_sync_error ?? undefined,
    });
    return;
  }
  if (requestedMeet && !isGoogleMeetLink(meeting.location_or_link)) {
    toast.warning("Meeting saved, but Google did not return a Meet link.");
    return;
  }
  if (requestedMeet) {
    toast.success("Meeting saved with a Google Meet link.");
  }
}
