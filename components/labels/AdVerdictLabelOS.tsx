import type { AdVerdict } from "@/apis/revenue";
import Label, { type LabelVariant } from "@/components/labels/Label";

const verdicts: Record<AdVerdict, { variant: LabelVariant; label: string }> = {
  scale: { variant: "hijau", label: "Scale" },
  keep: { variant: "gray", label: "Keep" },
  cut: { variant: "merah", label: "Cut" },
  no_leads: { variant: "merah", label: "No leads" },
  too_little_data: { variant: "kuning", label: "Too little data" },
  no_spend: { variant: "gray", label: "No spend" },
};

export default function AdVerdictLabelOS({ verdict }: { verdict: AdVerdict }) {
  const style = verdicts[verdict];
  return <Label variant={style.variant}>{style.label}</Label>;
}
