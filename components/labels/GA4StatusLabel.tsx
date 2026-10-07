import Label, { type LabelVariant } from "@/components/labels/Label";

export type GA4Status = "connecting" | "connected" | "unavailable";

const statusStyles: Record<GA4Status, { variant: LabelVariant; label: string }> = {
  connecting: { variant: "gray", label: "Connecting GA4" },
  connected: { variant: "hijau", label: "GA4 connected" },
  unavailable: { variant: "merah", label: "GA4 unavailable" },
};

export default function GA4StatusLabel({ status }: { status: GA4Status }) {
  const { variant, label } = statusStyles[status];

  return (
    <Label variant={variant} className="py-0.5 text-[11px]">
      {label}
    </Label>
  );
}
