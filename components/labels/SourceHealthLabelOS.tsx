import type { RevenueSourceHealth } from "@/apis/revenue";
import Label, { type LabelVariant } from "@/components/labels/Label";

const statuses: Record<RevenueSourceHealth["status"], { variant: LabelVariant; label: string }> = {
  healthy: { variant: "hijau", label: "Healthy" },
  lagging: { variant: "kuning", label: "Lagging" },
  not_connected: { variant: "merah", label: "Not connected" },
};

export default function SourceHealthLabelOS({ status }: { status: RevenueSourceHealth["status"] }) {
  const style = statuses[status];
  return <Label variant={style.variant}>{style.label}</Label>;
}
