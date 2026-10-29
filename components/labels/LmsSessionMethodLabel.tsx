import type { LmsSchedule } from "@/apis/lms";
import Label from "@/components/labels/Label";
import { MapPin, Video } from "lucide-react";

export default function LmsSessionMethodLabel({ method }: { method: LmsSchedule["method"] }) {
  return method === "online" ? (
    <Label variant="biru">
      <Video size={12} /> Online
    </Label>
  ) : (
    <Label variant="ungu">
      <MapPin size={12} /> Offline
    </Label>
  );
}
