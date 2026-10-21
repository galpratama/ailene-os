import Label from "@/components/labels/Label";
import { formatScore, scoreVariant } from "@/lib/lms-insights";

export default function LmsScoreLabel({
  score,
  emptyLabel = "—",
}: {
  score: number | null;
  emptyLabel?: string;
}) {
  if (score === null) return <Label variant="gray">{emptyLabel}</Label>;
  return (
    <Label variant={scoreVariant(score)} className="tabular-nums">
      {formatScore(score)}
    </Label>
  );
}
