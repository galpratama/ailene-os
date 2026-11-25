import type { HomeVariantKey } from "@/apis/analytics";
import Label, { type LabelVariant } from "@/components/labels/Label";

const variants: Record<HomeVariantKey, { label: string; color: LabelVariant }> = {
  a: { label: "Home A", color: "biru" },
  b: { label: "Home B", color: "hijau" },
};

// The A/B arms keep these colors everywhere: blue is the current home, green the redesign.
export const homeVariantColors: Record<HomeVariantKey, string> = { a: "var(--viz-4)", b: "var(--viz-1)" };

export default function HomeVariantLabel({ variant, className }: { variant: HomeVariantKey; className?: string }) {
  return (
    <Label variant={variants[variant].color} className={className}>
      {variants[variant].label}
    </Label>
  );
}
