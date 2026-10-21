import Label from "@/components/labels/Label";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function LmsUpliftLabel({ uplift }: { uplift: number | null }) {
  if (uplift === null) return <Label variant="gray">—</Label>;
  const up = uplift >= 0;
  return (
    <Label variant={uplift > 0 ? "hijau" : uplift === 0 ? "gray" : "merah"} className="tabular-nums">
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}
      {Number.isInteger(uplift) ? uplift : uplift.toFixed(1)} pts
    </Label>
  );
}
