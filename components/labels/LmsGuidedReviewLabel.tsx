import Label from "@/components/labels/Label";
import type { LmsGuidedReviewStatus } from "@/apis/lms";
import { guidedReviewStyles } from "@/lib/lms-insights";

export default function LmsGuidedReviewLabel({
  status,
}: {
  status: LmsGuidedReviewStatus;
}) {
  const { label, variant } = guidedReviewStyles[status];
  return <Label variant={variant}>{label}</Label>;
}
