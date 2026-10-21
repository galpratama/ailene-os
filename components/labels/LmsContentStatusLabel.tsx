import type { LmsContentStatus } from "@/apis/lms";
import Label from "./Label";

export default function LmsContentStatusLabel({
  status,
}: {
  status: LmsContentStatus;
}) {
  return (
    <Label variant={status === "active" ? "hijau" : "gray"}>
      {status === "active" ? "Active" : "Inactive"}
    </Label>
  );
}
